---
title: "mstsc(원격데스크톱) 바로연결"
date: "2013-08-21"
categories: 
  - "tip"
tags: 
  - "mstsc"
  - "rdp"
---

mstsc.exe command line 명령을 이용해서 바로 접속을 해보자

## 옵션

```
MSTSC [<연결 파일>] [/v:<서버[:포트]>] [/admin] [/f[ullscreen] [/w:<너비> /h:<높이>] [/public] | [/span] [/multimon] [/migrate] [/edit "연결 파일"]
"연결 파일" -- 연결할 .RDP 파일의 이름을 지정합니다.
/v:<서버[:포트]> -- 연결할 원격 컴퓨터를 지정합니다.
/admin -- 서버를 관리하기 위한 세션에 사용자를 연결합니다.
/f -- 전체 화면 모드에서 원격 데스크톱을 시작합니다.
/w:<너비> -- 원격 데스크톱 창의 너비를 지정합니다.
/h:<높이> -- 원격 데스크톱 창의 높이를 지정합니다.
/public -- 공개 모드에서 원격 데스크톱을 실행합니다.
/span -- 원격 데스크톱의 너비와 높이를 로컬 가상 데스크톱에 맞추고 필요한 경우 여러 모니터 간에 확장합니다. 여러 모니터 간에 확장하려면 모니터를 직사각 형태로 배열해야 합니다.
/multimon -- 현재 클라이언트 쪽 구성과 일치하도록 원격 데스크톱 세션 모니터 레이아웃을 구성합니다.
/edit -- 편집을 위해 지정한 .RDP 연결 파일을 엽니다.
/migrate -- 클라이언트 연결 관리자로 만든 레거시 연결 파일을 새 .RDP 연결 파일로 마이그레이션합니다.
```

command line에 계정과 비밀번호 설정하는 옵션이 없다. 'cmdkey.exe' 를 이용하여 어쨋든 한번에 접속할 수 있게 설정하자.

_(cmdkey.exe는 xp에는 없는 명령어. 그냥 복사해다가 실행하면 동작한다는 말이 있던데.. 시도해보진 않음)_

## cmdkey 옵션

```
저장된 사용자 이름 및 암호를 만들고, 표시하고 삭제합니다.

이 명령의 구문:

CMDKEY [{/add | /generic}:대상 이름 {/smartcard | /user:사용자 이름 {/pass{:암호}}} | /delete{:대상 이름 | /ras} | /list
{:대상 이름}]

예:

  사용 가능한 자격 증명을 나열하려면:
     cmdkey /list
     cmdkey /list:대상 이름

  도메인 자격 증명을 만들려면:
     cmdkey /add:대상 이름 /user:사용자 이름 /pass:암호
     cmdkey /add:대상 이름 /user:사용자 이름 /pass
     cmdkey /add:대상 이름 /user:사용자 이름
     cmdkey /add:대상 이름 /smartcard

  일반 자격 증명을 만들려면:
     일반 자격 증명을 만들려면 /add 스위치는 대신 /generic 스위치를 사용할 수도 있습니다.

  기존 자격 증명을 삭제하려면:
     cmdkey /delete:대상 이름

  RAS 자격 증명을 삭제하려면:
     cmdkey /delete /ras
```

## 배치파일

두 명령어를 이용해서 배치파일을 만들어보자.

1) 간단한 배치파일

cmdkey로 계정/비밀번호를 저장후 mstsc 실행후 다시 삭제

```
@ECHO OFF
SET SERVER=서버명(아이피)
SET USER=계정명
SET PASS=비밀번호

TITLE RDP:%SERVER% 연결 콘솔

cmdkey /generic:%SERVER% /user:%USER% /pass:%PASS%
mstsc /v:%SERVER%
cmdkey /delete:%SERVER%
```

2) 종료했을때 재연결

세션타임이 짧을때 종료후 바로 다시 연결하도록 구성. 포커스를 잡기위해 START로 다시실행

```
@ECHO OFF

SET SERVER=서버명(아이피)
SET USER=계정명
SET PASS=비밀번호

TITLE RDP:%SERVER% 재연결 콘솔

SET /P CONTINUE="접속하시겠습니까? ([Y]/N) : "
IF /I "%CONTINUE%"=="N" GOTO END

cmdkey /generic:%SERVER% /user:%USER% /pass:%PASS%
mstsc /v:%SERVER%
cmdkey /delete:%SERVER%

START %~nx0

:END
EXIT
```
