---
title: '데이터베이스명명(SQL)'
date: '2013-08-23'
categories:
  - 'memo'
---

## 인덱스명명

1. IX\_\{U/N\}\{C/N\}*테이블명*컬럼1\_컬럼2

   IX {'->'} 인덱스 U/N {'->'} Unique | Non-unique C/N {'->'} Cluster | Non-cluster

2. 컬럼명에 언더바(\_)는 camel 형식으로 변경

   Member_id {'->'} MemberId

3 include index일경우 include에 포함된 컬럼은 생략

```
CREATE INDEX [인덱스명]
ON MemberWelPointLog (Type)
INCLUDE (Member_id, Date, SavePoint, DeductPoint)

이경우 인덱스명은 IX_NN_MemberWelPointLog_Type
```

1. 사용예

uhiuhihih

```
IX_NC_MemberWelPointLog_Type_Date => MemberWelPointLog 테이블에 Type,Date 컬럼으로 non-unique & cluster 인덱스 (Covered)
IX_NN_MemberWelPointLog_Type => MemberWelPointLog 테이블에 Type 컬럼으로 non-unique & non-cluster 인덱스
IX_UN_MemberWelPointLog_MemberId => MemberWelPointLog 테이블에 Member_id 컬럼으로 unique & non-cluster 인덱스
```

## 기타 PK/FK 테이블 명명

1. PK는 Id (orm에서 생성되는부분)
2. FK는 테이블명\_Id (orm에서 생성되는부분)

   Member가 ClientComp의 FK를 가지고 있다면 ClientComp의 FK는 ClientComp_Id

3. Many-to-Many 에서의 매핑테이블은 테이블1\_\{연관명\}테이블2\{s\} 와 같이 언더바(\_)로 연결하며 연결뒤에 연관명을 붙여주고 뒤는 복수형태(s)로 명명한다

   컨텐츠팝업 복지관 ContentPopup {'->'} WelSite 제외복지관

   ContentPopup_ExceptWelSites

   ContentPopup 테이블명 Except 연관명 WelSite 테이블명 s 복수형태

## 저장프로시져 명명

1. P\_\{Add/Create/Get/Delete/Update/Gen\}\_기타작업명

   P\_ {'->'} 프로시져 prefix \{Add/Create/Get/Delete/Update/Gen\} {'->'} 작업기능 기타작업명 {'->'} 테이블과 연관되는 작업명

   예) P_Update_MemberWelPointPendding
