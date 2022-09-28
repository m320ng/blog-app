---
title: "asp.net mvc core PUT \"405 Method Not Allowed\""
date: "2020-06-30"
categories: 
  - "tip"
  - "memo"
tags: 
  - "asp-net-mvc"
---

IIS 7.5

WebDAV 모듈 관련문제

web.config

```
<?xml version="1.0" encoding="utf-8"?>
    <configuration>
      <system.webServer>
          <modules runAllManagedModulesForAllRequests="false">
            <remove name="WebDAVModule" />
          </modules>
    </system.webServer>
</configuration>
```

WebDAV모듈을 제거하면 된다.
