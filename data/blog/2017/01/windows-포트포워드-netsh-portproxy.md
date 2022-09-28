---
title: "windows 포트포워드 (netsh portproxy)"
date: "2017-01-06"
categories: 
  - "memo"
tags: 
  - "포트포워드"
  - "portproxy"
---

netsh interface portproxy add v4tov4 listenport=8080 connectport=80 connectaddress=192.168.1.150

netsh interface portproxy show all

netsh interface portproxy reset
