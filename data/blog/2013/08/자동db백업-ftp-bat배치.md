---
title: '자동db백업 ftp bat배치'
date: '2013-08-10'
categories:
  - 'code'
tags:
  - 'bat'
---

자동db백업 ftp bat배치

```bat
@echo off
set yy=%date:~0,4%
set mm=%date:~5,2%
set dd=%date:~8,2%

cd c:backup
bcp "exec [xxx_20120912]..[up_Sales_LIST]" queryout dump_%yy%%mm%%dd%.txt -t"t" -r"n" -Sxxx.xxx.xxx.xxx -U아이디 -P패스워드 -c
echo open xxx.cafe24.com> db.dat
echo id>> db.dat
echo password>> db.dat
echo binary >> db.dat
echo lcd c:backup >> db.dat
echo put dump_%yy%%mm%%dd%.txt >> db.dat
echo bye >> db.dat
ftp -s:db.dat >> result_%yy%%mm%%dd%.txt
del db.dat
pause
```
