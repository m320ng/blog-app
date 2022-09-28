---
title: "어셈블리어 튜토리얼 (5) HelloWorld"
date: "2017-02-13"
categories: 
  - "code"
  - "hacking"
tags: 
  - "asm"
  - "어셈블리"
  - "api-hooking"
  - "리버스-엔지니어링"
---

# 2\. 기초 튜토리얼

몇가지 예제 프로그램을 만들어보면서 어셈블리어를 연습해보겠다.

간단한 프로그램들로 어셈블리 명령어와 레지스터를 쓴다는것만 빼면 c프로그래밍과 비슷할 것이다.

## 2.1. HelloWorld

콘솔창에 "hello world" 를 출력하는 간단한 프로그램이다.

**helloworld.asm**

```x86asm
.686
.model flat, stdcall
option casemap :none

include c:\masm32\include\kernel32.inc
include c:\masm32\include\msvcrt.inc
includelib c:\masm32\lib\kernel32.lib
includelib c:\masm32\lib\msvcrt.lib

.data
szHelloWorld        byte "hello world",0

.code
start:
    push offset szHelloWorld
    call crt_printf

    ; exit
    push 0
    call ExitProcess

end start
```

`.686` 프로세서 스펙이다. `.386, .486, .586, .686`등을 선택할 수 있다. 뒤로갈 수록 몇가지 명령어를 더 지원한다는데 큰 의미없다.

우리가 쓰는 모든 명령어는 `.386` 으로도 잘 동작한다. 그렇다고 굳이 `.386`을 쓸필요는 없을거 같고 그냥 앞으로 모든 소스는 `.686`을 사용하겠다.

`.model flat, stdcall` flat은 메모리모델인데 역시 의미없다. 32비트 프로그래밍에서는 메모리모델이 flat밖에 없다.

`stdcall` 함수 호출 규격이다. `stdcall, c` 둘 중 하나를 선택할 수 있다.

둘의 차이는 **함수에 파라메터**를 넘길때 `스텍메모리`에 `파마메터`를 `push` 하고 함수를 `call` 하는데

이 스택메모리 정리를 함수에서 하느냐 아니면 함수를 호출한 쪽에서 하느냐의 차이이다.

`stdcall`는 함수쪽에서 스택메모리(파라메터)를 정리하고

`c`는 함수를 호출한 쪽에서 스택메모리(파라메터)를 정리한다.

`option casemap :none` 이 지시어는 변수 함수의 대소문자를 감지하게 해준다.

```x86asm
.686
.model flat, stdcall
option casemap :none
```

이 3줄은 그냥 단순하게 MASM(32비트) 소스에선 항상 제일위에 붙인다고 생각하면 될 거 같다.

`include c:\masm32\include\kernel32.inc` 는 `kernel32.dll`에 있는 함수를 사용할 수 있도록 함수 선언이 되어있는 inc 파일을 포함한다는 의미이다. 소스파일이니 한번 살펴봐도 될 듯하다.

여기서는 kernel32.dll 의 ExitProcess 함수를 이용하기위해 include 했다.

`include c:\masm32\include\msvcrt.inc` 는 마찬가지로 `msvcrt.dll` 내에 `crt_printf` 를 사용하기우해 include 했다.

`includelib c:\masm32\lib\kernel32.lib` 는 library파일을 include하는건데 inc파일과 세트로 쓰인다고 생각하면된다.

asm 소스파일을 exe파일로 만들때 어셈블리어 먼저 `ml.exe` 로 컴파일해서 obj파일를 만든다. 그리고 링커 `link.exe` 로 obj파일을 exe로 만드는데 이때 lib파일이 사용된다.

이런식으로 asm 소스상에서 includelib을 할 수있지만

`link.exe` 로 exe파일을 만들때 옵션으로 추가해줘도 된다.

`.data` 데이터 섹션(section)을 나타낸다. 보통 이 아래에는 전역변수가 선언된다. 실제로 exe파일은 여러 섹션(section)으로 나누어져있는데 여려 섹션중 `.data` 섹션으로 만들어진다.

