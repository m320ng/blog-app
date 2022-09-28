---
title: "postgre dump restore (docker)"
date: "2022-02-08"
categories: 
  - "memo"
---

```
docker pull postgres

docker run -d -p 5432:5432 -e POSTGRES_PASSWORD="비밀번호" --name PostgreSQL01 postgres

docker cp 20220125_slamp PostgreSQL01:/backups

docker exec PostgreSQL01 pg_restore -U root -d slamp /backups/20220125_slamp

docker exec -it PostgreSQL01 /bin/bash

# psql -U postgres

\l
\c database_name
\dt
```
