---
title: '어셈블리어 튜토리얼 (8) DLL 프로그램'
date: '2017-02-23'
categories:
  - 'code'
  - 'hacking'
tags:
  - 'asm'
  - '어셈블리'
  - 'api-hooking'
  - '리버스-엔지니어링'
---

## 2.4. DLL

사용자 DLL 라이브러리를 다뤄보겠다. DLL 라이브러리를 만들기전에 먼저 DLL 를 호출하는 방법을 살펴보겠다.

앞서 DLL 라이브러리(windows api)를 사용할 때에는 **LIB파일(kernel32.lib, user32.lib, gdi32.lib)**을 이용해서 DLL 의 함수들을 호출했다. 이번에는 LIB파일 없이 직접 DLL 에서 함수를 얻어 호출하는 방법을 살펴보겠다.

**win.asm**

앞서 설명한 윈도우 프로그램이다. 바뀐부분은 gdi32.inc, gdi32.lib 를 include하지 않고 직접 **gdi32.dll** 에서 함수주소를 얻어서 사용하도록 바꿔보았다.

```nasm
.686
.model flat, stdcall
option casemap:none

include c:\masm32\include\windows.inc
include c:\masm32\include\kernel32.inc
include c:\masm32\include\user32.inc

includelib c:\masm32\lib\kernel32.lib
includelib c:\masm32\lib\user32.lib

.data
szClass         byte "test",0
szCaption       byte "test",0

; gdi32 관련
szGdiDll        byte "gdi32.dll",0
hGdiDll         dword 0
szGetStockObject    byte "GetStockObject",0
szSelectObject      byte "SelectObject",0
szSetDCPenColor     byte "SetDCPenColor",0
szRectangle     byte "Rectangle",0
lpGetStockObject    dword 0
lpSelectObject      dword 0
lpSetDCPenColor     dword 0
lpRectangle     dword 0

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

    ; gdi32.dll 로드
    invoke LoadLibrary, addr szGdiDll
    mov hGdiDll, eax

    ; gdi32.dll api 함수
    invoke GetProcAddress, hGdiDll, addr szGetStockObject
    mov lpGetStockObject, eax
    invoke GetProcAddress, hGdiDll, addr szSelectObject
    mov lpSelectObject, eax
    invoke GetProcAddress, hGdiDll, addr szSetDCPenColor
    mov lpSetDCPenColor, eax
    invoke GetProcAddress, hGdiDll, addr szRectangle
    mov lpRectangle, eax

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
        ; 윈도우 보이기
        invoke ShowWindow, hWnd, SW_NORMAL
        invoke UpdateWindow, hWnd

    .elseif uMsg==WM_PAINT
        invoke BeginPaint, hWnd, addr ps
        mov hdc, eax

        mov rt.left, 10 ; (10, 10, 298, 190)
        mov rt.top, 10
        mov rt.right, 298
        mov rt.bottom, 190

        push DC_PEN
        call lpGetStockObject
        mov pen, eax

        push pen
        push hdc
        call lpSelectObject

        push 000000ffh
        push hdc
        call lpSetDCPenColor

        push rt.bottom
        push rt.right
        push rt.top
        push rt.left
        push hdc
        call lpRectangle

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

`invoke LoadLibrary, addr szGdiDll` api 함수 **LoadLibrary**를 이용하여 `gdi32.dll`의 핸들값을 얻어온다. 이후에 이 핸들값은 함수주소를 얻을때 사용한다.

```nasm
invoke GetProcAddress, hGdiDll, addr szGetStockObject
mov lpGetStockObject, eax
```

**GetProcAddress** api 함수를 이용하여 "GetStockObject" 함수주소를 얻는다. 함수주소를 lpGetStockObject 에 저장한다. 이후 SelectObject, Rectangle 모두 이런식으로 함수주소를 얻어온다.

구해놓은 함수 주소를 `call lpGetStockObject` 이런식으로 직접 call 명령어를 이용하여 호출한다. 함수로 선언된것이 아니라 메모리주소값만 가지고 있는 변수이기 때문에 invoke 는 사용 할 수 없다.

이런식으로 LoadLibrary, GetProcAddress만 사용하면 어떤 DLL 이든 LIB파일이 없이도 런타임에서 함수를 이용할 수 있다. (LIB파일을 이용할때는 컴파일/링크를 거칠때만 가능하다.)

**mydll.asm**

기본적인 DLL 라이브러리 예제이다. 다른 프로그램에서 이용할 수 있는 함수 하나를 노출시켜보겠다. 기본 함수가 먼저 실행된다는 것만 제외하면 일반 프로그램과 다른 점이 없다.

DLL에서 노출하는 함수는 기본적으로 stdcall 함수콜 방식을 사용해야한다. (지금껏 stdcall만 써왔으니 큰 의미없다고 봐도 된다.)

link에서 exe파일을 만들때 DLL임을 명시하고 노출되는 함수를 명시한다.

```nasm
.686
.model flat, stdcall
option casemap:none
option dotname

