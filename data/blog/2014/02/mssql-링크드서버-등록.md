---
title: "mssql 링크드서버 등록"
date: "2014-02-12"
categories: 
  - "memo"
---

exec sp\_addlinkedserver @server=N'external\_point\_link', @srvproduct=N'MSSQL', @provider=N'SQLOLEDB', @datasrc=N'10.10.10.x', @catalog=N'external\_point\_link'

exec sp\_addlinkedsrvlogin 'external\_point\_link', 'false', NULL, 'external\_point\_link', 'xxxxx'
