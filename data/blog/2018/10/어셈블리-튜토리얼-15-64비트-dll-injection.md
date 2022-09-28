---
title: "어셈블리 튜토리얼 (15) 64비트 DLL Injection"
date: "2018-10-03"
categories: 
  - "code"
  - "hacking"
tags: 
  - "asm"
  - "어셈블리"
  - "api-hooking"
  - "리버스-엔지니어링"
---

## 4.4. DLL Injection(WinHook)

함수(WinHook)를 이용한 injection이기 때문에 **32비트**와 크게 달라진 부분이 없다. 달라진 부분만 설명하도록 하겠다.

injector\_64.asm

```x86asm
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

와우.. 1도 달라진게 없는듯. 이어서 injection되는 dll이다.

mydll\_64.asm

```x86asm
option casemap:none
;option frame:auto

include D:\WinInc208\Include\windows.inc
;include D:\WinInc208\Include\user32.inc
;include D:\WinInc208\Include\kernel32.inc

includelib user32.lib
includelib kernel32.lib

.data
szAttach            db "attach",0
szInfo              db "info",0

.data?
szVictim            byte 50 dup(?)

.code
DllEntry proc hInstance:HINSTANCE, reason:DWORD, dwReserved:DWORD
    mov hInstance, rcx
    mov reason, edx
    mov dwReserved, r8d

    .if reason==DLL_PROCESS_ATTACH
        invoke MessageBoxA, NULL, offset szAttach, offset szInfo, MB_OK
    .elseif reason==DLL_PROCESS_DETACH
    .endif
    mov rax, TRUE
    ret
DllEntry Endp

; export functions
SetVictim proc lpszVictim:qword
    mov lpszVictim, rcx

    invoke lstrcpy, offset szVictim, lpszVictim
    invoke MessageBoxA, NULL, offset szVictim, offset szInfo, MB_OK
    ret
SetVictim endp


end DllEntry
```

마찬가지로 거의 동일하다. 아래 부분만 다시보면..

```x86asm
;DllEntry 
    mov hInstance, rcx
    mov reason, edx
    mov dwReserved, r8d
```

앞서 설명했듯이 함수콜이 `fastcall`으로 변경되어서 변수를 사용하려면 레지스터로 받은 인자를 변수에 복사해야한다. (레지스터로 받은 4개인자만..)

자주 까먹어서 삽질 할 수도 있겠다..싶다.

32비트 예제와 같이 [victim\_64 프로그램](http://note.heyo.me/wp-content/uploads/2018/10/victim_64.zip)을 다운받아서 테스트해보자

> [목차](http://note.heyo.me/?p=238) 이전글 [어셈블리어 튜토리얼 (14) 64비트](http://note.heyo.me/?p=2003)
