---
title: 'window에서 netsh 이용한 터널링 (내부망 외부망 연결)'
date: '2020-07-10'
categories:
  - 'tip'
tags:
  - '터널링'
  - '포트프록시'
---

# 윈도우에서 터널링

현재PC 11433포트에 접속시에 172.20.10.101:1433으로 연결

- 포트 포워드 추가

```bash
netsh interface portproxy add v4tov4 listenport=11433 connectport=1433 connectaddress=172.20.10.101
```

- 삭제

```bash
netsh interface portproxy delete v4tov4 11433
```
