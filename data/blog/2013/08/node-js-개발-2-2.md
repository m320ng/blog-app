---
title: "node.js 개발 (2)"
date: "2013-08-18"
categories: 
  - "code"
tags: 
  - "node"
  - "nodejs"
  - "javascript"
---

## 간단한 echo 서버/클라이언트

_server.js_

```
/**
 * server.js
 * echo server
 * 
 * @require net
 */

var net = require('net');
var os = require('os');

var server = net.createServer();
var sockets = [];

console.log(os.platform());
console.log(os.arch());
console.log(os.totalmem());
console.log(os.freemem());
console.log(os.cpus());
console.log(os.networkInterfaces());

server.on('connection', function(socket) {
    console.log('Connect');

    socket.setEncoding('utf8');

    socket.write("나가려면 '/q'n");
    sockets.push(socket);

    console.log('Client Count:', sockets.length);

    socket.on('data', function(data) {
        console.log('수신데이터:', data.toString());
        if (data.trim().toLowerCase()=='/q') {
            socket.write('bye');
            return socket.end();
        }

        sockets.forEach(function(otherSocket) {
            if (otherSocket != socket) {
                otherSocket.write(data);
            }
        });
    });

    socket.on('error', function(err) {
        console.log('socket err:', err.message);
    });

    socket.on('close', function() {
        console.log('Socket Close');
        var index = sockets.indexOf(socket);
        sockets.splice(index, 1);
    });
});

server.on('error', function(err) {
    console.log('servererr:', err.message);
});

server.on('close', function(err) {
    console.log('Server Close');
});

server.listen(4001);
```

_client.js_

```
/**
 * client.js
 * 테스트client
 * 
 * @require net
 */

// module
var net = require('net');

// vars
var port = 4001;
var conn = null;

var retryInterval = 3000;
var retriedTimes = 0;
var maxRetries = 10;

process.stdin.resume();

(function connect() {
    function reconnect() {
        if (retriedTimes >= maxRetries) {
            throw new Error('최대 재시도 횟수 최과. 재접속 포기');
        }
        retriedTimes++;
        setTimeout(connect, retryInterval);
    }

    conn = net.createConnection(port);

    conn.on('connect', function() {
        console.log('새 커넥션');
        retriedTimes = 0;
    });

    conn.on('data', function(data) {
        console.log('->', data.toString());
    });

    conn.on('error', function(err) {
        console.log('err:' + err.message);
    });

    conn.on('close', function() {
        console.log('컨넥션 닫힘');
    });

    process.stdin.pipe(conn, {end: false});

}());
```

## 기타 설명

require()

CommonJS에서 명세된 모듈을 불러들이는 함수. 각각의 모듈은 require로 호출하여 사용한다. 각각의 모듈의 scope는 분리되어있다. 모듈간의 데이터는 전역객체인 exports를 이용하여 전달한다. => require의 return값은 해당 모듈의 exports가 된다.

Array.prototype.forEach()

ECMAScript 5에 추가된 내용으로 Javascript기준으로 1.6에 추가되었다.
