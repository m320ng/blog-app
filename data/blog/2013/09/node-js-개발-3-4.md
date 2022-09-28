---
title: "node.js 개발 (3-4)"
date: "2013-09-04"
categories: 
  - "code"
tags: 
  - "nodejs"
---

# Server 구현

## User의 Stage

```
/**
 * server/stage.js
 * 각종 스테이지들
 *
 */

 // module
var util = require('util');

// include
var proto = require('../common/protocol');
var utils = require('../common/utils');

// init
var InitStage = function(user) {
    this.name = 'Init';
    this.user = user;
}
util._extend(InitStage.prototype,   {
    start : function() {
    },

    recvConnect: function() {
        this.sendConnect();
        this.user.goLogin();
    },

    sendConnect: function() {
        this.user.send(proto.PK_CONNECT, 'OK');
    },

    clientLink: function(header, data) {
        if (header == proto.PK_CONNECT) {
            this.recvConnect();
        }
    }
});

// in login
var LoginStage = function(user) {
    this.name = 'Login';
    this.user = user;
}
util._extend(LoginStage.prototype,  {
    start : function() {
    },

    recvLogin: function(name) {
        this.user.nickname = name;
        this.user.logined = true;

        var err = this.user.goLobby();
        this.sendLogin(err);
    },

    sendChat: function(talker, message) {
        this.user.send(proto.PK_LOBBY_CHAT, {name:talker.nickname, message:message});
    },
    sendLogin: function(err) {
        if (!err) {
            this.user.send(proto.PK_LOGIN, 'OK');
        } else {
            this.user.send(proto.PK_LOGIN, ret);
        }
    },

    clientLink: function(header, data) {
        if (header == proto.PK_LOGIN) {
            var name = data.toString('utf-8');
            this.recvLogin(name);
        }
    }
});

// in lobby
var LobbyStage = function(user) {
    this.name = 'Lobby';
    this.user = user;
}
util._extend(LobbyStage.prototype,  {
    start : function() {
    },

    recvLobbyChat: function(message) {
        this.user.lobby.chat(this.user, message);
    },

    clientLink: function(header, data) {
        if (header == proto.PK_LOBBY_CHAT) {
            var message = data.toString('utf-8');
            this.recvLobbyChat(message);
        }
    }
});

module.exports = {
    InitStage: InitStage,
    LoginStage: LoginStage,
    LobbyStage: LobbyStage,
}
```
