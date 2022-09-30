---
title: '어셈블리어 튜토리얼 (7) Window 프로그램'
date: '2017-02-22'
categories:
  - 'code'
  - 'hacking'
tags:
  - 'asm'
  - '어셈블리'
  - 'api-hooking'
  - '리버스-엔지니어링'
---

## 2.3. Window 프로그램

**win.asm**

간단한 윈도우 프로그램이다. win32 프로그래밍(c/c++)을 다뤄봤다면 바로 이해할 수 있을 정도로 소스가 흡사할 것이다. 어차피 같은 라이브러리에서 windows api를 쓰는데다 앞서 설명한 _.if .while invoke_ 등의 지시어를 이용하기 때문이다.

위도우 프로그래밍을 하려고 하는게 아니니 이것이 어떻게 동작하는지는 꼭 이해할 필요는 없을 것 같다.

```nasm
.686
.model flat, stdcall
option casemap:none

include c:\masm32\include\windows.inc
include c:\masm32\include\kernel32.inc
include c:\masm32\include\user32.inc
include c:\masm32\include\gdi32.inc

includelib c:\masm32\lib\kernel32.lib
includelib c:\masm32\lib\user32.lib
includelib c:\masm32\lib\gdi32.lib

.data
szClass         byte "test",0
szCaption       byte "test",0

.code
start:
invoke GetModuleHandle, NULL
push eax
invoke GetCommandLine
push eax
call WinMain
invoke ExitProcess, 0

WinMain proc, hInstance:HINSTANCE, lpCmdLine:LPSTR
    local wc:WNDCLASSEX
    local msg:MSG

    mov wc.cbSize, sizeof WNDCLASSEX
    mov wc.style, CS_HREDRAW or CS_VREDRAW
    mov wc.lpfnWndProc, offset WndProc
    mov wc.cbClsExtra, 0
    mov wc.cbWndExtra, 0
    push hInstance
    pop wc.hInstance
    invoke LoadIcon, NULL, IDI_APPLICATION
    mov wc.hIcon, eax
    invoke LoadCursor, NULL, IDC_ARROW
    mov wc.hCursor, eax
    mov wc.hbrBackground, COLOR_WINDOW+1
    mov wc.lpszMenuName, NULL
    mov wc.lpszClassName, offset szClass
    mov wc.hIconSm, NULL

    ; 윈도우 클래스 등록
    invoke RegisterClassEx, addr wc

    ; 윈도우 생성
    invoke CreateWindowEx, NULL,
        addr szClass,
        addr szCaption,
        WS_OVERLAPPEDWINDOW,
        0, 0, 320, 240,
        NULL,
        NULL,
        hInstance,
        NULL

    ; 메세지 펌프 (WndProc가 계속 실행된다고 이해하면 된다)
    .while TRUE
        invoke GetMessage, addr msg, 0, 0, 0
        .break .if eax==0
        invoke DispatchMessage, addr msg
    .endw

    mov eax, msg.wParam
    ret
WinMain endp

WndProc proc hWnd:dword, uMsg:dword, wParam:dword, lParam:dword
    local hdc:HDC
    local ps:PAINTSTRUCT
    local rt:RECT
    local pen:HPEN

    .if uMsg==WM_CREATE
        invoke ShowWindow, hWnd, SW_NORMAL
        invoke UpdateWindow, hWnd
    .elseif uMsg==WM_PAINT
        invoke BeginPaint, hWnd, addr ps
        mov hdc, eax

        mov rt.left, 10 ; (10, 10, 298, 190)
        mov rt.top, 10
        mov rt.right, 298
        mov rt.bottom, 190

        invoke GetStockObject, DC_PEN
        mov pen, eax
        invoke SelectObject, hdc, pen
        invoke SetDCPenColor, hdc, 000000ffh
        invoke Rectangle, hdc, rt.left, rt.top, rt.right, rt.bottom

        mov eax, DT_CENTER  ; DT_CENTER | DT_VCENTER | DT_SINGLELINE
        or eax, DT_VCENTER
        or eax, DT_SINGLELINE
        ; mov eax, DT_CENTER or DT_VCENTER or DT_SINGLELINE
        invoke DrawText, hdc, addr szCaption, -1, addr rt, eax

        invoke EndPaint, hWnd, addr ps
    .elseif uMsg==WM_DESTROY
        invoke PostQuitMessage, 0
    .else
        invoke DefWindowProc, hWnd, uMsg, wParam, lParam
        ret
    .endif
    xor eax, eax
    ret
WndProc endp

end start
```

`include c:\masm32\include\windows.inc` 윈도우 프로그래밍에 필요한 상수, 타입, 함수등이 정의되어 있다. 윈도우 프로그래밍(c/c++)을 할때에도 같은것이 정의된 `windows.h` 를 include 하는데 그것이 asm 용으로 convert 되었다고 생각해도 될 것 같다.

