---
title: "SSMS(SQL Server Management Studio) 바로시작"
date: "2013-08-21"
categories: 
  - "tip"
tags: 
  - "ssms"
---

SSMS(SQL Server Management Studio)로 각기다른 디비를 여러개띄울때 매번 입력하기 힘들다.

이때 command line 옵션을 이용하여 한번에 띄울수 있다.

## 옵션

```
사용법:
ssms.exe [-S 서버 이름[인스턴스 이름]] [-d 데이터베이스] [-U 사용자] [-P 암호] [-E] [파일 이름[, 파일 이름]] [/?]
    [-S 연결할 SQL Server 인스턴스의 이름]
    [-d 연결할 SQL Server 데이터베이스의 이름]
    [-E]    Windows 인증을 사용하여 SQL Server에 로그인
    [-U 연결 시 사용할 SQL Server 로그인의 이름]
    [-P 로그인과 관련된 암호]
    [파일 이름[, 파일 이름]] 로드할 파일 이름
    [-nosplash] 시작 화면 표시 안 함
    [/?]    이 사용법 정보 표시
```

## 배치파일예제

```
@rem SSMS경로
@cd C:Program Files (x86)Microsoft SQL Server100ToolsBinnVSShellCommon7IDE

@start ssms -S 서버명1(아이피) -d 디비명 -U 사용자 -P 비밀번호 -nosplash
@start ssms -S 서버명2(아이피) -d 디비명 -U 사용자 -P 비밀번호 -nosplash
@start ssms -S 서버명3(아이피) -d 디비명 -U 사용자 -P 비밀번호 -nosplash
```

_SSMS 버그로 command line 실행시 개체 탐색기가 안나온다. 버그리포트가 올라오긴했는데 해결이 안된는 상황._

[https://connect.microsoft.com/SQLServer/feedback/details/155855/ssms-command-line-startup-not-connecting-to-object-explorer](https://connect.microsoft.com/SQLServer/feedback/details/155855/ssms-command-line-startup-not-connecting-to-object-explorer)

**시작후 'ALT+F8'을 눌러주자. (개체 탐색기 보기/갱신)**

## 추가고려사항

모두 같은 창타이틀 _SQL Server Management Studio_ 로 뜨면 한눈에 보기 힘들다.

이 창타이틀명을 서버명/디비명으로 표현하는 방법을 찾아보자.
