---
title: "국내 주요 DNS서버 nslookup"
date: "2013-08-27"
categories: 
  - "tip"
tags: 
  - "bat"
  - "국내dns"
  - "nslookup"
---

nslookup.bat

```
@echo off
@rem KT  168.126.63.1  168.126.63.2 
@rem SK브로드밴드  210.94.0.73  221.139.13.130 
@rem 두루넷  210.117.65.1  210.117.65.2 
@rem 신비로  202.30.143.11  203.30.143.11 
@rem 데이콤  164.124.101.2  203.248.240.31 
@rem 드림라인  210.181.1.24  210.181.4.25 
@rem 파워콤  164.124.107.9  203.248.252.2 

set domain=axa.eiparkclub.com
set list=168.126.63.1, 210.94.0.73, 210.117.65.1, 202.30.143.11, 164.124.101.2, 210.181.1.24, 164.124.107.9

for %%i in (%list%) do (
    echo # %%i ################################
    nslookup %domain% %%i
)
pause
```
