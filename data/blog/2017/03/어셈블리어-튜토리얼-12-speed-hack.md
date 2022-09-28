---
title: "어셈블리어 튜토리얼 (12) speed hack"
date: "2017-03-20"
categories: 
  - "code"
  - "hacking"
tags: 
  - "asm"
  - "어셈블리"
  - "api-hooking"
  - "리버스-엔지니어링"
  - "speedhack"
  - "스패드핵"
---

## 3.5. speed hack

이번에는 **api hooking** 을 이용한 **스피드핵**이다.

프로그램에선 보통 컴퓨터 성능과 상관없는 일정한 운직임을 위해 장면의 `시간 간격(delta time)` 을 구해서 움직임에 사용한다.

예를 들어 이런것이다.

; Update함수는 장면을 그리는 함수 1. Update를 1초에 10번 호출할 수 있는 컴퓨터 (고성능) 2. Update를 1초에 5번 호출할 수 있는 컴퓨터 (저성능)

1번이 2번에 비해 **2배 성능**이 좋다. 1번의 `Update`의 시간간격은 **0.1초** 2번은 **0.2초**이다.

`Update`에서 물체가 x축으로 1포인트씩 이동한다고 코딩하면

```
Update:
    x = x + 1;
```

이럴경우 **1번**의경우 **1초에 10칸**을 이동하고 **2번**의 경우 **1초에 5칸**을 이동한다. 속도가 다르게된다. 이를 같게하기위해서 `시간간격(delta time)` 을 활용한다.

```
Update:
    x = x + (deltatime * 10)
```

이렇게 변경해보자. (deltatime은 이전 Update호출시간간격이다.)

1번은 `deltatime`이 0.1초이므로

```
x = x + (0.1 * 10)
```

2번은 `deltatime`이 0.2초이므로

```
x = x + (0.2 * 10)
```

둘다 **1초에 10칸**을 움직이게된다. 이런식으로 `delta time`이 활용된다.

만약 1번에서 `delta time`을 **0.2초로 조작**(delta time을 2배)하면 어떻게 될까. **10칸을 0.5초**만에 움직이게 된다. 속도가 **2배** 빨라지게 되는 것이다. 이를 이용한게 스피드핵이다.

이 delta time 에 관련된 **api 를 후킹**해서 deta time을 조작하는 것이다.

delta time에 관련된 api는 결국 시간을 측정하는 api인데 대표적으로 두가지가 있다.

`timeGetTime` `QuaterPerfomanceCounter` 후자가 훨씬 정밀한 측정 API이다. 그래서 대부분 후자를 사용한다. 여기서도 이것을 후킹해 보겠다.

게임에따라 다르겠지만 대부분 적용이 가능할것이다.

