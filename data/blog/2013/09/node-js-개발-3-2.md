---
title: 'node.js 개발 (3-2)'
date: '2013-09-04'
categories:
  - 'code'
tags:
  - 'nodejs'
---

## Server 구현

아래와같이 net 모듈로 쉽게 서버를 구성할 수 있다.

```js
var server = net.createServer()
server.on('connection', function (socket) {
  console.log('connection')
})
server.on('error', function (err) {
  console.log('error')
})
server.on('close', function () {
  console.log('close')
})
server.listen(4001)
```

생성한 서버에 클라이언트가 접속하면 connection 이벤트가 호출되고 socket을 전단받는다. socket으로 Connection을 생성하여서 패킷 주고 받을 준비를 한다.

```js
var server = net.createServer()
server.on('connection', function (socket) {
  console.log('connection')
  var conn = new Connection(socket)

  conn.on('packet', function (header, data) {
    console.log('packet receive')
  })
  conn.on('packet_error', function (err) {
    console.log('packet receive')
  })
  conn.on('error', function (err) {
    console.log('socket error')
  })
  conn.on('close', function () {
    console.log('socket close')
  })
})
server.on('error', function (err) {
  console.log('error')
})
server.on('close', function () {
  console.log('close')
})
server.listen(4001)
```

이제 packet이벤트 안에서 클라이언트에서 보낸 패킷을 처리할 수 있다. 실제 패킷을 처리하고 데이터를 담아둘 User 클래스를 만들어보자.

```js
var User = function (conn) {
  this.conn = conn

  this.name = ''
  this.id = ''
}

User.prototype = {
  send: function (header, data) {
    this.conn.send(header, data)
  },

  // connection
  onPacket: function (header, data) {
    console.log('User:parsePacket', data)
  },
  onPacketError: function (err) {
    console.log('packet_error:', err)
    this.conn.close(proto.PK_CRITICALERROR)
    this.conn.pause()
  },
  onError: function (err) {
    console.log('socket error:', err)
    if (err.code != 'ECONNRESET') {
      this.conn.close(proto.PK_CRITICALERROR)
    }
    this.conn.pause()
  },
  onClose: function () {
    console.log('socket closed')
    this.conn = null
  },
}
```

이 클래스를 이용해서 Connection 이벤트를 User에서 처리하도록 한다.

```js
server.on('connection', function (socket) {
  console.log('connection')
  var conn = new Connection(socket)

  var user = new User(conn)
  user.name = 'anonymous'

  conn.on('packet', function (header, data) {
    user.onPacket(header, data)
  })
  conn.on('packet_error', function (err) {
    user.onPacketError(err)
  })
  conn.on('error', function (err) {
    user.onError(err)
  })
  conn.on('close', function () {
    user.onClose()
  })
})
```

살을 붙여서 Server 클래스를 만들어보자.

## 소스

_world.js_

```js
/**
 * world.js
 * 서버
 *
 * @require net
 */

// module
var net = require('net')
var util = require('util')

// include
var Connection = require('../common/connection')
var User = require('./user')

var World = function () {
  // 기본옵션
  this.option = {
    port: 8080,
    maxConnection: 10000,
    maxUser: 10000,
  }

  // 소켓서버
  this.server = net.createServer()

  // 유저목록
  this.users = []

  // server-event
  var self = this
  this.server.on('connection', function (socket) {
    self.onConnection(socket)
  })
  this.server.on('error', function (err) {
    console.log('err:', err.message)
    self.onError(err)
  })
  this.server.on('close', function () {
    self.onClose()
  })
}

util.inherits(World, require('events').EventEmitter)

util._extend(World.prototype, {
  config: function (option) {
    if (option) {
      util._extend(this.option, option)
    }
    console.log('## Setting ################################')
    console.log(this.option)
  },
  start: function () {
    console.log('## Start #################################')
    console.log('Welcome to the world~')

    this.server.listen(this.option.port)
    console.log('Listen:', this.option.port)
  },
  enter: function (user) {
    this.users.push(user)
    console.log('current user:' + this.users.length)
  },
  leave: function (user) {
    var index = this.users.indexOf(user)
    this.users.splice(index, 1)
    console.log('current user:' + this.users.length)
  },

  onConnection: function (socket) {
    var conn = new Connection(socket)
    if (this.option.maxConnection <= this.users.length) {
      conn.close(proto.PK_CRITICALERROR, 'max connection error')
      return
    }

    var user = new User(this, conn)
    this.enter(user)

    // socket-event
    var self = this
    conn.on('packet', function (header, data) {
      user.onPacket(header, data)
    })
    conn.on('packet_error', function (err) {
      user.onPacketError(err)
    })
    conn.on('error', function (err) {
      user.onError(err)
    })
    conn.on('close', function () {
      user.onClose()
    })
  },
  onError: function (err) {
    console.log('server error:', err.message)
  },
  onClose: function (close) {
    console.log('server close')
  },
})

module.exports = new World()
```

포트번호, 최대이용자수등 간단한 옵션과 사용자목록 관리내용을 추가하였다.

```js
require('./world').start()
```