윈도우 프로그래밍에서 기본적으로 쓰이는 `LPSTR, HINSTANCE, LPARAM`등과 같은 타입과 `IDI_APPLICATION, WS_OVERLAPPEDWINDOW, NULL`등과 같은 상수, `CreateWindowEx, GetMessage, DefWindowProc`등과 같은 함수가 정의되어 있다. (정확히는 함수의 선언만)

`LPSTR, HINSTANCE, LPARAM`와 같은 타입은 전부 dword 이다. 윈도우 프로그래밍에선 각 타입별로 의미를 부여해서 사용하고 있고 컴파일단에서 걸러주고 있다. 그래서 다른 타입으로 변환하려면 형변환(casting)을 거쳐야하고 dowrd 값과 메모리주소값(포인터)는 형변환을 할 수 없는 경우도 있다. **asm에선 그냥 전부 dword로 다뤄도 상관없다.** asm에서는 **데이터의 크기**만 검사한다. (dword, word, byte)

`windows.inc` 파일을 열어서 살펴보면 아래와 같이 전부 dword로 정의하고있다.

```nasm
HKEY                        typedef DWORD
HKL                         typedef DWORD
HLOCAL                      typedef DWORD
HMENU                       typedef DWORD
HMETAFILE                   typedef DWORD
```

`include c:\masm32\include\gdi32.inc` 그래픽 관련 windows api 이다. 여기서는 펜을 선택하고 사각형을 그리는 `SetDCPenColor, Rectangle`등의 api를 이용했다.

`WinMain proc, hInstance:HINSTANCE, lpCmdLine:LPSTR` 윈도우 프로그래밍의 시작함수이다. 원래 윈도우 프로그래밍에서는 시작되는 함수 WinMain 함수명과 파라메터가 정해져있다. asm에서는 그런게 없기 때문에 :start 에서 직접 WinMain을 호출 하고 있다.

원도우 프로그래밍에서 사용하는 타입 HINSTANCE, LPSTR 을 마춰서 선언하였다. 앞서 설명했듯이 `WinMain proc, hInstance:dword, lpCmdLine:dword` 그냥 기본 타입인 dword로 선언해도 무방하다. 앞으로 대부분 소스는 이렇게 기본타입인 dword 로 선언하도록 하겠다.

```nasm
local wc:WNDCLASSEX
local msg:MSG
```

지역변수이다. 여기서 WNDCLASSEX, MSG 자료형은 조금 특이한데 구조체(struct)라는 것이다. 여러가지 타입(dword, word, byte)가 섞인 배열이라고 이해하면 된다. WNDCLASSEX 를 선언한 곳을 보면 아래와 같다.

```nasm
WNDCLASSEX STRUCT
  cbSize            DWORD      ?
  style             DWORD      ?
  lpfnWndProc       DWORD      ?
  cbClsExtra        DWORD      ?
  cbWndExtra        DWORD      ?
  hInstance         DWORD      ?
  hIcon             DWORD      ?
  hCursor           DWORD      ?
  hbrBackground     DWORD      ?
  lpszMenuName      DWORD      ?
  lpszClassName     DWORD      ?
  hIconSm           DWORD      ?
WNDCLASSEX ENDS
```

이렇게 12개의 dword 값이 저장되는 배열이다. `local wc:dword 12 dup(?)` 이렇게 dword 배열로 선언해도 같은 크기의 값으로 상관은 없다. 어차피 12개의 dword, dword가 4byte이므로 총 48byte의 스택메모리공간을 갖을뿐이다. 다만 값을 설정할때 3번째에 있는 `lpfnWndProc` 에 값을 설정한다고 가정할 때 이런정도의 차이가 있겠다.

```nasm
; struct로 선언했을때
mov wc.lpfnWndProc, 00403000h

; dword 배열로 선언했을때
mov wc[2 * sizeof dword], 00403000h
```

당연히 struct를 사용하게는게 훨씬 쉽고 직관적이니 struct를 사용하는 것 뿐이다.

`mov wc.style, CS_HREDRAW or CS_VREDRAW` 마치 mov 명령어와 or 명령어가 혼합되서 사용된 것 처럼 보이는데, 사실 mov 명령어만 사용된 것이다. `CS_HREDRAW or CS_VREDRAW` 는 실제 CS_VREDRAW값 1h 와 CS_HREDRAW값 2h 의 or 연산 결과값 3h 으로 입력된다.

```nasm
move wc.style, 3h
; 이렇게 되는 것이다.
```

이렇게 or 로 복수의 옵션을 입력하는 방법은 or 명령어 설명할때 설명했다. 아래는 관련 옵션값들이다. 2진수로 바꿔서 일전에 설명을 살펴보면 이해하기 쉬울 것이다.

