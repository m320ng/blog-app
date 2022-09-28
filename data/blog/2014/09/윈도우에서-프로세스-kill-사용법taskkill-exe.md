---
title: "윈도우에서 프로세스 kill 사용법(taskkill.exe)"
date: "2014-09-11"
categories: 
  - "tip"
tags: 
  - "윈도우kill"
---

explorer를 죽이고 explorer가 물고있는 db파일을 삭제하는 배치파일

```
@echo off  
taskkill /f /im explorer.exe  
attrib "%userprofile%appdatalocaliconcache.db" -s -r -h  
del /q "%userprofile%appdatalocaliconcache.db"  
start explorer.exe  
exit
```
