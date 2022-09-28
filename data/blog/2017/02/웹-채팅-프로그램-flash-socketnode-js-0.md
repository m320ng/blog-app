---
title: "웹 채팅 프로그램 (flash socket/node.js) (0)"
date: "2017-02-17"
categories: 
  - "code"
tags: 
  - "node-js"
  - "flash-socket"
  - "웹-채팅"
---

웹 채팅 프로그램을 만들어 보았다.

flash socket을 이용하여 클라이언트를 만들고

node.js를 이용하여 서버를 만들었다.

도메인단위로 해당 iframe만 넣으면 어디에도 쉽게 붙일수 있도록 구성하였다.

요즘에는 잘쓰이지 않는 flash socket을 이용하여 만들어봤다.

flash socket보다는 socket.io 쪽으로 만드는것이 더 쉽고 강력한 방법같긴한데..

(더우기 서버를 node.js로 구성했기에..)

소스도 있고 통신을 packet 단위로 다루고 싶기도 했고해서 만들어 보았다.

(사실 socket.io 도 websocket을 지원하지 않는 브라우저를 지원하기위에 flash socket을 활용한다)

아직 버그가 있는거 같은데 이 단순한 프로그램에도 버그가..ㅋ

정리 수정해서 올리도록 하겠다.

<iframe src="http://chat.heyo.me/" width="400" height="300" frameborder="0" scrolling="no"></iframe>
