---
title: "oracle 윈도우 한글 깨질때"
date: "2014-05-27"
categories: 
  - "tip"
tags: 
  - "오라클"
  - "oracle"
  - "nls_lang"
  - "한글깨짐"
---

# 오라클(oracle) 윈도우 한글 깨질때

1) 현재 오라클 DB의 언어 설정 확인

```
select * from nls_database_parameters where parameter = 'NLS_CHARACTERSET';
```

2) 클라이언트(윈도우) 설정 확인및 변경

a. regedit에서 NLS\_LANG 변경

```
HKEY_LOCAL_MACHINE\SOFTWARE\ORACLE

HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\ORACLE
```

b. 시스템 환경변수에서 NLS\_LANG 변경(등록)

```
제어판->시스템및 보안->시스템->고급시스템 설정->환경 변수->시스템 변수
```

이때 NLS\_CHARACTERSET를 NLS\_LANG 형식에 맞게 입력해야하는데 앞에 국가언어를 붙여줘야한다.

KO16MSWIN949라고 나올경우 KOREAN\_KOREA.KO16MSWIN949 이렇게 입력하면되고

UTF8라고 나올 경우에는 KOREAN\_KOREA.UTF8 로 변경해주면된다.

AMERICAN\_AMERICA.UTF8 로 입력하면 메세지가 영어로 표현된다.
