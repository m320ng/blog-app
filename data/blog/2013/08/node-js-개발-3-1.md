---
title: "node.js 개발 (3-1)"
date: "2013-08-26"
categories: 
  - "code"
tags: 
  - "node"
  - "nodejs"
  - "javascript"
---

## 데이터 전송

프로그램내에서 쓰일 패킷의 스펙을 정의해보자.

복잡한 데이터를 전송하진 않을거 같으니 그냥 단순하게 n로 나누어도 될것같지만..

굳이 아래와같이 구성했다.

```
 * | LENGTH | HEADER | MASK  | DATA
 * +--------+--------+-------+--------------
 * | 2byte  | 2byte  | 2byte | ...
 * 
 * LENGTH: LENGTH와 HEADER까지 포함한 전체 총길이 (16-LE)
 * HEADER: 정의된 헤더 (16-LE)
 * MASK: LENGTH와 HEADER를 마스킹 (검증용)
 * DATA: 나머지 데이터
```

전송하고자하는 데이터에 6byte만 추가되었다. LENGTH가 2byte이므로 한패킷당 최대 64k까지만 전송이 가능하다.

socket data event내에서 다음과같이 패킷 정보를 얻을 수 있다.

```
socket.on('data', function(data) {
    var buffer = new Buffer(data);

    // packet data
    var length = buffer.readUInt16LE(0);
    var header = buffer.readUInt16LE(2);
    var mask = buffer.readUInt16LE(4);
    var data = buffer.slice(6);
});
```

tcp 데이터전송은 사실상 스트림이다. 실제 데이터는 _(buffer에 크기에 따라)_ 뭉쳐서 들어올수도 있고 패킷중간부가 잘려서 들어올수 있다.

이를 감안해서 내부버퍼에 계속해서 이어붙여가며 패킷정보가 완성될때마다 처리함수를 호출하여 처리한다.

```
onPacket: function(data) {
    var buffer = new Buffer(data);

    // packet data
    var length = buffer.readUInt16LE(0);
    var header = buffer.readUInt16LE(2);
    var mask = buffer.readUInt16LE(4);
    var data = buffer.slice(6);
});

...

onData: function(data) {
    var buffer = new Buffer(data);

    내부버퍼.append(buffer);

    loop(패킷정보를 추출할수 없을때까지) {
        var packet = 패킷추출(내부버퍼);

        this.onPacket(packet);

        내부버퍼 = 내부버퍼.slice(packet.length);  //추출된패킷을 자라냄
    }
}

...

// socket data event를 onData메소드에 연결
var self = this;
socket.on('data', function(data) {
    self.onData(data);
});
```

이와같은 작업은 소켓데이터를 처리하는 과정에서 매번 반복될테니 module화한다. socket대신 사용할 수 있도록 socket함수를 wrapping하고 EventEmitter를 상속받아서 event를 발생시키도록한다.

socket 이벤트는 그대로 재호출하고 패킷완성시 호출되는 packet\_data 이벤트를 추가한다.

이후 프로그램내에서 이 클래스를 소켓대신 이용하도록한다.

## 추가 고려사항

작은크기의 패킷이 대량으로 뭉쳐서 도착할경우 한번에 루프내에서 패킷을 처리하게 된다. 이런경우 한 이벤트내에 과다한 연산이 몰리게 될 수 있을거 같다.

결과적으로 socket내부수신버퍼를 빠르게 비우지 못하게되고 이는 네트워크 문제도 이어질수 있을거 같다.

패킷을 바로 처리하지 말고 채워진 패킷을 queue에 쌓아두고 별도의 woker가 이를 읽어서 처리하는 식으로 변경하도록 하자. ..언젠가는..

## 소스

**connection.js**

