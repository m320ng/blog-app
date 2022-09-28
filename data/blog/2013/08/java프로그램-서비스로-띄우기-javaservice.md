---
title: "java프로그램 서비스로 띄우기 (javaservice)"
date: "2013-08-13"
categories: 
  - "code"
tags: 
  - "javaservice"
---

## JavaService 프로젝트 이용

http://forge.ow2.org/projects/javaservice/

32bit 64bit 구분 필수.

이벤트뷰어활용

## install.bat

```
@set TARGET_APP=com.maillink.automail.client.AutomailTranManager
@set JVM_PATH=C:Progra~1Javajdk1.7.0_25jrebinserverjvm.dll


@set DIST_BIN=C:ml_automailbin
@set DIST_HOME=C:ml_automaillib
@set OUT_LOG=C:ml_automaillogSystem.log
@set ERR_LOG=C:ml_automaillogError.log
@set JSEXE=C:JavaService-2.0.7.64JavaService.exe

%JSEXE% -install MailLinkAuto %JVM_PATH% -Djava.class.path=%CLASSPATH%;%DIST_HOME%ml_automail.jar;%DIST_HOME%classes12.zip;%DIST_HOME%msbase.jar;%DIST_HOME%mssqlserver.jar;%DIST_HOME%msutil.jar;%DIST_HOME%Sprinta2000.jar;C:sqljdbc_4.0korsqljdbc4.jar -Xms128M -Xmx256M -start %TARGET_APP% -out %OUT_LOG% -err %ERR_LOG% -current %DIST_BIN% -manual
```

## uninstall.bat

```
@set JSEXE=C:JavaService-2.0.7.64JavaService.exe
%JSEXE% -uninstall MailLinkAuto
```
