---
title: "무료 SSL 사이트 구축 (Ubuntu 16.04, nginx)"
date: "2018-09-29"
categories: 
  - "etc"
tags: 
  - "무료-https"
  - "letsencrypt"
  - "certbot"
  - "무료-ssl"
  - "렛츠인크립트"
---

현재 보고있는 워드프레스(note.heyo.me)에 SSL을 적용해보았다.

Let's Encrypt에서 발급하는 인증서를 기본으로 하였다.

> Let's Encrypt는 사용자에게 무료로 TLS 인증서를 발급해주는 비영리기관이다. 모질라 재단, 페이스북, 구글 등 많은 업체가 스폰서로 등록되어 있다. 발급된 인증서는 3개월간 사용할 수 있으며, 만료 전 갱신하면 계속해서 사용이 가능하다. 유효기간이 짧고 DV 및 와일드카드 인증서만 발급이 가능하다는 단점이 있다. [Let's Encrypt 나무위키](https://namu.wiki/w/Let's%20Encrypt)

몇가지 제약사항이 있지만.. 등록부터 갱신까지 도와주는 툴이 있어 큰불편함은 없다. **Certbot** ([https://certbot.eff.org](https://certbot.eff.org))는 Apache, Nginx 환경에서 도메인등록, 서버설정, 자동갱신을 제공한다. Ubuntu 16.04 에서는 설치 또한 간편하다.

# Certbot 설치

1) 저장소 등록

```
sudo add-apt-repository ppa:certbot/certbot
```

2) 저장소 업데이트

```
sudo apt-get update
```

3) 설치

```
sudo apt-get install python-certbot-nginx
```

# Nginx 설정확인및 도메인등록

1) https 서비스하고자하는 사이트 설정 파일을 확인한다.

```
sudo vi /etc/nginx/sites-enabled/heyo.me
(기본설정파일은 sudo vi /etc/nginx/sites-available/default)
```

note.heyo.me server영역

```
server_name note.heyo.me;
```

Certbot이 서버설정을 할때 server\_name 값을 기반으로 찾으므로 이 부분을 확인한다.

2) 도메인 등록

도메인등록은 서브도메인 기준으로 하나씩 등록해야한다.

```
sudo certbot --nginx -d note.heyo.me
(여러개를 한번에 등록시 sudo certbot --nginx -d example.com -d www.example.com)
```

최초 등록시 이메일 주소를 입력하고 약관동의를 받는다. 이때 해당서버에서 정상적으로 서비스되는 도메인인지 확인을 한다. (자동) 확인에 성공하면 선택 메세지나 나타난다.

```
Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel):
```

2번은 http 요청을 받을때 모두 https로 리다이렉트 시키겠다는거고 1번은 리다이렉트 없이 https만 등록한다는 말이다. 결과적으로 2번을 선택하면 사이트설정파일에

```
server {
    if ($host = note.heyo.me) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;

    server_name note.heyo.me;
    return 404; # managed by Certbot
}
```

이런 설정 값이 더 추가된다. 이건 나중에 따로 설정해도 되니깐 일반적으로는 1번을 설정하면 되겠다. 선택하면 certbot이 사이트설정 파일을 수정하고 nginx를 reload 시킨다. 사이트설정파일을 확인해보면

```
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/note.heyo.me/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/note.heyo.me/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
```

ssl 관련 설정값이 추가되어있다.

# 마무리

Let's Encrypt인증서는 90일마다 갱신해줘야한다. 하지만 certbot이 주기적으로 갱신해주므로 따로 해줄것은 없다. 수동으로 갱신하는 명령어도 있다. (테스트용)

```
sudo certbot renew --dry-run
```

https 서비스(443포트) 확인

```
ubuntu@ip-172-26-9-2:~$ sudo netstat -ant
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:4567            0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
```

ufw 설정했을 경우 방화벽확인

```
ubuntu@ip-172-26-9-2:~$ sudo ufw status
Status: active

To                         Action      From
-- ------ ----
OpenSSH                    ALLOW       Anywhere
Nginx HTTP                 ALLOW       Anywhere
Nginx HTTPS                ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
Nginx HTTP (v6)            ALLOW       Anywhere (v6)
Nginx HTTPS (v6)           ALLOW       Anywhere (v6)
```

443포트가 열여있고 ufw도 허용되어있음에도 안될경우 서버방화벽 확인

참고: [https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
