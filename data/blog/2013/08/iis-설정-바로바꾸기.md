---
title: "IIS 설정 바로바꾸기"
date: "2013-08-10"
categories: 
  - "memo"
tags: 
  - "iis"
---

metabase.xml 을 바로 수정.

아래 모든 작업은 관리자 계정으로 해야한다.

관리자계정으로 작업은 'runas' 명령어를 쓰면 간편하다.

```
# runas명령어로 IIS 관리자창 열기
runas /user:administrative_accountname mmc %systemroot%system32inetsrviis.msc
```

## 바로 수정하는 방법

1. IIS 관리자창에서 _로컬 컴퓨터_ 에 마우스 오른쪽 클릭으로 _속성_ 클릭
    
2. _메타데이터 바로 수정_ 을 체크
    
3. _systemrootsystem32inetservmetabase.xml_ 을 에디터프로그램으로 열어서 수정
