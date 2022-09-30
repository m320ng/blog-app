---
title: 'wheezy lighttpd webdav설치 (포고플러그)'
date: '2014-08-28'
categories:
  - 'memo'
---

lighttpd/1.4.31 (ssl) - a light and fast webserver

```
apt-get install lighttpd lighttpd-mod-webdav libxml2 sqlite
cp /etc/lighttpd/conf-available/10-webdav.conf /etc/lighttpd/conf-enabled
10-webdav.conf 수정
```

# 주석 webdav.sqlite-db-name = "/var/run/lighttpd/lighttpd.webdav_lock.db"

추가

```
$HTTP\["url"\] =~ "^($|/)" {
  server.document-root = "/data"
  dir-listing.activate = "enable"
  webdav.activate = "enable"
  webdav.is-readonly = "disable"
  webdav.sqlite-db-name = "/var/run/lighttpd/lighttpd.webdav_lock.db"
  auth.backend = "plain"
  auth.backend.plain.userfile = "/etc/lighttpd/webdav.user"
  auth.require = ( "/" => ( "method" => "digest", "realm" => "Media server", "require" => "valid-user" ) )
}
```
