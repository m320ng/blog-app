---
title: "API후킹 Library"
date: "2013-08-10"
categories: 
  - "code"
tags: 
  - "assembly"
---

예전 언젠가 작성했던 글 Trampoline 후킹을 어셈으로 구현한거 같은데..

주석이 없어서 보기 힘들듯;;

C++ 로 구현한것도 있을텐데 그게 보기 더 편할거 같다.

```
#!asm
; apihook frame
;
; + DLL Injection은 Windows Hook을 이용하는 기법을 사용
; + API Hooking은 5byte Patch기법을 이용
; + 윈도우API만 염두해 두었으며, C Runtime API들은 동작안함 (stdcall만 처리, cdecl에대해선 처리X)

.386
.model flat, stdcall
option casemap:none

include c:masm32includewindows.inc
include c:masm32macrosmacros.asm
include c:masm32macrosucmacros.asm
include c:masm32includeuser32.inc
include c:masm32includekernel32.inc
include c:masm32includepsapi.inc

includelib c:masm32libuser32.lib
includelib c:masm32libkernel32.lib
includelib c:masm32libpsapi.lib

LoadApiHook proto, pApihookStruct:dword
RemoveApiHook proto, pApihookStruct:dword
GetMsgProc proto, nCode:dword, wParam:dword, lParam:dword

LoadHookFunctionList proto
RemoveHookFunctionList proto
LoadHookFunction proto, pstrDll:dword, pstrProc:dword

HookStruct struct
 pNext   dword 0
 pOrgProc  dword 0
 pHookProc  dword 0
 dwOrgProtect dword 0
 StubOrg   byte 5 dup(0)
 StubHook  byte 5 dup(0)
HookStruct ends

.data
pHookStructResent   dword 0
pHookStructTable   dword 0
hUserDefineDll    dword 0
bUserDefineDll    byte 0

ListLoadLibrary    byte 512 dup(0)
pListLoadLibrary   dword 0

.data?
szUserDefineDll    byte MAX_PATH dup(?)

hCBTHook    dword ?
hMyInstance     dword ?

ListTarget     byte 512 dup(?)
pListTarget     dword ?

ListHookDll     byte 512 dup(?)
ListHookProc    byte 512 dup(?)
pListHookDll    dword ?
pListHookProc    dword ?


.code
@HookFunctionSkel:
 byte 90h    ; nop
 byte 90h    ; nop
 byte 90h    ; nop
 byte 58h    ; pop eax
 byte 56h    ; push esi
 byte 57h    ; push edi
 byte 52h    ; push edx
 byte 8Bh,0D0h   ; mov edx, eax
 byte 0B8h    ; mov eax, 
@HookFunctionSkelStruct1:
 dword 0     ; [HookStruct]
 byte 8Dh,70h,10h  ; lea esi, dword ptr [eax + 16]
 byte 8Bh,78h,04h  ; mov edi, dword ptr [eax + 4]
 byte 0A5h    ; mobsd
 byte 0A4h    ; mobsb
 byte 8Bh,70h,08h  ; mov esi, dword ptr [eax + 8]
 byte 89h,56h,3Bh  ; mov dword ptr [esi + 59], edx
 byte 5Ah    ; pop edx
 byte 5Fh    ; pop edi
 byte 5Eh    ; pop esi
 byte 0FFh,70h,04h  ; push dword ptr [eax + 4]
 byte 0E8h    ; call
@HookFunctionSkelHookFunc:
 dword 0     ; [MyHookFunc]
; byte 83h,0C4,04h  ; add esp, 4
 byte 50h    ; push eax
 byte 56h    ; push esi
 byte 57h    ; push edi
 byte 0B8h    ; mov eax, 
@HookFunctionSkelStruct2:
 dword 0     ; [HookStruct]
 byte 8Dh,70h,15h  ; lea esi, dword ptr [eax + 21]
 byte 8Bh,78h,04h  ; mov edi, dword ptr [eax + 4]
 byte 0A5h    ; mobsd
 byte 0A4h    ; mobsb
 byte 5Fh    ; pop edi
 byte 5Eh    ; pop esi
 byte 58h    ; pop eax
 byte 68h    ; push
 dword 0     ; [Return]
 byte 0C3h    ; ret
@HookFunctionSkelEnd:

DllEntry proc hInstance:HINSTANCE, reason:dword, reserved1:dword
 local pstrTarget:dword

 .if reason==DLL_PROCESS_ATTACH
  .if hMyInstance==0
   mov eax, hInstance
   mov hMyInstance, eax
  .endif

  .if pListTarget!=0
   mov pstrTarget, offset ListTarget
   .while 1
    invoke GetModuleHandle, pstrTarget
    .if eax!=0
     invoke LoadHookFunctionList
     .break
    .endif
    invoke lstrlen, pstrTarget
    add eax, pstrTarget
    inc eax
    .break .if byte ptr [eax]==0
    mov pstrTarget, eax
   .endw
  .else
   invoke LoadHookFunctionList
  .endif

 .elseif reason==DLL_PROCESS_DETACH
  .if pHookStructTable!=0
   invoke RemoveHookFunctionList
  .endif
 .endif
 mov eax, 1
 ret
DllEntry endp

GetMsgProc proc, nCode:dword, wParam:dword, lParam:dword
 invoke CallNextHookEx, hCBTHook, nCode, wParam, lParam
 ret
GetMsgProc endp

LoadHookFunctionList proc
 local pstrDll:dword
 local pstrProc:dword

 invoke GetModuleHandle, addr szUserDefineDll
 mov hUserDefineDll, eax
 .if eax==0
  invoke LoadLibrary, addr szUserDefineDll
  mov hUserDefineDll, eax
  mov bUserDefineDll, 1
  .if eax==0
   jmp LoadHookFunctionListExit
  .endif
 .endif 

 mov pstrDll, offset ListHookDll
 mov pstrProc, offset ListHookProc

 .if pListHookDll!=0 && pListHookProc!=0
  .while 1
   invoke LoadHookFunction, pstrDll, pstrProc
   invoke lstrlen, pstrDll
   add eax, pstrDll
   inc eax
   .break .if byte ptr [eax]==0
   mov pstrDll, eax
   invoke lstrlen, pstrProc
   add eax, pstrProc
   inc eax
   .break .if byte ptr [eax]==0
   mov pstrProc, eax
  .endw
 .endif

LoadHookFunctionListExit:
 ret
LoadHookFunctionList endp

RemoveHookFunctionList proc uses esi edi ebx
 mov eax, pHookStructTable
 assume eax:ptr HookStruct

 .while eax!=0
  mov ebx, eax
  assume ebx:ptr HookStruct

  ; 원본 stub 복구
  lea esi, [ebx].StubOrg
  mov edi, [ebx].pOrgProc
  movsd
  movsb

  ; Protect 복구
  invoke VirtualProtect, [ebx].pOrgProc, 5, [ebx].dwOrgProtect, 0

  mov eax, [ebx].pNext
  push eax
  invoke VirtualFree, [ebx].pHookProc, (@HookFunctionSkelEnd - @HookFunctionSkel), MEM_RELEASE
  invoke VirtualFree, ebx, sizeof HookStruct, MEM_RELEASE
  pop eax
 .endw

 mov eax, offset ListLoadLibrary
 xor esi, esi
 .if pListLoadLibrary > 0
  .while 1
   add eax, esi
   invoke FreeLibrary, dword ptr [eax]
   add esi, 4
   .break .if esi >= pListLoadLibrary
  .endw
 .endif

 .if bUserDefineDll==1 && hUserDefineDll!=0 
  invoke FreeLibrary, hUserDefineDll
 .endif
RemoveHookFunctionListExit:
 ret
RemoveHookFunctionList endp

LoadHookFunction proc uses esi edi ebx, pstrDll:dword, pstrProc:dword
 local MyHookName[52]:byte
 local pMyHookFunc:dword
 local pOrgProc:dword
 local mbi:MEMORY_BASIC_INFORMATION

 .if hUserDefineDll==0
  xor eax, eax
  jmp LoadHookFunctionExit
 .endif

 invoke GetModuleHandle, pstrDll
 .if eax==0
  .if pListLoadLibrary >= sizeof ListLoadLibrary
   jmp LoadHookFunctionExit
  .endif
  invoke LoadLibrary, pstrDll
  .if eax==0
   jmp LoadHookFunctionExit
  .else
   mov esi, offset ListLoadLibrary
   add esi, pListLoadLibrary
   mov dword ptr [esi], eax
   add pListLoadLibrary, 4
  .endif
 .endif

 invoke GetProcAddress, eax, pstrProc
 .if eax==0
  jmp LoadHookFunctionExit
 .endif
 mov pOrgProc, eax

 invoke lstrcpy, addr MyHookName, chr$("My")
 invoke lstrcat, addr MyHookName, pstrProc
 invoke GetProcAddress, hUserDefineDll, addr MyHookName
 .if eax==0
  jmp LoadHookFunctionExit
 .endif
 mov pMyHookFunc, eax

 invoke VirtualAlloc, 0, sizeof HookStruct, MEM_COMMIT, PAGE_READWRITE
 .if eax==0
  jmp LoadHookFunctionExit
 .endif
 mov ebx, eax
 assume ebx:ptr HookStruct

 .if pHookStructResent==0
  mov pHookStructTable, eax
  mov pHookStructResent, eax
 .else
  mov eax, pHookStructResent
  assume eax:ptr HookStruct
  mov [eax].pNext, ebx
  assume eax:nothing
  mov pHookStructResent, ebx
 .endif

 mov eax, pOrgProc
 mov [ebx].pOrgProc, eax

 invoke VirtualAlloc, 0, (@HookFunctionSkelEnd - @HookFunctionSkel), MEM_COMMIT, PAGE_EXECUTE_READWRITE
 .if eax==0
  jmp LoadHookFunctionExit
 .endif
 mov [ebx].pHookProc, eax

 mov esi, offset @HookFunctionSkel
 mov edi, eax
 mov ecx, (@HookFunctionSkelEnd - @HookFunctionSkel)
 rep movsb

 mov dword ptr [eax + (@HookFunctionSkelStruct1 - @HookFunctionSkel)], ebx
 mov dword ptr [eax + (@HookFunctionSkelStruct2 - @HookFunctionSkel)], ebx
 mov esi, pMyHookFunc
 lea edi, dword ptr [eax + (@HookFunctionSkelHookFunc - @HookFunctionSkel)]
 sub esi, edi
 sub esi, 4
 mov dword ptr [eax + (@HookFunctionSkelHookFunc - @HookFunctionSkel)], esi

 invoke VirtualQuery, [ebx].pOrgProc, addr mbi, sizeof mbi
 .if eax==0
  jmp LoadHookFunctionExit
 .endif
 lea esi, mbi
 assume esi:ptr MEMORY_BASIC_INFORMATION
 mov eax, mbi.Protect
 and eax, not PAGE_NOACCESS
 and eax, not PAGE_READONLY
 and eax, not PAGE_WRITECOPY
 and eax, not PAGE_READWRITE
 and eax, not PAGE_EXECUTE
 and eax, not PAGE_EXECUTE_READ
 and eax, not PAGE_EXECUTE_WRITECOPY
 or eax, PAGE_EXECUTE_READWRITE

 lea esi, [ebx].dwOrgProtect
 invoke VirtualProtect, [ebx].pOrgProc, 5, eax, esi
 .if eax==0
  jmp LoadHookFunctionExit
 .endif

 ; 원본 stub 백업
 mov esi, [ebx].pOrgProc
 lea edi, [ebx].StubOrg
 movsd
 movsb

 ; Hook 함수로 점프하는 stub
 mov eax, [ebx].pHookProc
 sub eax, [ebx].pOrgProc
 sub eax, 5
 mov byte ptr [ebx].StubHook, 0E9h
 mov dword ptr [ebx].StubHook + 1, eax

 ; hook stub으로 교체
 lea esi, [ebx].StubHook
 mov edi, [ebx].pOrgProc
 movsd
 movsb

 xor eax, eax
 inc eax
LoadHookFunctionExit:
 ret
LoadHookFunction endp

; export functions
InitHook proc, pstrUserDefineDll:dword
 invoke GetCurrentDirectory, sizeof szUserDefineDll, addr szUserDefineDll
 invoke lstrcat, addr szUserDefineDll, chr$("")
 invoke lstrcat, addr szUserDefineDll, pstrUserDefineDll
 invoke RtlZeroMemory, addr ListTarget, sizeof ListTarget
 invoke RtlZeroMemory, addr ListHookDll, sizeof ListHookDll
 invoke RtlZeroMemory, addr ListHookProc, sizeof ListHookProc
 mov pListTarget, 0
 mov pListHookDll, 0
 mov pListHookProc, 0

 xor eax, eax
 inc eax
InitHookExit:
 ret
InitHook endp

AddTarget proc, pstrTarget:dword
 local lenTarget:dword

 invoke lstrlen, pstrTarget
 mov lenTarget, eax
 add eax, pListTarget
 .if eax >= sizeof ListTarget
  xor eax, eax
  jmp AddTargetExit
 .endif

 mov eax, offset ListTarget
 add eax, pListTarget
 invoke lstrcpy, eax, pstrTarget
 mov eax, pListTarget
 add eax, lenTarget
 inc eax
 mov pListTarget, eax

 xor eax, eax
 inc eax 
AddTargetExit:
 ret
AddTarget endp

AddHook proc, pstrDll:dword, pstrProc:dword
 local lenDll:dword
 local lenProc:dword

 invoke lstrlen, pstrDll
 mov lenDll, eax
 add eax, pListHookDll
 .if eax >= sizeof ListHookDll
  xor eax, eax
  jmp AddHookExit
 .endif

 invoke lstrlen, pstrProc
 mov lenProc, eax
 add eax, pListHookProc
 .if eax >= sizeof ListHookProc
  xor eax, eax
  jmp AddHookExit
 .endif

 mov eax, offset ListHookDll
 add eax, pListHookDll
 invoke lstrcpy, eax, pstrDll
 mov eax, pListHookDll
 add eax, lenDll
 inc eax
 mov pListHookDll, eax

 mov eax, offset ListHookProc
 add eax, pListHookProc
 invoke lstrcpy, eax, pstrProc
 mov eax, pListHookProc
 add eax, lenProc
 inc eax
 mov pListHookProc, eax

 xor eax, eax
 inc eax
AddHookExit:
 ret
AddHook endp

StartHook proc
 invoke SetWindowsHookEx, WH_CBT, addr GetMsgProc, hMyInstance, 0
 mov hCBTHook, eax

 ret
StartHook endp

EndHook proc uses ebx
 .if hCBTHook!=0
  invoke UnhookWindowsHookEx, hCBTHook
 .endif

EndHookExit:
 ret
EndHook endp

end DllEntry
```
