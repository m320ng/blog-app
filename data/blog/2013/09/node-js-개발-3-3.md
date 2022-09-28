---
title: "node.js 개발 (3-3)"
date: "2013-09-04"
categories: 
  - "code"
tags: 
  - "nodejs"
---

# Server 구현 (2)

## User와 Lobby

## 소스

_user.js_

```
/**
 * server/user.js
 * 사용자
 */

// module
var util = require('util');

// include
var proto = require('../common/protocol');
var InitStage = require('./stage').InitStage;
var LoginStage = require('./stage').LoginStage;
var LobbyStage = require('./stage').LobbyStage;

var User = function(world, conn) {
    this.conn = conn;

    this.world = world;
    this.lobby = world.lobby;
    this.logined = false;
    this.name = '';
    this.id = '';
    this.point = 0;

    this.stageList = [];
    this.stage = new InitStage(this);
};

User.prototype = {
    light: function() {
        var user = {
            id: this.id,
            logined: this.logined,
            name: this.name,
            nickname: this.nickname
        }
        return user;
    },
    end: function() {
        this.conn.close();
    },
    leaveWorld: function() {
        if (this.room) this.room.leave(this);
        this.lobby.leave(this);
        this.world.leave(this);
        console.log('bye bye~');
    },
    nextStage: function(stage) {
        this.stageList.push(this.stage);
        this.stage = stage;
        this.stage.start();
    },
    rollbackStage: function() {
        if (this.stageList) {
            this.stage = this.stageList.pop();
        }
    },
    send: function(header, data) {
        console.log('send:', header, data);
        if (!header) {
            console.log('wrong header');
            return;
        }
        if (!this.conn) {
            console.log('closed socket');
            return;
        }
        if (typeof data == 'object') {
            if (!Buffer.isBuffer(data)) {
                data = JSON.stringify(data);
            }
        }
        this.conn.send(header, data);
    }, 
    goLogin: function() {
        this.nextStage(new LoginStage(this));
        return true;
    },
    goLobby: function() {
        this.nextStage(new LobbyStage(this));
        var err = this.lobby.enter(this);
        if (err) this.rollbackStage();
        return err;
    },

    // connection
    onPacket: function(header, data) {
        //console.log('User:parsePacket', data);
        console.log('stage-name:'+this.stage.name);
        this.stage.clientLink(header, data);
    },
    onPacketError: function(err) {
        console.log('packet_error:', err);
        this.conn.close(proto.PK_CRITICALERROR);
        this.conn.pause();
    },
    onError: function(err) {
        console.log('socket error:', err);
        if (err.code != 'ECONNRESET') {
            this.conn.close(proto.PK_CRITICALERROR);
        }
        this.conn.pause();
    },
    onClose: function() {
        console.log('socket closed');
        this.conn = null;
        this.leaveWorld();
    }
}

module.exports = User;
```

_lobby.js_

```
/**
 * lobby.js
 * 로비
 */

// module
var util = require('util');

// include
var proto = require('../common/protocol');
var PokerRoom = require('./poker_room');

var Lobby = function(world) {
    this.world = world;
    this.users = [];

    for (i=0; i<this.world.option.maxRoom; i++) {
        this.freeRoomNo.push(i+1);
    }
};

util._extend(Lobby.prototype, {
    broadcast: function(method, without) {
        this.users.forEach(function(other) {
            if (!without || other!=without) {
                method(other);
            }
        });
    },
    enter: function(user) {
        if (this.world.option.maxUser <= this.users.length) {
            return '현재 서버가 모두 찻습니다.';
        }
        this.users.push(user);
        return null;
    },
    leave: function(user) {
        var index = this.users.indexOf(user);
        this.users.splice(index, 1);
        return null;
    },
    chat: function(user, message) {
        this.broadcast(function(other) {
            other.stage.sendChat(user, message);
        }, user);
    }
});

module.exports = Lobby;
```