QuaterPerfomanceCounter를 이용해서 시간을 구하는 방법은 QuaterPerfomanceCounter로 구한 값을 QueryPerformanceFrequency로 구한 값으로 나누어주면된다. 자세한 내용은 [여기](https://msdn.microsoft.com/ko-kr/library/windows/desktop/ms644904(v=vs.85).aspx)(MSDN)에서 확인가능하다.

```
counter / frequency = 시간
```

둘다 후킹할 필요는 없고 우리는 어차피 시간간격의 값에 배수를 적용할 것이므로 deta time을 2배라고 가정했을경우 counter에 2를 곱해주거나 frequency에 2를 나눠주면 되겠다.

두함수 모두 값으로 `LARGE_INTEGER` 라는 구조체를 사용하는데 DWORD 두개를 가지고있는 구조체이다. 64비트(8byte)값을 표현하기 위한건데.. 그냥 DWORD 둘 다 곱하거나 나눠주면된다.

테스트는 스팀에서 무료로 할수있는 **The Expendabros**로 테스트하겠다. Broforce의 무료 프로모션 버젼으로 꽤나 재미있다.

[여기](http://store.steampowered.com/app/312990/)에서 무료로 다운받을 수 있다.

**apihook.asm**

앞서봤던 trampoline 예제와 똑같다. MessageBoxW대신 QuaterPerfomanceCounter를 후킹한다.

```x86asm
.686
.model flat, stdcall
option casemap:none

include c:\masm32\include\windows.inc
include c:\masm32\include\user32.inc
include c:\masm32\include\kernel32.inc
include c:\masm32\include\winmm.inc

includelib c:\masm32\lib\user32.lib
includelib c:\masm32\lib\kernel32.lib
includelib c:\masm32\lib\winmm.lib

LoadApiHook proto, lpszDll:dword, lpszProc:dword, lpTossProc:dword, lpTossJMP:dword
GetMsgProc proto, nCode:dword, wParam:dword, lParam:dword

MyMessageBoxW proto
MyQueryPerformanceCounter proto
MyQueryPerformanceFrequency proto

.data
szUSER32        db 'USER32.DLL',0
szMessageBoxW       db 'MessageBoxW',0

szKERNEL32          db 'KERNEL32.DLL',0
szQueryPerformanceCounter   db 'QueryPerformanceCounter',0
szQueryPerformanceFrequency db 'QueryPerformanceFrequency',0

.data?
szVictim            byte 50 dup(?)
hCBTHook            dword ?
hGlobalModule       dword ?

.code
DllEntry proc hInstance:HINSTANCE, reason:DWORD, reserved1:DWORD
    .if reason==DLL_PROCESS_ATTACH
        .if hGlobalModule==0
            push hInstance
            pop hGlobalModule
        .endif
        invoke GetModuleHandle, addr szVictim
        .if eax!=0
            invoke MessageBox, 0, addr szVictim, addr szVictim, 0

            ;mov eax, offset MyMessageBoxWJMP
            ;invoke LoadApiHook, addr szUSER32, addr szMessageBoxW, addr MyMessageBoxW, eax

            mov eax, offset MyQueryPerformanceCounterJMP
            invoke LoadApiHook, addr szKERNEL32, addr szQueryPerformanceCounter, addr MyQueryPerformanceCounter, eax

            ;둘중에 하나만 하면된다.
            ;mov eax, offset MyQueryPerformanceFrequencyJMP
            ;invoke LoadApiHook, addr szKERNEL32, addr szQueryPerformanceFrequency, addr MyQueryPerformanceFrequency, eax

        .endif
    .elseif reason==DLL_PROCESS_DETACH
        invoke GetModuleHandle, addr szVictim
    .endif
    mov eax, TRUE
    ret
DllEntry Endp

GetMsgProc proc, nCode:dword, wParam:dword, lParam:dword
    invoke CallNextHookEx, hCBTHook, nCode, wParam, lParam
    ret
GetMsgProc endp

ProtectMemCopy proc uses ecx, lpSrc:dword, lpDst:dword, count:dword, isExecute:dword
    local dwOrgProtect:dword
    local dwOrgProtectOld:dword
    local mbi:MEMORY_BASIC_INFORMATION

    invoke VirtualQuery, lpDst, addr mbi, sizeof mbi
    mov ecx, mbi.Protect
    and ecx, not PAGE_READONLY
    and ecx, not PAGE_EXECUTE_READ
    .if isExecute==0
        or ecx, PAGE_READWRITE
    .else
        or ecx, PAGE_EXECUTE_READWRITE
    .endif

    invoke VirtualProtect, lpDst, count, ecx, addr dwOrgProtect

    mov ecx, count
    mov esi, lpSrc
    mov edi, lpDst
    rep movsb

    invoke VirtualProtect, lpDst, count, dwOrgProtect, addr dwOrgProtectOld
    xor eax, eax

    ret
ProtectMemCopy endp

LoadApiHook proc uses esi edi ebx, lpszDll:dword, lpszProc:dword, lpTossProc:dword, lpTossJMP:dword
    local hModule:dword
    local lpOrgProc:dword

    local StubOrg[5]:byte
    local StubHook[5]:byte
    local OrgJmpStub[5]:byte

    invoke GetModuleHandle, lpszDll
    mov hModule, eax
    .if eax==0
        jmp LOAD_HOOK_EXIT
    .endif

    invoke GetProcAddress, hModule, lpszProc
    mov lpOrgProc, eax
    .if eax==0
        jmp LOAD_HOOK_EXIT
    .endif

    ; 원본 stub 백업
    invoke ProtectMemCopy, lpOrgProc, addr StubOrg, 5, 0

    ; Hook 함수로 점프하는 stub
    mov eax, lpTossProc
    sub eax, lpOrgProc
    sub eax, 5
    lea esi, StubHook
    mov byte ptr [esi], 0E9h ; E9 00 00 00 00
    mov dword ptr [esi + 1], eax

    ; hook stub으로 교체
    invoke ProtectMemCopy, addr StubHook, lpOrgProc, 5, 1

    ; 원본 stub 깔기
    invoke ProtectMemCopy, addr StubOrg, lpTossJMP, 5, 1

    ; 원본 함수로 점프하는 stub
    mov eax, lpOrgProc
    sub eax, lpTossJMP
    sub eax, 5
    lea esi, OrgJmpStub
    mov byte ptr [esi], 0E9h ; E9 00 00 00 00
    mov dword ptr [esi + 1], eax

    mov esi, lpTossJMP
    add esi, 5
    invoke ProtectMemCopy, addr OrgJmpStub, esi, 5, 1

LOAD_HOOK_EXIT:
    ret
LoadApiHook endp

; hook functions
MyMessageBoxW proc
    mov eax, esp
    push [eax+16]
    push [eax+12]
    push [eax+8]
    push [eax+4]
    call MyMessageBoxWJMP
    mov eax, IDCANCEL
    ret 16
MyMessageBoxW endp
MyMessageBoxWJMP:
    db 5 dup(90h) ;mov edi,edi / push ebp / mov ebp, esp
    db 5 dup(90h) ;jmp 0FFFFFFFFh (MessageBoxW address + 5)

MyQueryPerformanceCounter proc
    mov eax, esp
    push [eax+4]
    call MyQueryPerformanceCounterJMP
    .if eax==1
        mov eax, esp
        push ecx
        mov ecx, [eax+4]
        mov eax, [ecx+4]
        shl eax, 2
        mov [ecx+4], eax
        mov eax, [ecx]
        shl eax, 2
        mov [ecx], eax
        pop ecx
        mov eax, 1
    .endif

    ret 4
MyQueryPerformanceCounter endp
MyQueryPerformanceCounterJMP:
    db 5 dup(90h) ;mov edi,edi / push ebp / mov ebp, esp
    db 5 dup(90h) ;jmp 0FFFFFFFFh (QueryPerformanceCounter address + 5)

MyQueryPerformanceFrequency proc
    mov eax, esp
    push [eax+4]
    call MyQueryPerformanceFrequencyJMP
    .if eax==1
        mov eax, esp
        push ecx
        mov ecx, [eax+4]
        mov eax, [ecx]
        shr eax, 1
        mov [ecx], eax
        pop ecx
        mov eax, 1
    .endif

    ret 4
MyQueryPerformanceFrequency endp
MyQueryPerformanceFrequencyJMP:
    db 5 dup(90h) ;mov edi,edi / push ebp / mov ebp, esp
    db 5 dup(90h) ;jmp 0FFFFFFFFh (QueryPerformanceFrequency address + 5)

; export functions
SetVictim proc, lpszVictim:dword
    invoke lstrcpy, addr szVictim, lpszVictim

    ret
SetVictim endp

StartHook proc
    invoke SetWindowsHookEx, WH_CBT, addr GetMsgProc, hGlobalModule, NULL
    mov hCBTHook, eax
    ret
StartHook endp

EndHook proc
    .if hCBTHook!=0
        invoke UnhookWindowsHookEx, hCBTHook
    .endif
    ret
EndHook endp


end DllEntry
```

**MyQueryPerformanceCounter** 함수만 설명하도록하겠다.

```
mov eax, esp
push [eax+4]
call MyQueryPerformanceCounterJMP
```

원래의 API QueryPerformanceCounter를 호출한다. 파라메터가 하나뿐이니 `esp`를 직접사용해도 상관없겠다. `push [esp+4]` 여기서 파라메터는 LARGE\_INTEGER 구조체가 있는 주소값이다.

```
.if eax==1
    mov eax, esp
    push ecx
    mov ecx, [eax+4]
    mov eax, [ecx+4]
    shl eax, 2
    mov [ecx+4], eax
    mov eax, [ecx]
    shl eax, 2
    mov [ecx], eax
    pop ecx
    mov eax, 1
.endif
ret 4
```

리턴값이 1이면 정상적으로 호출된 것이다. 스택을 사용하기위해서 `esp`를 `eax`에 복사한다.

`push ecx` `ecx`를 사용하기위해서 원래의 값을 백업해둔다. 값을 수정하기위해 eax과 ecx를 사용할 것이다.

`mov ecx, [eax+4]` 파라메터값(LARGE\_INTEGER 구조체가 있는 주소값)을 `ecx`에 복사한다.

`mov eax, [ecx+4]` LARGE\_INTEGER구조체의 2번째 DWORD값을 `eax`에 복사한다.

`shl eax, 2` 시프트(왼쪽) 명령어이다. C에서는 표현하면 아래와같다.

```c
a = a << 2;
```

시프트(왼쪽) 명령어는 비트를 특정방향으로 이동시킨건데 간단하게 곱셈을 할때 자주 이용된다. 여기서는 4배(2의 2제곱) 곱셈한 것과 같다.

그냥 실제 곱셈 명령어 `mul`을 써도 상관없다.

```
mul 4
```

같은의미가 된다. `mul`명령어는 eax의 값을 계산하여 eax에 넣어준다.

`mov [ecx+4], eax` 곱한값을 LARGE\_INTEGER구조체의 2번째 DWORD에 넣어준다.

```
mov eax, [ecx]
shl eax, 2
mov [ecx], eax
```

위의 작업 반복이다. LARGE\_INTEGER구조체의 1번째 DWORD값을 4배한다.

`pop ecx` ecx값을 복구한다.

`mov eax, 1` 리턴값을 1로 설정한다.

**injector.asm**의 `szVictim` 값을 **Expendabros.exe**으로 변경한다. 게임의 실행파일명이다.

[![](images/steam.png)](http://note.heyo.me/wp-content/uploads/2017/03/steam.png)

테스트는 스팀에서 실행하면 된다.

\[youtube https://www.youtube.com/watch?v=32oPq90UB00&w=560&h=315\]

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리어 튜토리얼 (11) api hooking(Trampoline)](http://note.heyo.me/?p=1320)
