---
title: "netdrive 명령창 (ndcmd)"
date: "2014-08-29"
categories: 
  - "tip"
tags: 
  - "netdrive"
  - "netdrive-명령창"
  - "ndcmd"
  - "netdrive-umount"
  - "netdrive-오류"
---

마운트 명령

```
"C:\Program Files\NetDrive\ndcmd.exe" url[:port] -m -l드라이브문자 -u유저명 -p비밀번호 -cutf-8
```

마운트해제 명령

```
"C:\Program Files\NetDrive\ndcmd.exe" url[:port] -d -l드라이브문자 -u유저명 -p비밀번호 -cutf-8
```

드라이브 연결 오류가 발생했을때도 마운트명령으로 연결했다 해제하면 해결된다.
