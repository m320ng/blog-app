---
title: "ssh tunnels을 이용한 포트 우회 (ssh 터널링)"
date: "2013-08-10"
categories: 
  - "tip"
tags: 
  - "ssh-tunnel"
---

# ssh tunnels을 이용한 포트 우회

## 포워딩

1) Local port forwarding

_클라이언트->서버_

```
ssh -L포트번호1:호스트명:포트번호2 접속서버
```

클라이언트에서 포트번호1로 Listening Listening 으로 연결하면 접속서버내에서 호스트명:포트번호2 로 포워딩된다.

2) Remote port forwarding

_서버->클라이언트_

```
ssh -R포트번호1:호스트명:포트번호2 접속서버
```

접속서버에서 포트번호1로 Listening Listening 으로 연결하면 클라이언트내에서 호스트명:포트번호2 로 포워딩된다.

**plink (윈도우용 ssh)**

[http://putty.org](http://putty.org) 에서 다운로드 이후 사용되는 ssh는 plink로 대체가능 혹은 gui가 지원되는 _putty_ 로도 가능하다.

## 예시1

\[허용되지 않은곳에서 ssh 접속\] 사내의 네트워크상에서만 abc.com서버의 22번 포트에 접근이 가능하다고 할 때 허용되지 않은곳에서 접속할 수 있도록 우회서버 구성. 우회서버는 foo.com 20001포트로 한다. foo.com서버의 ssh tunnel(22번포트)를 이용하여 우회하도록 한다.

사내PC 에서

```
ssh -R20001:abc.com:22 -p22 -g foo.com
```

foo.com 서버에 20001번 포트로 listening이 시작된다. 20001번포트로 접근을하면 abc.com의 22번포트로 포워딩된다.

_보안이슈_

```
nano /etc/ssh/sshd_config

GatewayPorts yes
```

127.0.0.1로 listening이 걸리는경우 -g를 이용하여 다시 다른포트로 바인딩을 건다.

```
ssh -L 10001:localhost:20001 -g localhost
```

## 예시2

```
내부 1362 - 외부서버 8101 - 외부서버 8000
```

**\[Private\]**

```
plink -R 119.64.23.220:8101:localhost:1362 -P 8100 heyo.no-ip.org
```

(putty로 keep alive설정하여 세션으로 등록해 이용하는것이 편하다)

SSH서버(heyo.no-ip.org) 8101포트가 LISTENING 되며 8101포트로 connection시 로컬의 1362로 포워딩된다

하지만 127.0.0.1:8101 로 LISTENING 이 되어 내부에서만 접속이 가능하다

plink에도 ssh의 -g 옵션과 같은게 있으면 아래의 작업이 필요없을 것이다.

**\[SSH Server\]**

```
ssh -L 8000:localhost:8101 -g localhost
(-g Allows remote hosts to connect to local forwarded ports.)
```

로컬에서 로컬로 포워딩

0.0.0.0:8000 -> 127.0.0.1:8101 포워딩

ssh -g 옵션으로 다른곳에서 전부 접속할수 있도록 설정

sshd\_config 참고

```
24. AllowTcpForwarding yes

TCP 포워딩을 가능토록 설정하는 옵션이다.

25. GatewayPorts no

클라이언트에 포워드된 포트로 원격 호스트 들이 접속할 수 있도록 설정하는 옵션이다.
```

## netsh (윈도우)

```
netsh interface portproxy add v4tov4 listenport=22 connectport=22 connectaddress=13.200.1.1
```
