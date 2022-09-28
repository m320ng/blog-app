---
title: "node.js 설치 (소스설치)"
date: "2014-11-23"
categories: 
  - "memo"
tags: 
  - "node-js"
  - "raspberry-pi"
---

## 1\. git 소스 다운로드

```
git clone https://github.com/joyent/node.git
cd node
git checkout v0.10.31
```

## 2\. build

```
./configure --without-snapshot
make && make install
```
