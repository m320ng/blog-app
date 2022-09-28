---
title: "3d프린터 스위치 체크 gcode"
date: "2018-10-12"
categories: 
  - "memo"
tags: 
  - "3d프린터-스위치확인"
---

오토레벨링 센서 확인이나 엔드스탑 동작확인

`M119`

```
Send: M119
Recv: Reporting endstop status
Recv: x_min: TRIGGERED
Recv: y_min: TRIGGERED
Recv: z_min: open
Recv: ok
```