```
/**
 * connection.js
 * 
 * @require util
 * @event connect
 * @event packet
 * @event packet_error
 * @event close
 * @event error
 */

/**
 * 패킷의 구조
 *
 * | LENGTH | HEADER | MASK  | DATA
 * +--------+--------+-------+--------------
 * | 2byte  | 2byte  | 2byte | ...
 * 
 * LENGTH: LENGTH와 HEADER까지 포함한 전체 총길이 (16-LE)
 * HEADER: protocol.js 에 정의된 헤더 (16-LE)
 * MASK: LENGTH와 HEADER를 마스킹 (검증용)
 * DATA: 나머지 데이터
 */

// module
var util = require('util');

// include
var EventEmitter = require('events').EventEmitter;

// vars
var debug = false;

var Connection = function(socket) {
    // fields
    this.socket = socket;
    this.recvBuffer = null;
    this.recvBufferIdx = 0;

    // events
    var self = this;
    this.socket.on('connect', function() {
        self.onConnect();
    });
    this.socket.on('data', function(data) {
        self.onData(data);
    });
    this.socket.on('error', function(err) {
        self.onError(err);
    });
    this.socket.on('close', function() {
        self.onClose();
    });
}

util.inherits(Connection, EventEmitter);

util._extend(Connection.prototype, {
    /* socket 
    ------------------------------------------------------------------------------------ */
    write: function() {
        this.socket.write.apply(this.socket, arguments);
    },
    end: function() {
        this.socket.end.apply(this.socket, arguments);
    },
    resume: function() {
        this.socket.resume.apply(this.socket, arguments);
    },
    pause: function() {
        this.socket.pause.apply(this.socket, arguments);
    },

    /* method
    ------------------------------------------------------------------------------------ */
    close: function(header, data) {
        if (header) {
            var buffer = this.makePacket(header, data);
            this.socket.end(buffer);
        } else {
            this.socket.end();
        }
    },
    send: function(header, data) {
        var buffer = this.makePacket(header, data);
        this.socket.write(buffer);
    },
    makePacket: function(header, data) {
        if (data && !Buffer.isBuffer(data)) data = new Buffer(data);

        var dataLen = 0;
        if (data) dataLen = data.length;
        var buffer = new Buffer(2 + 2 + 2 + dataLen);
        buffer.writeUInt16LE(buffer.length, 0);
        buffer.writeUInt16LE(header, 2);
        buffer.writeUInt8(buffer.readUInt8(0)^buffer.readUInt8(2), 4);
        buffer.writeUInt8(buffer.readUInt8(1)^buffer.readUInt8(3), 5);
        if (data) data.copy(buffer, 6);
        return buffer;
    },

    /* event
    ------------------------------------------------------------------------------------ */
    onConnect: function() {
        this.emit('connect');
    },
    /**
     * 패킷이 완성되었을때 호출된다
     * @param packet Buffer
     */
    onPacket: function(packet) {
        if (debug) console.log('>>>>packet:', packet);

        var length = packet.readUInt16LE(0);
        var header = packet.readUInt16LE(2);
        var mask = packet.readUInt16LE(4);
        var data = packet.slice(6);

        this.emit('packet', header, data);
    },
    onData: function(data) {
        var buffer = new Buffer(data);

        if (debug) {
            console.log('buffer-length:',buffer.length);
            console.log(data);
            console.log(buffer);
        }

        if (this.recvBuffer != null && this.recvBuffer.length == 1) {
            buffer = Buffer.concat([this.recvBuffer, buffer]);
            this.recvBuffer = null;
            this.recvBufferIdx = 0;
        }

        if (this.recvBuffer==null) {
            if (buffer.length < 2) {
                this.recvBuffer = new Buffer(buffer);
                return;
            }

            var length = buffer.readUInt16LE(0);
            if (length < 6) {
                this.emit('packet_error', {
                    code: 'WRONGLEN',
                    message: '올바른 패킷이 아닙니다.'
                });
            }
            if (debug) console.log('>>>>packet-length:', length);
            this.recvBuffer = new Buffer(length);
            this.recvBufferIdx = 0;
        }

        var copied = buffer.copy(this.recvBuffer, this.recvBufferIdx);
        this.recvBufferIdx += copied;

        if (this.recvBufferIdx >= 4) {
            var header = this.recvBuffer.readUInt16LE(2);
            // header 검증
        }
        if (this.recvBufferIdx >= 6) {
            var length1 = this.recvBuffer.readUInt8(0);
            var length2 = this.recvBuffer.readUInt8(1);
            var header1 = this.recvBuffer.readUInt8(2);
            var header2 = this.recvBuffer.readUInt8(3);
            var mask1 = this.recvBuffer.readUInt8(4);
            var mask2 = this.recvBuffer.readUInt8(5);
            // mask
            if ((length1^header1) != mask1 || (length2^header2) != mask2) {
                this.emit('packet_error', {
                    code: 'WRONGMASK',
                    message: '올바른 패킷이 아닙니다.'
                });
            }
        }

        if (this.recvBufferIdx==this.recvBuffer.length) {
            if (this.recvBuffer.length >= 6) {
                this.onPacket(this.recvBuffer);
            }

            if (debug) console.log('recv <= null');
            this.recvBuffer = null;
            this.recvBufferIdx = 0;
        }

        if (copied < buffer.length) {
            buffer = buffer.slice(copied);
            this.onData(buffer);
        }
    },
    onError: function(err) {
        this.emit('error', err);
    },
    onClose: function() {
        this.emit('close');
        this.socket = null;
    }
});

module.exports = Connection;
```
