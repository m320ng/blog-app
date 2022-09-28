---
title: "ssh 아이디/비밀번호 없이 로그인"
date: "2014-10-02"
categories: 
  - "memo"
---

\-> client

ssh-keygen -t rsa -b 2048 -v id\_rsa (개인키) id\_rsa.pub (공개키) 생성 공개키를 등록하고 이후 개인키로 로그인한다.

ssh-copy-id -i ~/.ssh/id\_rsa.pub '-p 30022 root@heyo.iptime.org' (heyo.iptime.org서버의 ~/.ssh/authorized\_keys에 추가됨)

ssh -i ~/.ssh/id\_rsa -p30022 root@heyo.iptime.org
