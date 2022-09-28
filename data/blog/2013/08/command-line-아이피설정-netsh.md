---
title: "command line 아이피설정 (netsh)"
date: "2013-08-23"
categories: 
  - "tip"
tags: 
  - "cmd-아이피설정"
---

netsh interface ip show config

무선 네트워크 연결

```
netsh -c int ip set address name="무선 네트워크 연결" source=static addr=172.16.90.123 mask=255.255.255.0 gateway=172.16.90.254 gwmetric=0

netsh -c int ip set dns name="무선 네트워크 연결" source=static addr=10.10.10.6 register=PRIMARY
```
