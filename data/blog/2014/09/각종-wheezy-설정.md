---
title: "각종 wheezy 설정"
date: "2014-09-19"
categories: 
  - "memo"
---

#1. nginx

## 완전 재설치

제거후

```
sudo apt-get purge nginx nginx-common nginx-full
```

재설치

```
sudo apt-get install nginx
```

혹은,

```
sudo dpkg --force-confmiss -i /var/cache/apt/archives/nginx-common_*.deb 
```

## 버전 업그레이드

You should add wheezy-backports to your /etc/apt/sources.list:

```
deb http://ftp.de.debian.org/debian/ wheezy-backports main contrib non-free
```

and then on a console:

```
aptitude update
aptitude -t wheezy-backports install nginx
```
