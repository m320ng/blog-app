---
title: "어셈블리 튜토리얼 (18) 64비트 api hooking(Trampoline #2)"
date: "2018-10-14"
categories: 
  - "code"
  - "hacking"
tags: 
  - "asm"
  - "어셈블리"
  - "api-hooking"
  - "리버스-엔지니어링"
---

## 4.5. api hooking(Trampoline #2)

좀 더 유연한 Trampoline방식과 조금 다른 방식의 소스이다. 원래의 함수를 이어붙인 이전방식과 달리 매번 후킹을 해제했다가 다시거는 방식이다. 후킹된 함수들을 관리하기위해 후킹 관련 정보를 담은 구조체를 추가하였다.

앞서본 Trampoline처럼 기본구현 방식은 14byte(jmp코드)를 덮어씌우는 방식으로 동일하다. 후킹함수내에서 원래 함수를 호출하는 부분만 관심있게 보면 되겠다.

```x86asm
option casemap:none
;option frame:auto

include D:\WinInc208\Include\windows.inc
;include D:\WinInc208\Include\user32.inc
;include D:\WinInc208\Include\kernel32.inc

includelib user32.lib
includelib kernel32.lib
includelib winmm.lib

LoadApiHook proto, lpApihookStruct:qword
RemoveApiHook proto, lpApihookStruct:qword
GetMsgProc proto, nCode:dword, wParam:WPARAM, lParam:LPARAM
AddApiHook proto, lpszDll:qword, lpszProc:qword, lpTossProc:qword
PatchAddress proto lpApihookStruct:qword
UnpatchAddress proto lpApihookStruct:qword

MyMessageBoxA proto, arg1:qword, arg2:qword, arg3:qword, arg4:dword

ApiHookStruct struct
    szDll           byte 32 dup(0)
    szProc          byte 32 dup(0)
    lpTossProc      qword 0
    lpOrgProc       qword 0
    dwOrgProtect    dword 0
    StubOrg         byte 14 dup(0)
    StubHook        byte 14 dup(0)
    bHooking        byte 0
ApiHookStruct ends

.data
lpApiMessageBoxA    qword 0
lpApiMessageBoxW    qword 0

szUSER32        db 'USER32.DLL',0
szMessageBoxA       db 'MessageBoxA',0
szMessageBoxW       db 'MessageBoxW',0

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
        .if eax!=0
            ;invoke MessageBoxA, NULL, addr szVictim, addr szVictim, MB_OK

            invoke AddApiHook, addr szUSER32, addr szMessageBoxA, addr MyMessageBoxA
            mov lpApiMessageBoxA, rax
            invoke LoadApiHook, rax
        .endif
    .elseif reason==DLL_PROCESS_DETACH
        invoke GetModuleHandle, addr szVictim
        .if eax!=0
            invoke RemoveApiHook, lpApiMessageBoxA
        .endif
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

AddApiHook proc uses rsi, lpszDll:qword, lpszProc:qword, lpTossProc:qword
    mov lpszDll, rcx
    mov lpszProc, rdx
    mov lpTossProc, r8

    invoke GlobalAlloc, GMEM_FIXED, sizeof ApiHookStruct
    mov rsi, rax
    assume rsi:ptr ApiHookStruct
    mov rax, lpTossProc
    mov [rsi].lpTossProc, rax
    invoke lstrcpy, addr [rsi].szDll, lpszDll
    invoke lstrcpy, addr [rsi].szProc, lpszProc
    mov rax, rsi
    ret
AddApiHook endp

RemoveApiHook proc uses rsi rdi rbx, lpApihookStruct:qword
    mov lpApihookStruct, rcx

    mov rbx, lpApihookStruct
    assume rbx:ptr ApiHookStruct
    mov al, [rbx].bHooking

    .if al==1
        ; 원본 stub 복구
        lea rsi, [rbx].StubOrg
        mov rdi, [rbx].lpOrgProc
        movsq
        movsd
        movsw

        ; Protect 복구
        invoke VirtualProtect, [rbx].lpOrgProc, 14, [rbx].dwOrgProtect, 0
    .endif
    ret
RemoveApiHook endp

LoadApiHook proc uses rsi rdi rbx, lpApihookStruct:qword
    local hModule:qword
    local lpOrgProc:qword
    local dwOrgProtect:dword
    local mbi:MEMORY_BASIC_INFORMATION

    mov lpApihookStruct, rcx

    mov rbx, lpApihookStruct
    assume rbx:ptr ApiHookStruct

    invoke GetModuleHandle, addr [rbx].szDll
    mov hModule, rax
    .if rax==0
        jmp LOAD_HOOK_EXIT
    .endif

    invoke GetProcAddress, hModule, addr [rbx].szProc
    mov [rbx].lpOrgProc, rax
    mov lpOrgProc, rax
    .if rax==0
        jmp LOAD_HOOK_EXIT
    .endif

    invoke VirtualQuery, lpOrgProc, addr mbi, sizeof mbi
    mov eax, mbi.Protect
    and eax, not PAGE_READONLY
    and eax, not PAGE_EXECUTE_READ
    ;or eax, PAGE_READWRITE
    or eax, PAGE_EXECUTE_READWRITE
    lea rsi, dwOrgProtect
    invoke VirtualProtect, lpOrgProc, 14, eax, rsi
    mov eax, dwOrgProtect
    mov [ebx].dwOrgProtect, eax

    ; 원본 stub 백업
    mov rsi, lpOrgProc
    lea rdi, [rbx].StubOrg
    movsq
    movsd
    movsw

    ; Hook 함수로 점프하는 stub
    mov rax, [rbx].lpTossProc
    ;sub rax, lpOrgProc
    ;sub rax, 14

    ; push 000000h ; 68 DWORD
    ; mov [rsp+4], 000000h ; c7 44 24 04 DWORD
    ; ret ; c3
    mov byte ptr [rbx].StubHook, 68h
    mov dword ptr [rbx].StubHook + 1, eax
    mov byte ptr [rbx].StubHook + 5, 0c7h
    mov byte ptr [rbx].StubHook + 6, 44h
    mov byte ptr [rbx].StubHook + 7, 24h
    mov byte ptr [rbx].StubHook + 8, 04h
    shr rax, 32
    mov dword ptr [rbx].StubHook + 9, eax
    mov byte ptr [rbx].StubHook + 13, 0c3h

    ; hook stub으로 교체
    lea rsi, [rbx].StubHook
    mov rdi, [rbx].lpOrgProc
    movsq
    movsd
    movsw

    mov al, 1
    mov [rbx].bHooking, al

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


RestoreFunc:
    push rsi
    push rdi

    assume rax:ptr ApiHookStruct

    ; 원본 stub 복구
    lea rsi, [rax].StubOrg
    mov rdi, [rax].lpOrgProc
    movsq
    movsd
    movsw

    pop rdi
    pop rsi
    ret

HookFunc:
    push rsi
    push rdi

    assume rax:ptr ApiHookStruct

    ; hook stub으로 교체
    lea rsi, [rax].StubHook
    mov rdi, [rax].lpOrgProc
    movsq
    movsd
    movsw

    pop rdi
    pop rsi
    ret

; hook functions
MyMessageBoxA proc, arg1:qword, arg2:qword, arg3:qword, arg4:dword
    mov arg1, rcx
    mov arg2, rdx
    mov arg3, r8
    mov arg4, r9d

    ; 원래 함수를 호출하기 위한 루틴
    ;-----------------------------------------
    mov rax, lpApiMessageBoxA
    call RestoreFunc
    ;-----------------------------------------

    ; 원래 함수 호출
    mov rax, lpApiMessageBoxA
    assume rax:ptr ApiHookStruct
    mv rax, [rax].lpOrgProc ; 원래의 함수 주소를 구한다.

    mov r9d, arg4
    mov r8, arg3
    mov rdx, arg2
    mov rcx, arg1
    sub esp, 10h
    call rax ; MessageBoxA 호출
    add esp, 10h

        ; 다시 후킹을 건다.
    ;-----------------------------------------
    push rax
    mov rax, lpApiMessageBoxA
    call HookFunc
    pop rax
    ;-----------------------------------------

    ; 결과를 변경
    ; 무조건 cancel
    mov rax, IDCANCEL

    ret
MyMessageBoxA endp

end DllEntry
```

