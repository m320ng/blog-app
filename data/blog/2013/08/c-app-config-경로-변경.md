---
title: "c# app.config 경로 변경"
date: "2013-08-10"
categories: 
  - "memo"
tags: 
  - "csharp"
---

c# app.config 경로 변경

```
AppDomain.CurrentDomain.SetData("APP_CONFIG_FILE",
                @"C:\Users\song\Documents\Visual Studio 2010\Projects\eIparkProject\BatchApplication\test\app.config");
```
