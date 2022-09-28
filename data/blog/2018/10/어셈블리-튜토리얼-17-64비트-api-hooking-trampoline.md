---
title: "어셈블리 튜토리얼 (17) 64비트 api hooking(Trampoline)"
date: "2018-10-07"
categories: 
  - "code"
  - "hacking"
tags: 
  - "asm"
  - "어셈블리"
  - "api-hooking"
  - "리버스-엔지니어링"
---

## 4.5. api hooking(Trampoline)

Trampoline은 IAT 방식과 달리 많이 복잡해졌다. **32비트와 달라진점** 에서 잠깐 설명했었듯이 64bit에서는 함수의 시작이 정형화되어있지 않다.

_32bit MessageBoxA 함수_

```x86asm
; 32bit stdcall 정형화된 함수시작 (5byte)
mov edi,edi
push ebp
mov ebp,esp
```

_64bit MessageBoxA 함수_

```x86asm
; 64bit fastcall 바로 구현이 시작되어 함수마다 모두 다르다.
sub rsp,38
xor r11d,r11d
cmp dword ptr ds:[7FFE1B2340B8],r11d
...
```

32bit에서는 `5byte`의 정형화된 함수시작코드를 가지는 반면 64bit에서는 바로 구현코드가 나오게된다. 때문에 잘라서 덮어쓸때 명령어가 잘리는 문제가 발생하게 된다.

예를 들어 위의 어셈블리코드를 바이트와 함께 다시보면

```x86asm
48 83 EC 38              | sub rsp,38
45 33 DB                 | xor r11d,r11d
44 39 1D DA 58 03 00     | cmp dword ptr ds:[7FFE1B2340B8],r11d
```

4byte 3byte 7byte 로 구성되어있다. 여기서 만약 5byte를 자른다면 두번째 명령어인 `xor r11d,r11d` 이 깨지게된다. 온전히 동작하는 단위로 자른다면 `7byte`로 잘라야한다.

이것은 기존의 32bit 소스에서 후킹한 함수뒤에 원래의 함수 시작부분(5byte)을 배치하여 자연스럽게 원래의 함수도 호출할 수 있게 처리한 것과도 관련을 갖는다.

때문에 기존의 방법처럼 동작하려면 후킹할 함수의 시작부분의 어셈블리코드를 분석해야하는 번거로움이 있다.

이를 해결하려면 다소 부하가 걸리더라도 후킹한 함수에서 매번 시작할때 원래 함수를 복원하고 종료부분에 다시 후킹을 거는 방법을 사용 할수도 있다. 이 방법은 추후에 설명하도록 하겠다.

먼저 기존의 방법대로 구현한 소스부터 살펴보자.

크게 두가지가 달라졌는데 첫번째는 위에서 설명한 5byte 대신 **온전히 동작하는 단위**를 입력해야 하는 부분. 두번째는 **함수로 점프하는 stub** 부분이 조금 복잡해졌다.

**apihook\_64.asm**

