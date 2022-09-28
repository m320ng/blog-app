---
title: "node.js 개발 (1)"
date: "2013-08-18"
categories: 
  - "code"
tags: 
  - "node"
  - "nodejs"
  - "javascript"
---

# node.js 개발

node.js를 공부하며 정리하는 글.

대략적인 순서는

1. node.js 소개
    
2. 간단한 echo 서버/클라이언트
    
    node.js의 간단한 사용법
    
3. 간단한 게임서버 (기존소스_(c++)_ 에서 변환위주로)
    
    기존의 소켓프로그래밍을 컨버젼하면서 대체할수 있는지 여부를 판단
    
4. 웹소켓 구현
    
5. 웹소켓으로 게임서버 전환
    

이어서 html5개발로 html5 캔버스/웹소켓을 이용한 게임클라이언트 제작

* * *

## node.js 소개

node.js는 javascript언어를 이용하여 쉽고 빠르게 네트워크 어플리케이션을 제작할수 있도록 만들어진 플랫폼이다.

java나 c/c++로만 가능했던 서버 네트워크 프로그래밍을 javascript만 알고 있으면 누구나 할 수 있게 해준다.

jquery, prototype, extjs 같은 library를 다뤄봤다면 더 쉽게 접근 할 수 있다.

혹여 javascript를 모른다고 하더라도 언어자체가 쉬운언어이므로 쉽게 공부하며 배울수 있겠다.

그외 자세한 내용은

[http://nodejs.org](http://nodejs.org)

## 그외 특징

CommonJS 준수

javascript 표준 명세중 하나인 CommonJS. 다른 표준으로 AMD가 있다.

event-driven

이벤트기반 프로그래밍. 프로그램의 흐름을 이벤트가 결정한다. 해서 비동기 프로그래밍이기도하다.

non-blocking i/o

모든 I/O가 non-blocking을 기본으로 하고있다. _(blocking i/o도 제공하고있다)_

npm(Node Packaged Modules)

node 프로그램을 패키지형태로 배포할 수 있다(or 받을 수 있다). npm 명령어로 쉽게 install/update 가 가능하며 의존성 구성(dependencies)이 쉽게 가능하다.