`szHelloWorld byte "hello world",0` 전역변수이다. `szHelloWorld`가 **전역변수** 명이다. 그 뒤에 나오는 `byte` 는 데이터 형태이다. `byte, word, dword` 일전에 설명한 적이 있다. `db, dw, dd`로 쓰일 수 도 있다.

```
; byte => db
; word => dw
; dword => dd

szHelloWorld db "hello world",0 ; 이렇게 선언할 수 도 있다.
```

`byte` 뒤에 나오는 `"hello world",0` 는 문자열 값이다.

이렇게 문자열형식으로 "으로 묶을 수도 있고 ,로 붙일 수 도 있다. 모두 배열을 표현하는 방식이라고 생각하면된다.

```x86asm
szHelloWorld db "hello world",0
szHelloWorld db "h","e","l","l","o"," ","w","o","r","l","d",0 ; 문자 하나하나 ,로
szHelloWorld db 68h,65h,6Ch,6Ch,6Fh,20h,77h,6Fh,72h,6Ch,64h,0 ; 16진수 
; 모두 같은 값을 나타낸다.

; szHelloWorld 의 메모리 주소값이 00403000라면
; 메모리 덤프창에서 확인해보면 아래와 같다.
주소     | hex                                             | ascii
00403000 | 68 65 6C 6C 6F 20 77 6F 72 6C 64 00 00 00 00 00 | hello world  
```

`.code`이 지시어 아래부터는 어셈블리 명령어가 들어가는 영역이다. 앞서말한 `.data`는 .data섹션에 들어가는데 `.code`는 .text섹션에 들어간다.

`start:` 위치를 나타내는 라벨이다. c언어에서 label을 생각하면 똑같다.

어셈블리에서도 `jmp start` 이런식의 라벨로 쓸 수 있다.

이 라벨을 이용해서 라벨위치의 메모리주소를 구할 수 도 있다.

```x86asm
mov eax, offset start
```

이 소스에서는 시작지점을 나타낸다. 소스 마지막에 나오는 `end start` end 지시어에 start라고 쓰여있는데 이것으로 시작점이 정해진다.

`link.exe`로 exe파일을 만들때 `/entry` 옵션으로 특정 label로 시작점을 정할 수도 있다.

`push offset szHelloWorld` 드디어 첫 어셈블리 명령어이다.

이미 이전에 많이 봤던 명령어일 것이다. 전역변수 `szHelloWorld`의 메모리주소를 스택메모리에 `push` 한다. 뒤에 나오는 함수의 파라메터로써 push 된 것이다.

`call crt_printf` crt\_printf 함수를 호출한다. msvcrt.dll에 있는 함수로 콘솔에 문자열을 출력해주는 함수이다. 첫번째 파라메터로 `szHelloWorld`를 입력하였다.

"hello world"가 콘솔창에 출력될 것 이다.

```x86asm
push 0
call ExitProcess
```

프로그램 종료함수이다. kernel32.dll에 있는 함수로 큰의미는 없고 프로그램을 종료할 때 사용한다고 생각하면된다.

`end start` end가 소스의 마지막을 나타낸다. 그 옆에 start는 시작점을 나타낸다.

이제 소스파일을 모두 설명하였다.

이 소스파일을 exe파일로 만드는 명령어는 아래와 같다.

```
c:\masm32\bin\ml /c /coff helloworld.asm
c:\masm32\bin\link /subsystem:console helloworld.obj
```

`ml.exe` 로 asm소스파일을 obj파일을 만든다.

`link.exe` 로 obj파일을 exe파일로 만든다.

asm 소스의 기본적인 구조를 확인하기 위해 간단한 helloworld 프로그램을 만들어 보았다.

다음에는 함수를 포함하고 어셈블리코드들이 많이 있는 몇가지 예제를 살펴보겠다.

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리어 튜토리얼 (4) 명령어 상세설명2](http://note.heyo.me/?p=1193)