```x86asm
option casemap:none
;option frame:auto

include D:\WinInc208\Include\windows.inc
include D:\WinInc208\Include\winnt.inc
;include D:\WinInc208\Include\user32.inc
;include D:\WinInc208\Include\kernel32.inc

includelib user32.lib
includelib kernel32.lib
includelib winmm.lib

LoadApiHook proto, lpszDll:qword, lpszProc:qword, lpTossProc:qword, lpTossJMP:qword, orgStubCount:qword
GetMsgProc proto, nCode:dword, wParam:WPARAM, lParam:LPARAM

MyMessageBoxA proto

.data
szUSER32        db 'USER32.DLL',0
szMessageBoxA       db 'MessageBoxTimeoutA',0

.data?
szVictim            byte 50 dup(?)
hCBTHook            qword ?
hGlobalModule       qword ?

.code
DllEntry proc hInstance:HINSTANCE, reason:DWORD, dwReserved:DWORD
    mov hInstance, rcx
    mov reason, edx
    mov dwReserved, r9d

    .if reason==DLL_PROCESS_ATTACH
        .if hGlobalModule==0
            push hInstance
            pop hGlobalModule
        .endif
        ;invoke MessageBox, 0, addr szVictim, addr szVictim, 0
        invoke GetModuleHandle, addr szVictim
        .if rax!=0
            invoke MessageBoxA, NULL, addr szVictim, addr szVictim, MB_OK

            invoke LoadApiHook, addr szUSER32, addr szMessageBoxA, addr MyMessageBoxA, addr MyMessageBoxAJMP, 15
        .endif
    .elseif reason==DLL_PROCESS_DETACH
        invoke GetModuleHandle, addr szVictim
    .endif

    mov rax, TRUE
    ret
DllEntry Endp

GetMsgProc proc nCode:dword, wParam:WPARAM, lParam:LPARAM
    mov nCode, ecx
    mov wParam, rdx
    mov lParam, r8

    invoke CallNextHookEx, hCBTHook, nCode, wParam, lParam
    ret
GetMsgProc endp

ProtectMemCopy proc lpSrc:qword, lpDst:qword, count:qword, isExecute:qword
    local dwOrgProtect:dword
    local mbi:MEMORY_BASIC_INFORMATION

    mov lpSrc, rcx
    mov lpDst, rdx
    mov count, r8
    mov isExecute, r9

    invoke VirtualQuery, lpDst, addr mbi, sizeof mbi
    mov esi, mbi.Protect
    and esi, not PAGE_READONLY
    and esi, not PAGE_EXECUTE_READ
    .if isExecute==0
        or esi, PAGE_READWRITE
    .else
        or esi, PAGE_EXECUTE_READWRITE
    .endif

    invoke VirtualProtect, lpDst, count, esi, addr dwOrgProtect

    mov rcx, count
    mov rsi, lpSrc
    mov rdi, lpDst
    rep movsb

    invoke VirtualProtect, lpDst, count, dwOrgProtect, addr dwOrgProtect
    xor rax, rax

    ret
ProtectMemCopy endp

LoadApiHook proc uses rsi rdi, lpszDll:qword, lpszProc:qword, lpTossProc:qword, lpTossJMP:qword, orgStubCount:qword
    local hModule:qword
    local lpOrgProc:qword

    local StubOrg[32]:byte
    local StubHook[32]:byte
    local OrgJmpStub[14]:byte

    mov lpszDll, rcx
    mov lpszProc, rdx
    mov lpTossProc, r8
    mov lpTossJMP, r9

    invoke GetModuleHandle, lpszDll
    mov hModule, rax
    .if rax==0
        jmp LOAD_HOOK_EXIT
    .endif

    invoke GetProcAddress, hModule, lpszProc
    mov lpOrgProc, rax
    .if rax==0
        jmp LOAD_HOOK_EXIT
    .endif

    ; 원본 stub 백업
    invoke ProtectMemCopy, lpOrgProc, addr StubOrg, orgStubCount, 0

    ; Hook 함수로 점프하는 stub
    mov rax, lpTossProc
    ;sub rax, lpOrgProc
    ;sub rax, 14

    ; push 000000h ; 68 DWORD
    ; mov [rsp+4], 000000h ; c7 44 24 04 DWORD
    ; ret ; c3
    lea rsi, StubHook
    mov byte ptr [rsi], 68h
    mov dword ptr [rsi + 1], eax
    mov byte ptr [rsi + 5], 0c7h
    mov byte ptr [rsi + 6], 44h
    mov byte ptr [rsi + 7], 24h
    mov byte ptr [rsi + 8], 04h
    shr rax, 32
    mov dword ptr [rsi + 9], eax
    mov byte ptr [rsi + 13], 0c3h

    add rsi, 14
    mov rcx, orgStubCount
    sub rcx, 14
@@:
    mov byte ptr [rsi], 90h
    inc esi
    loop @b

    ; hook stub으로 교체
    invoke ProtectMemCopy, addr StubHook, lpOrgProc, orgStubCount, 0

    ; 원본 stub 깔기
    invoke ProtectMemCopy, addr StubOrg, lpTossJMP, orgStubCount, 1

    ; 원본 함수로 점프하는 stub
    ; push 000000h ; 68 DWORD
    ; mov [rsp+4], 000000h ; c7 44 24 04 DWORD
    ; ret ; c3
    mov rax, lpOrgProc
    add rax, orgStubCount
    lea rsi, OrgJmpStub
    mov byte ptr [rsi], 68h
    mov dword ptr [rsi + 1], eax
    mov byte ptr [rsi + 5], 0c7h
    mov byte ptr [rsi + 6], 44h
    mov byte ptr [rsi + 7], 24h
    mov byte ptr [rsi + 8], 04h
    shr rax, 32
    mov dword ptr [rsi + 9], eax
    mov byte ptr [rsi + 13], 0c3h

    mov rsi, lpTossJMP
    add rsi, orgStubCount
    invoke ProtectMemCopy, addr OrgJmpStub, rsi, 14, 1

    xor rax, rax

LOAD_HOOK_EXIT:
    ret
LoadApiHook endp

; export functions
SetVictim proc lpszVictim:qword
    mov lpszVictim, rcx
    invoke lstrcpy, addr szVictim, lpszVictim
    ret
SetVictim endp

StartHook proc
    invoke SetWindowsHookEx, WH_CBT, addr GetMsgProc, hGlobalModule, NULL
    mov hCBTHook, rax
    ret
StartHook endp

EndHook proc
    .if hCBTHook!=0
        invoke UnhookWindowsHookEx, hCBTHook
    .endif
    ret
EndHook endp

; hook functions
MyMessageBoxA proc
    sub rsp, 38h
    call MyMessageBoxAJMP
    add rsp, 38h
    mov rax, IDCANCEL
    ret

MyMessageBoxA endp
MyMessageBoxAJMP:
    db 32 dup(90h) ;org stub
    db 14 dup(90h) ;jmp

end DllEntry
```

