---
title: "어셈블리 튜토리얼 (16) 64비트 api hooking(IAT)"
date: "2018-10-04"
categories: 
  - "code"
  - "hacking"
tags: 
  - "asm"
  - "어셈블리"
  - "api-hooking"
  - "리버스-엔지니어링"
---

## 4.5. api hooking(IAT)

마찬가지로 32비트와 크게 다르지 않다. 이전 예제처럼 `fastcall`함수콜 방식에서 파라메터 설정하는 부분과 메모리주소(포인터)의 크기가 `dword`가 아닌 `qword`이라는 점만 제외하면 똑같으니 이 부분만 확인하면서 훑어보자.

apihook\_64.asm

```x86asm
option casemap:none
;option frame:auto

include D:\WinInc208\Include\windows.inc
;include D:\WinInc208\Include\user32.inc
;include D:\WinInc208\Include\kernel32.inc

includelib user32.lib
includelib kernel32.lib
includelib winmm.lib

GetMsgProc proto, nCode:dword, wParam:WPARAM, lParam:LPARAM

GetFunctionTable proto, hModule:qword, lpszDll:qword, lpszProc:qword
PatchAddress proto, lpOrgProc:qword, lpNewProc:qword
MyMessageBoxA proto, arg1:qword, arg2:qword, arg3:qword, arg4:dword
MyMessageBoxW proto, arg1:qword, arg2:qword, arg3:qword, arg4:dword

.data
lpApiMessageBoxA    qword 0
lpIATMessageBoxA    qword 0

lpApiMessageBoxW    qword 0
lpIATMessageBoxW    qword 0

szUSER32        db 'USER32.DLL',0
szMessageBoxA       db 'MessageBoxA',0
szMessageBoxW       db 'MessageBoxW',0

.data?
szVictim            byte 50 dup(?)
hCBTHook            qword ?
hGlobalModule       qword ?

szMsg               byte 50 dup(?)
hVictim             qword ?

.code
DllEntry proc hInstance:HINSTANCE, reason:DWORD, dwReserved:DWORD
    mov hInstance, rcx
    mov reason, edx
    mov dwReserved, r9d

    .if reason==DLL_PROCESS_ATTACH
        .if hGlobalModule==0
            mov rax, hInstance
            mov hGlobalModule, rax
        .endif
        invoke GetModuleHandle, addr szVictim
        .if eax!=0
            mov hVictim, rax

            ;invoke MessageBoxA, NULL, addr szVictim, addr szVictim, MB_OK

            invoke GetFunctionTable, hVictim, addr szUSER32, addr szMessageBoxA
            mov lpIATMessageBoxA, rax

            .if rax!=0
                invoke PatchAddress, lpIATMessageBoxA, addr MyMessageBoxA
                mov lpApiMessageBoxA, rax
            .endif

            invoke GetFunctionTable, hVictim, addr szUSER32, addr szMessageBoxW
            mov lpIATMessageBoxW, rax

            .if rax!=0
                invoke PatchAddress, lpIATMessageBoxW, addr MyMessageBoxW
                mov lpApiMessageBoxW, rax
            .endif

        .endif
    .elseif reason==DLL_PROCESS_DETACH
        invoke GetModuleHandle, addr szVictim
        .if rax!=0
            invoke PatchAddress, lpIATMessageBoxA, lpApiMessageBoxA
        .endif
    .endif
    mov rax, TRUE
    ret
DllEntry Endp

GetFunctionTable proc uses rbx rsi rdi, hModule:qword, lpszDll:qword, lpszProc:qword
    local dwCount:dword
    mov dwCount, 0

    mov hModule, rcx
    mov lpszDll, rdx
    mov lpszProc, r8

    ; https://msdn.microsoft.com/ko-kr/library/windows/desktop/ms680339(v=vs.85).aspx
    ; NT Header로 이동 IMAGE_NT_HEADER (IMAGE_FILE_HEADER)
    mov rax, hModule
    mov rbx, rax
    movsxd rcx, dword ptr [rax+3Ch]
    add rbx, rcx

    ; Optional Header로 이동
    add rbx, 4              ; PE\0\0
    add rbx, 14h                ; sizeof IMAGE_FILE_HEADER

    ; 
    ; Import Data Directory 시작으로 이동
    ; https://docs.microsoft.com/ko-kr/windows/desktop/api/winnt/ns-winnt-_image_optional_header
    ; https://docs.microsoft.com/ko-kr/windows/desktop/api/winnt/ns-winnt-_image_optional_header64
    ; NumberOfRvaAndSizes까지 70h
    ; 두번째 배열 8h
    ; add rbx, 68h ; 32bit
    add rbx, 78h                ; IMAGE_OPTIONAL_HEADER64 (IMAGE_DATA_DIRECTORY전)

    ; IMAGE_IMPORT_DESCRIPTOR 으로 이동
    ;movsxd rcx, dword ptr [rbx]
    ;mov rbx, rcx
    movsxd rbx, (IMAGE_DATA_DIRECTORY ptr [rbx]).VirtualAddress
    add rbx, hModule

    assume rbx:ptr IMAGE_IMPORT_DESCRIPTOR 

    .while [rbx].OriginalFirstThunk!=0 && [rbx].FirstThunk!=0
        mov rsi, hVictim
        movsxd rcx, [rbx].Name_
        add rsi, rcx

        invoke lstrcmpi, rsi, lpszDll
        .if rax==0
            mov rdi, hVictim
            movsxd rcx, [rbx].OriginalFirstThunk
            add rdi, rcx

            .while dword ptr [rdi]!=0
                mov rax, hVictim
                movsxd rcx, dword ptr [rdi]
                add rax, rcx
                assume rax:ptr IMAGE_IMPORT_BY_NAME

                invoke lstrcmpi, addr [rax].Name_, lpszProc
                .if rax==0
                    mov rax, hVictim
                    movsxd rcx, [rbx].FirstThunk
                    add rax, rcx
                    movsxd rcx, dwCount
                    add rax, rcx

                    jmp GET_FUNCTION_TABLE_EXIT
                .endif

                add rdi, 8
                add dwCount, 8
            .endw

        .endif

        add rbx, sizeof IMAGE_IMPORT_DESCRIPTOR
    .endw

    xor rax, rax

GET_FUNCTION_TABLE_EXIT:
    ret
GetFunctionTable endp

PatchAddress proc uses rsi rdi, lpOrgProc:qword, lpNewProc:qword
    local dwOrgProtect:dword
    local mbi:MEMORY_BASIC_INFORMATION

    mov lpOrgProc, rcx
    mov lpNewProc, rdx

    invoke VirtualQuery, lpOrgProc, addr mbi, sizeof mbi
    mov eax, mbi.Protect
    and eax, not PAGE_READONLY
    and eax, not PAGE_EXECUTE_READ
    or eax, PAGE_READWRITE
    lea rsi, dwOrgProtect
    invoke VirtualProtect, lpOrgProc, 8, eax, rsi

    mov rax, lpOrgProc
    mov rax, qword ptr [rax]
    push rax

    ; address 교체
    lea rsi, lpNewProc
    mov rdi, lpOrgProc
    movsq

    invoke VirtualProtect, lpOrgProc, 8, dwOrgProtect, 0
    pop rax

    ret
PatchAddress endp

GetMsgProc proc nCode:dword, wParam:WPARAM, lParam:LPARAM
    mov nCode, ecx
    mov wParam, rdx
    mov lParam, r8

    invoke CallNextHookEx, hCBTHook, nCode, wParam, lParam
    ret
GetMsgProc endp

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
MyMessageBoxA proc arg1:qword, arg2:qword, arg3:qword, arg4:dword
    mov arg1, rcx
    mov arg2, rdx
    mov arg3, r8
    mov arg4, r9d
    call lpApiMessageBoxA
    mov rax, IDCANCEL

    ret
MyMessageBoxA endp

MyMessageBoxW proc arg1:qword, arg2:qword, arg3:qword, arg4:dword
    mov arg1, rcx
    mov arg2, rdx
    mov arg3, r8
    mov arg4, r9d
    call lpApiMessageBoxW
    mov rax, IDCANCEL

    ret
MyMessageBoxW endp


end DllEntry
```

