---
title: 'mssql 모든 테이블 삭제'
date: '2013-08-10'
categories:
  - 'memo'
tags:
  - 'mssql'
---

mssql 모든 테이블 삭제

```sql
exec sp_MSforeachtable "DROP TABLE ? PRINT '? dropped' "
```