include c:\masm32\include\windows.inc
include c:\masm32\macros\macros.asm
include c:\masm32\include\user32.inc
include c:\masm32\include\kernel32.inc

includelib c:\masm32\lib\user32.lib
includelib c:\masm32\lib\kernel32.lib

.data
szAttach            db "attach",0
szInfo              db "info",0

.data?
szVictim            byte 50 dup(?)

.code
DllEntry proc hInstance:HINSTANCE, reason:DWORD, reserved1:DWORD
    .if reason==DLL_PROCESS_ATTACH
        invoke MessageBoxA, NULL, offset szAttach, offset szInfo, MB_OK
    .elseif reason==DLL_PROCESS_DETACH
    .endif
    mov eax, TRUE
    ret
DllEntry Endp

; export functions
SetVictim proc, lpszVictim:dword
    invoke lstrcpy, offset szVictim, lpszVictim
    invoke MessageBoxA, NULL, offset szVictim, offset szInfo, MB_OK
    ret
SetVictim endp

end DllEntry
```

`DllEntry proc hInstance:HINSTANCE, reason:DWORD, reserved1:DWORD` 처음 호출되는 함수이다. `reason` 으로 DLL이 로드될 때와 언로드될 때를 구분한다.

여기서는 로드될때 (DLL_PROCESS_ATTACH) 간단하게 메세지박스를 띄워보았다. MessageBox api 함수가 메세지박스를 띄우는 함수이다.

`SetVictim proc, lpszVictim:dword` SetVictim 라는 함수를 정의했다. 노출시키고자하는 함수이지만 소스상에서는 일반함수와 차이점이 없다.

```
c:\masm32\bin\ml /c /coff mydll.asm
c:\masm32\bin\link /subsystem:windows /dll /DEF:dll.def mydll
```

link작업을 할 때 `/dll /DEF:dll.def`가 추가되었다. `/dll` 는 DLL 라이브러리 임을 나타낸다. exe 파일이 아닌 dll 파일이 생성된다.

`/DEF:dll.def` dll.def 파일을 이용하여 exe파일을 만든다. def파일에서는 많은 정의를 할 수 있지만 여기에서는 특정 함수를 외부로 노출시키기위해서 사용한다.

자세한 내용은 [모듈정의(.DEF) MSDN](https://msdn.microsoft.com/ko-kr/library/28d6s79h.aspx) 여기에 나와있지만.. 그냥 훑어보면 될거 같다.

_dll.def_

```
LIBRARY mydll
EXPORTS SetVictim
```

`LIBRARY mydll` dll 파일로 만들어질 이름이다. mydll.dll mydll.lib 파일이 생성된다.

`EXPORTS SetVictim` 외부에 노출할 함수명을 적는다. 여기서는 `SetVictim` 함수를 노출 시킨다. 이렇게 노출시키면 다른 프로그램에서 SetVictim 함수를 사용할 수 있다.

이것으로 윈도우 프로그램과 DLL 라이브러리 프로그램에 관해서 살펴보았다.

다음에는 리버스 엔지니어링의 시작으로써 타프로그램에서 내 소스를 실행하는 방법에 대해서 알아보자.

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리어 튜토리얼 (7) Window 프로그램](http://note.heyo.me/?p=1228)
