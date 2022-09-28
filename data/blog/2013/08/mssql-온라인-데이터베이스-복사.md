---
title: "mssql 온라인 데이터베이스 복사"
date: "2013-08-10"
categories: 
  - "memo"
tags: 
  - "mssql"
---

```
RESTORE DATABASE ycpqc_20200916 FROM DISK = N'd:\backup\ycpqc.bak'
WITH FILE = 1, 
MOVE N'insave' TO N'd:\MSSQL_DATA\ycpqc_20200916.mdf', 
MOVE N'insave_log' TO N'd:\MSSQL_DATA\ycpqc_20200916_log.ldf', 
NOUNLOAD, 
REPLACE, 
STATS = 10
GO

ALTER DATABASE 디비명 

ALTER DATABASE 디비명 SET OFFLINE WITH NO_WAIT

ALTER AUTHORIZATION ON DATABASE::MyDatabase TO MyLoginUser;

CREATE LOGIN [계정명] WITH PASSWORD = '패스워드', DEFAULT_DATABASE = [DB명], CHECK_POLICY = OFF

CREATE SCHEMA [스키마명] AUTHORIZATION [계정명]

CREATE USER [계정명] FOR LOGIN [계정명]
```