먼저 함수로 점프하는 stub 부분을 보도록 하겠다.

```
; Hook 함수로 점프하는 stub 
; 원본 함수로 점프하는 stub
```

두 부분이다. 32bit에서는 `jmp 00000000` jmp코드로 간단하게 처리했었다.

```x86asm
; 32bit 구현부분
    mov byte ptr [esi], 0E9h ; E9 00 00 00 00 ; jmp 00000000
    mov dword ptr [esi + 1], eax
```

64bit에서는 64bit 주소로 바로 jmp하는 명령어가 없다.

```x86asm
; 64bit 주소로 jmp를 지원하지 않는다.
jmp 0000000000000000

; 레지스터를 이용해야한다.
mov rax, 0000000000000000
jmp rax
```

이런식으로 레지스터를 이용해야 한다. 레지스터를 쓰지 않고 jmp하는 방법으로 return을 이용하기도 한다.

```x86asm
; jmp 00401000 와 같다.
push 00401000
ret
```

그런데 jmp와 마찬가지로 64bit값(qword) 는 push 할수 없다. 역시 레지스터를 이용해야한다.

```x86asm
; 64bit 주소값을 push할수없다.
push 00007FFE1B1FEAFB
ret

; 이런식으로 가능
mov rax, 00007FFE1B1FEAFB
push rax
ret
```

레지스터 없이 사용하기위해 하위 dword를 push 하고 상위 dword를 복사한다.

```x86asm
; push 00007FFE1B1FEAFB와 같다.
push 1B1FEAFB
mov [rsp+4], 00007FFE
ret
```

여기에선 이 방법을 이용한다. 이 코드는 14byte이다. 그러므로 32bit의 5byte와 달리 **64bit에서는 14byte가 jmp구문이다.**

```x86asm
    mov rax, lpTossProc

    ; push 000000h ; 68 DWORD
    ; mov [rsp+4], 000000h ; c7 44 24 04 DWORD
    ; ret ; c3
    ; 5byte + 8byte + 1byte = 14byte 이다.

    ; 위의 코드대로 jmp구문을 만드는 부분
    lea rsi, StubHook
    mov byte ptr [rsi], 68h
    mov dword ptr [rsi + 1], eax ; 하위 dword 를 복사
    mov byte ptr [rsi + 5], 0c7h
    mov byte ptr [rsi + 6], 44h
    mov byte ptr [rsi + 7], 24h
    mov byte ptr [rsi + 8], 04h
    shr rax, 32 ; 32bit를 오른쪽으로 shift하여 상위 4byte를 eax쪽으로 이동시킨다.
    mov dword ptr [rsi + 9], eax ; 상위 dword 를 복사
    mov byte ptr [rsi + 13], 0c3h
```

