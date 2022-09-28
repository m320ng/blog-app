---
title: "많은 수의 폼 키, 파일 또는 JSON 페이로드 멤버가 있는 ASP.NET 요청이 예외를 나타내며 실패함"
date: "2013-08-13"
categories: 
  - "memo"
tags: 
  - "asp-net-mvc"
---

많은 수의 폼 키, 파일 또는 JSON 페이로드 멤버가 있는 ASP.NET 요청이 예외를 나타내며 실패함

http://support.microsoft.com/kb/2661403/ko

MaxHttpCollectionKeys

## web.config

```
<add key="aspnet:MaxJsonDeserializerMembers" value="2000000"/>
<add key="aspnet:MaxHttpCollectionKeys" value="2000000" />
```
