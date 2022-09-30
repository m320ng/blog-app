---
title: 'gitlab-runner docker로 설치 실행'
date: '2022-02-17'
categories:
  - 'memo'
---

## 직접 실행

```bash
docker run -d --name gitlab-runner --restart always \
-v /srv/gitlab-runner/config:/etc/gitlab-runner \
-v /var/run/docker.sock:/var/run/docker.sock \
gitlab/gitlab-runner:latest
```

## docker-compose 이용

docker-compose.yml

```yml
version "3"

services:
  gitlab-runner:
    container_name: gitlab-runner
    image: gitlab/gitlab-runner:latest
    restart: always
    volumes:
      - "/srv/gitlab-runner/config:/etc/gitlab-runner"
      - "/var/run/docker.sock:/var/run/docker.sock"
```

```bash
docker-compose up -d
```

- 컨테이너 shell 환경 접속

```bash
docker exec -it 컨테이너명 /bin/bash
```

- gitlab-runner 등록 \[runner토큰\]은 gitlab \[setting\]-\[ci/di\]-\[runner\] 에서 확인

```bash
gitlab-runner register -n \
--url https://gitlab.com/ \
--registration-token [runner토큰] \
--description macbook \
--executor docker \
--docker-image docker:latest \
--docker-volumes /var/run/docker.sock:/var/run/docker.sock
```
