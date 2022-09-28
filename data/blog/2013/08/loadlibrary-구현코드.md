---
title: "LoadLibrary 구현코드"
date: "2013-08-10"
categories: 
  - "memo"
tags: 
  - "assembly"
---

# 구글메모 _2010.2.10_

kernel.dll basic exception handler 핸들러 주소를 이용해서 kernel.dll 주소를 얻는거 같은데

내 기억으로는 7부는 안될듯??

어딘가 새로짠게 있을텐데..

```
#!asm
mov eax, fs:[0] 
mov ecx, dword ptr [eax]
cmp ecx, 0FFFFFFFFh
jnz short -8
add eax, 8
mov eax, dword ptr [eax] ; kernel.dll basic exception handler
jmp short +1
dec eax
cmp word ptr [eax], 5A4Dh
jnz short -8
    ; eax = kernel.dll base address
add eax, 1D54h ; offset 1D4Fh + 5byte
    ; eax = LoadLibraryExA address
push 006C6C64h   ; "ava.dll" text
push 2E617661h
push 0
push 0
lea ecx, [esp + 8]
push ecx   ; pointer "ava.dll"
call +0
pop ecx
add ecx, 0Ch
push ecx   ; return address
mov edi, edi
push ebp
mov ebp, esp
jmp eax
add esp, 8
```