IMAGE\_OPTIONAL\_HEADER는 IMAGE\_OPTIONAL\_HEADER64로 변경되었다.

```
    ; Import Data Directory 시작으로 이동
    ; add rbx, 68h ; 32bit
    add rbx, 78h                ; IMAGE_OPTIONAL_HEADER64 (IMAGE_DATA_DIRECTORY전)
```

IMAGE\_OPTIONAL\_HEADER에 비해 68h에서 78h로 16byte정도 늘어났다. 4개정도의 포인터의 차이이다. 실제로 확인을 해보면

```
  ULONGLONG            SizeOfStackReserve;
  ULONGLONG            SizeOfStackCommit;
  ULONGLONG            SizeOfHeapReserve;
  ULONGLONG            SizeOfHeapCommit;
```

이렇게 4개의 데이터가 64비트로 변경되었다. (ULONGLONG는 QWORD와 같다)

이외에도 덧셈연산인 `add`부분도 달라졌는데

```
; 32bit
        mov esi, hVictim
        add esi, [ebx].Name1

;64bit
    mov rsi, hVictim
    movsxd rcx, [rbx].Name_
    add rsi, rcx
```

Name\_이 DWORD이다보니 QWORD와 DWORD를 `add`연산을 할수 없어서 QWORD크기의 레지스터 `rcx`로 복사한 후에 `add` 연산을 하고있다.

injector\_64.asm

앞서 사용했던 injector 그대로이다. mydll\_64.lib만 apihook\_64.lib으로 변경되었다

```
option casemap:none

include D:\WinInc208\Include\windows.inc
;include D:\WinInc208\Include\user32.inc
;include D:\WinInc208\Include\kernel32.inc

printf PROTO :qword
getchar PROTO

SetVictim proto, lpszVictim:dword
StartHook proto
EndHook proto

includelib kernel32.lib
includelib user32.lib
includelib msvcrt.lib
includelib apihook_64.lib

LoadDll proto
UnloadDll proto

.data
szVictim        byte "victim_64.exe",0

szStart         db "start window hooking.",13,10,0
szEnd           db "end window hooking.",13,10,0

.data?
hMyDll          dword ?

.code
start:
call Main
invoke ExitProcess, 0

LoadDll proc
    invoke SetVictim, addr szVictim
    invoke StartHook

    ret
LoadDll endp

UnloadDll proc
    invoke EndHook

    ret
UnloadDll endp

Main proc
    invoke LoadDll

    invoke printf, addr szStart

    .repeat
        invoke getchar
    .until al=='x'

    invoke printf, addr szEnd

    invoke UnloadDll
    ret
Main endp

end start
```

32비트처럼 테스트해보면 되겠다.

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리어 튜토리얼 (15) 64비트 DLL Injection](http://note.heyo.me/?p=2091)