```x86asm
ApiHookStruct struct
    szDll           byte 32 dup(0) ; DLL명
    szProc          byte 32 dup(0) ; 함수명
    lpTossProc      qword 0        ; 새로운 함수주소(후킹 함수)
    lpOrgProc       qword 0        ; 원래의 함수주소
    dwOrgProtect    dword 0                ; 원래의 Memory Protect값을 저장해두는데 크게 의미없다.
    StubOrg         byte 14 dup(0) ; 원래의 함수 앞부분 (14byte)
    StubHook        byte 14 dup(0) ; 덮어쓸 코드 (후킹 함수로 jmp하는 코드)
    bHooking        byte 0         ; 후킹여부 확인 크게 의미없다.
ApiHookStruct ends
```

후킹된 함수의 정보를 담은 구조체가 추가되었다. 매번 후킹을 토글해야하므로 관련정보를 저장해서 관리하기위한 구조체이다.

```x86asm
            invoke AddApiHook, addr szUSER32, addr szMessageBoxA, addr MyMessageBoxA
            mov lpApiMessageBoxA, rax
            invoke LoadApiHook, rax
```

후킹을 거는 함수가 두부분으로 나누어졌다. **AddApiHook**에서 후킹할 함수정보를 받아서 **ApiHookStruct**구조체를 생성한다. 메모리 할당을 위해 `GlobalAlloc` 를 이용한다. 리턴값으로 생성된 구조체의 주소 받아서 **lpApiMessageBoxA**에 저장한다. 여기서는 **MessageBoxA**를 후킹하고 있다.