```nasm
CS_VREDRAW                           equ 1h
CS_HREDRAW                           equ 2h
CS_KEYCVTWINDOW                      equ 4h
CS_DBLCLKS                           equ 8h
CS_OWNDC                             equ 20h
CS_CLASSDC                           equ 40h
CS_PARENTDC                          equ 80h
CS_NOKEYCVT                          equ 100h
CS_NOCLOSE                           equ 200h
CS_SAVEBITS                          equ 800h
```

위의 mov 명령어는 당연히 아래처럼 명령어 2줄로 바꿀 수 도 있겠다.

```nasm
mov wc.style, CS_HREDRAW
or wc.style, CS_VREDRAW
```

이때는 당연히 진짜 어셈블리 2줄이다.

```nasm
push hInstance
pop wc.hInstance
```

push, pop 명령어 설명할때 잠깐 설명했던 레지스터 안쓰고 메모리값간의 값 복사방법이다.

```nasm
push hInstance
pop wc.hInstance
```

레지스터 eax를 이용해여 복사해도 무방하다.

```nasm
mov eax, hInstance
mov wc.hInstance, eax
```

참고로 이야기하면 다른 레지스터와 달리 **eax** 는 언제든 자유롭게 이용할 수 있다. 함수 반환값에 이용되기 때문에 언제든 변경 될 수 있다고 가정해야하기에 eax 레지스터는 프로그램에 영향을 못미친다. 반대로 eax 레지스터를 제외한 레지스터는 일전에 설명했듯이 백업/복구 과정없이 막 사용하게되면 프로그램에 영향을 미칠수 있고 이것은 곧 프로그램의 예기치못한 종료를 부른다.

```nasm
invoke RegisterClassEx, addr wc
```

앞서 설명한 invoke를 이용해 RegisterClassEx 함수를 호출하는 구문이다. 파라메터에 **addr** 이라는 것이 처음 나왔는데 로컬변수 wc 의 메모리주소값을 알아내려고 사용된다. 일전에 전역변수같은 경우 offset을 이용해서 메모리주소값을 구했는데 로컬변수에는 offset을 사용할 수 없기때문에 addr을 사용한다. addr같은 경우 어셈블리 명령어는 아니고 invoke와 마찬가지로 지시어이다. invoke 와 항상 함께 사용된다.

실제 어셈블리에서는

```nasm
lea eax, wc
push eax
call RegisterClassEx
```

이렇게 `lea`를 이용하여 지역변수의 메모리주소값을 복사해서 push 한다.

addr은 지역변수 뿐만아니라 전역변수에서도 사용할수 있는데 이때는 그냥 offset 쓴것과 똑같이 사용된다. 해서 addr은 지역변수 전역변수 구분없이 변수의 메모리주소값을 파라메터로 전달할때 사용된다. 이점을 이해하면 이후에는 편하게 addr을 사용하면 된다.

```nasm
invoke CreateWindowEx, NULL,
    addr szClass,
    addr szCaption,
    WS_OVERLAPPEDWINDOW,
    0, 0, 320, 240,
    NULL,
    NULL,
    hInstance,
    NULL
```

파라메터가 굉장히 많다. 전역변수에도 편하게 addr을 사용했다. 물론 전역변수이기에 offset을 사용해도 된다.

```nasm
.while TRUE
    invoke GetMessage, addr msg, 0, 0, 0
    .break .if eax==0
    invoke DispatchMessage, addr msg
.endw
```

`.while TRUE` 무한 루프다. `.break .if eax==0` GetMessage 의 반환값 eax 가 0이면 무한루프를 탈출한다. 한줄로 표현할때 이렇게 뒤에 붙인다. 정확하게 풀어쓰면

```nasm
.if eax == 0
    .break
.endif
```

이렇게 되겠다. 이제 WndProc 함수를 보도록 하자.

`.elseif uMsg==WM_PAINT` else if 구문이다. 이정도로 어셈블리 명령어로는 대부분 설명한거 같다. 사각형을 그리고 글자를 그리는 구문이 대부분인데 이 부분은 윈도우 api 사용하는 부분이므로 관심이 있다면 따로 살펴보면 되겠다.

```
c:\masm32\bin\ml /c /coff win.asm
c:\masm32\bin\link /subsystem:windows win.obj
```

컴파일/링크 부분이다. 윈도우 프로그램이기때문에 `/subsystem` 에 console 대신 windows 로 바뀌었다.

실행하면 아래와 같이 간단한 위도우 창이 나타날 것이다.

다음에는 마지막으로 DLL 에 관해서 살펴보고 이후에 리버스 엔지니어링쪽으로 넘어가도록 하겠다.

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리어 튜토리얼 (6) memcpy, strcmp](http://note.heyo.me/?p=1076)