이렇게 14byte짜리 점프 구문을 생성한다.

LoadApiHook 함수가 달라졌다. orgStubCount 파라메터가 추가되었다. 위에서 설명한 온전히 동작하는 단위이다. 여기서는 15를 넘겨주고 있다.

후킹하려는 함수 시작부분이다.

```x86asm
48 8B C4                  | mov rax,rsp                             |
48 89 58 08               | mov qword ptr ds:[rax+8],rbx            |
48 89 68 18               | mov qword ptr ds:[rax+18],rbp           |
48 89 70 20               | mov qword ptr ds:[rax+20],rsi           | 
...
```

jmp구문의 최소크기인 14byte를 자르면 마지막 구문이 깨지게 된다. 동작하는 단위는 15byte이다.

소스에서 MessageBoxA 대신 **MessageBoxTimeoutA**를 후킹하고 있다. MessageBoxTimeoutA는 MessageBoxA보다 파라메터가 훨씬 많은 함수로 사실 MessageBoxA 에서도 내부적으로는 이 함수를 이용한다. 따라서 MessageBoxTimeoutA를 후킹하면 자연스럽게 MessageBoxA를 후킹하는것과 같은 효과를 볼수 있다.

MessageBoxA는 현재의 방법에서는 후킹할 수 없다. MessageBoxA의 시작부분을 보면

```x86asm
48 83 EC 38              | sub rsp,38
45 33 DB                 | xor r11d,r11d
44 39 1D DA 58 03 00     | cmp dword ptr ds:[7FFE1B2340B8],r11d
```

일단 크기는 정확히 14byte로 자르는데에는 문제는 없다. 다만 마지막 구문이 문제가 되는데 DA 58 03 00 는 **상대주소값**이다. 현재의 위치에서의 상대주소값이기 때문에 다른 위치에서 실행 할 경우 값이 달라지게 된다. 그래서 이 부분을 후킹한 함수 뒤에 붙여서 실행주소가 달라질 경우 동작하지 않는다. 32bit와 달리 바로 구현부분이 나오기 때문에 발생하는 문제이다.

```x86asm
MyMessageBoxA proc
    sub rsp, 38h
    call MyMessageBoxAJMP
    add rsp, 38h
    mov rax, IDCANCEL
    ret
```

MessageBoxTimeoutA 의 파라메터는 7개이다. `rsp`를 56byte(38h)를 확보하고 호출한다.

```x86asm
MyMessageBoxAJMP:
    db 32 dup(90h) ;org stub
    db 14 dup(90h) ;jmp
```

원래 함수를 호출하기 위한 영역이다. 32bit에서는 5byte 5byte로 깔끔하게 떨어졌는데 64bit에서는 원래 함수 시작부분은 여유 크기로 32byte를 jmp 구문은 14byte로 처리하였다.

LoadApiHook가 실행되고나면 아래와같이 변한다.

```x86asm
MyMessageBoxAJMP:
; MessageBoxTimeoutA의 시작부분 15byte
mov rax,rsp
mov qword ptr ds:[rax+8],rbx
mov qword ptr ds:[rax+18],rbp
mov qword ptr ds:[rax+20],rsi   
; 17byte가 nop으로 채워져있다        | 
nop
nop
nop
.
.
nop
; MessageBoxTimeoutA의 15byte 이후 코드주소로 jmp구문 (14byte)
push 1B1FEB0Ah
mov [rsp+4], 00007FFEh
ret
```

MyMessageBoxAJMP를 call하면 자연스럽게 원래의 함수가 실행될 것이다.

다소 제약사항이 생기고 함수호출이 조금 번잡하지만 32bit Trampoline만 이해한다면 크게 달라진 부분은 없다.

injector\_64 와 victim\_64를 실행하여 테스트해보자.

다음은 좀더 유연한 Trampoline 방식을 간단히 알아보고 넘어가자. 이 방식은 후킹함수가 호출될때마다 원본 함수를 복구하고 다시 후킹하는 방식이기때문에 성능상으로는 떨어지게되지만 매번 함수시작부분 코드를 체크하지 않아도 되어 간편하다.

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리 튜토리얼 (16) 64비트 api hooking(IAT)](http://note.heyo.me/?p=2093)
