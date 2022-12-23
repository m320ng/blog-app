---
title: 'rancher ingress 업로드 용량 설정'
date: '2022-12-23'
categories:
  - 'memo'
tags:
  - 'rancher'
---

nginx client_max_body_size 0
413 request entity too large

ingresses - config

```
annotations nginx.ingress.kubernetes.io/proxy-body-size 0
```
