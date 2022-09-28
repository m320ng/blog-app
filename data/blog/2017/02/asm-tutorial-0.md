---
title: "어셈블리어 튜토리얼 (0) 목차"
date: "2017-02-07"
categories: 
  - "code"
  - "hacking"
tags: 
  - "asm"
  - "어셈블리"
  - "api-hooking"
  - "리버스-엔지니어링"
---

# 어셈블리어(리버스 엔지니어링) 튜토리얼 정리

근래에 64비트 어셈블리에 관심이 생긴 겸사겸사 3년전에 정리하려고했던 asm, api hooking, binary patch등을 정리해보려고한다.

어셈블리는 리버스 엔지니어링에 필요한 최소한의 기초적인 어셈블리만 다룰려고 한다.

c/c++ 언어 기초적인 지식이 있으면 좀 더 쉽게 이해 할 수 있을거 같다.

그리고 앞으로 나오는 대부분의 숫자는 대부분 16진수이다.

## 진행방향

1. 시작 1.1. [설치](http://note.heyo.me/asm-tutorial-1-설치기초) 1.2. [기초명령어](http://note.heyo.me/asm-tutorial-1-설치기초) 1.3. [기초레지스터](http://note.heyo.me/asm-tutorial-1-설치기초) 1.4. [데이터타입](http://note.heyo.me/asm-tutorial-1-설치기초) 1.5. [명령어 사용방법](http://note.heyo.me/asm-tutorial-1-설치기초) 1.6. [디버거](http://note.heyo.me/asm-tutorial-2-명령어-예제) (어셈블리, 덤프, 스택메모리, 리틀엔디안) 1.7. [헥스에디터](http://note.heyo.me/asm-tutorial-2-명령어-예제) (exe파일과 메모리) 1.8. 명령어 상세설명 [#1](http://note.heyo.me/어셈블리-튜토리얼-3-명령어-상세설명) [#2](http://note.heyo.me/어셈블리어-튜토리얼-4-명령어-상세설명2) (디버거 활용, 함수 설명)
    
2. 기초 튜토리얼 2.1. [HelloWorld](http://note.heyo.me/어셈블리어-튜토리얼-5-helloworld) 2.2. [memcpy, strcmp](http://note.heyo.me/어셈블리어-튜토리얼-6-memcpy-strcmp) 2.3. [Window 프로그램](http://note.heyo.me/어셈블리어-튜토리얼-7-window-프로그램) 2.4. [DLL 라이브러리](http://note.heyo.me/어셈블리어-튜토리얼-8-dll-프로그램)
    
3. 리버스 엔지니어링 (1) 3.1. [DLL Injection(WinHook)](http://note.heyo.me/어셈블리어-튜토리얼-9-dll-injection-winhook) 3.2. [api hooking(IAT)](http://note.heyo.me/어셈블리어-튜토리얼-10-api-hooking-iat) 3.3. [api hooking(Trampoline)](http://note.heyo.me/어셈블리어-튜토리얼-11-ap…oking-trampoline) 3.4. [speed hack](http://note.heyo.me/어셈블리어-튜토리얼-12-speed-hack) 3.5. [post sniffing](http://note.heyo.me/어셈블리어-튜토리얼-13-post-sniffing)
    
4. 64비트 4.1. [32비트와 달라진점](http://note.heyo.me/어셈블리어-튜토리얼-14-64비트) 4.2. [설치](http://note.heyo.me/어셈블리어-튜토리얼-14-64비트) 4.3. [HelloWorld](http://note.heyo.me/어셈블리어-튜토리얼-14-64비트) 4.4. [DLL Injection(WinHook)](http://note.heyo.me/어셈블리-튜토리얼-15-64비트-dll-injection) 4.5. [api hooking(IAT)](http://note.heyo.me/어셈블리-튜토리얼-16-64비트-api-hooking-iat) 4.6. [api hooking(Trampoline)](http://note.heyo.me/어셈블리-튜토리얼-17-64비트-api-hooking-trampoline)
    
5. 리버스 엔지니어링 (2) 5.1 바이너리 패치 5.2 ShellCode 5.3 바이러스
    

목차는 작성하면서 계속 변경될 예정이다.