**LoadApiHook**에서 ApiHookStruct를 파라메터로 받아서 후킹을 걸고 각종 후킹정보를 저장한다. 앞으로 이 정보를 통해서 후킹을 토글하게된다. LoadApiHook 함수는 이전 방식의 **LoadApiHook**함수와 거의 동일하니 비교하며 훑어보면 되겠다. 이전 방식과 달리 무조건 14byte를 덮어씌운다. 기존 함수의 시작부분 14byte를 구조체에 저장해둔다.

```x86asm
    ; 원본 stub 백업
    mov rsi, lpOrgProc
    lea rdi, [rbx].StubOrg
    movsq
    movsd
    movsw
```

기존에 `rep movsb`를 이용하여 복사하던 것과 달리 `movsq movsd movsw` 로 복사한다. 각각 **qword 8byte복사 + dword 4byte복사 + word 2byte복사**로 14byte복사와 동일하다. 기존처럼하면 이렇게 할 수 있겠다.

```x86asm
mov rsi, lpOrgProc
lea rdi, [rbx].StubOrg
mov rcx, 14
rep movsb
```

```x86asm
RestoreFunc:
.
.
.

HookFunc:
.
.
.
```

naked 함수이다. ApiHookStruct구조체 주소를 `rax`를 파라메터로 받는다. RestoreFunc는 원래의 함수로 복구하고, HookFunc는 다시 후킹을 한다. 뒤에서 원래의 함수를 호출할때 사용된다.

```x86asm
MyMessageBoxA proc, arg1:qword, arg2:qword, arg3:qword, arg4:dword
```

MessageBoxA를 후킹한 함수이다. 원래의 **MessageBoxA**를 호출하기위해 RestoreFunc를 호출하고 `ApiHookStruct->lpOrgProc` 를 호출한다. 종료하기전에 HookFunc를 호출하여 다시 후킹을 건다.

이전 방식에 비해서 매번 후킹을 토글해야하는 성능적인 하락은 있을 수 있지만 소스는 오히려 깔끔해졌다.

다음에는 간단하게 64bit speed hack 테스트만하고 넘어가도록하자.

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리 튜토리얼 (17) 64비트 api hooking(Trampoline)](http://note.heyo.me/?p=2095)
