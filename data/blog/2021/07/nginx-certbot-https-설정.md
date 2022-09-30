---
title: 'docker 서비스시 nginx certbot https 설정'
date: '2021-07-19'
categories:
  - 'code'
tags:
  - 'certbot'
  - 'nginx'
---

## .well-known 작업

```nginx
# my.domain.com
server {
  listen 80;
  server_name my.domain.com;

  location ~ /.well-known/acme-challenge {
      allow all;
      root /var/www/certbot;
  }
}
```

## 현재 작업폴더 기준

```bash
pwd
/home/ubuntu/webhome
```

## certbot 이미지를 이용해 등록

```bash
sudo docker run -it --rm --name certbot \
-v '/home/ubuntu/webhome/certbot/conf:/etc/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/logs:/var/log/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/data:/var/www/certbot' \
certbot/certbot certonly --webroot --webroot-path=/var/www/certbot --email 이메일 --agree-tos --no-eff-email -d my.domain.com
```

## ssl 반영

```nginx
# my.domain.com
server {
  listen 80;
  server_name my.domain.com;
  return 301 https://$server_name$request_uri;
}
server {
  listen 443 ssl;
  client_max_body_size 10M;
  server_name my.domain.com;

  #ssl_certificate /etc/nginx/ssl/archive/my.domain.com/fullchain1.pem;
  #ssl_certificate_key /etc/nginx/ssl/archive/my.domain.com/privkey1.pem;
  ssl_certificate /etc/nginx/ssl/live/my.domain.com/fullchain.pem;
  ssl_certificate_key /etc/nginx/ssl/live/my.domain.com/privkey.pem;
}
```

## 명령어 목록

```bash
# 등록
sudo docker run --rm --name certbot \
-v '/home/ubuntu/webhome/certbot/conf:/etc/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/logs:/var/log/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/data:/var/www/certbot' \
certbot/certbot certonly --webroot --webroot-path=/var/www/certbot --email 이메일 --agree-tos --no-eff-email -d my.domain.com

# 갱신
sudo docker run --rm --name certbot \
-v '/home/ubuntu/webhome/certbot/conf:/etc/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/logs:/var/log/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/data:/var/www/certbot' \
certbot/certbot renew \
--cert-name my.domain.com

# 만료일 확인
sudo docker run -it --rm --name certbot \
-v '/home/ubuntu/webhome/certbot/conf:/etc/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/logs:/var/log/letsencrypt' \
-v '/home/ubuntu/webhome/certbot/data:/var/www/certbot' \
certbot/certbot certificates
```
