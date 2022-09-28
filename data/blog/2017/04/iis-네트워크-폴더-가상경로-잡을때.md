---
title: "iis 네트워크 폴더 가상경로 잡을때"
date: "2017-04-18"
categories: 
  - "memo"
---

1. 스토리지 계정정보와 같은 계정 생성
    
2. web.config 추가
    

system.web 노드안에

```
<identity impersonate="true" password="패스워드" userName="아이디" />
```
