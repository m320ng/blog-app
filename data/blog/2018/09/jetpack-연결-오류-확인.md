---
title: "jetpack 연결 오류 확인"
date: "2018-09-27"
categories: 
  - "tip"
tags: 
  - "wordpress"
  - "jetpack"
---

# Jetpack 연결 오류

> Error authorizing. Page is refreshing for another attempt. This site cannot be accessed.

## 연결확인

[https://jetpack.com/support/debug/?url=http://note.heyo.me/](https://jetpack.com/support/debug/?url=http://note.heyo.me/)

## 직접확인

curl -A 'Jetpack by WordPress.com' -d 'demo.sayHello' http://note.heyo.me/xmlrpc.php

## 결과(정상)

```
<?xml version="1.0" encoding="utf-8"?> 
<methodCall> 
  <methodName>demo.sayHello</methodName> 
  <params> 
    <param>
      <value>admin</value>
    </param> 
   </params> 
</methodCall>
```

## 결과(오류)

```
<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
  <fault>
    <value>
      <struct>
    <member>
      <name>faultCode</name>
      <value><int>-32700</int></value>
    </member>
    <member>
      <name>faultString</name>
      <value><string>parse error. not well formed</string></value>
    </member>
      </struct>
    </value>
  </fault>
</methodResponse>
```

[https://mikestaszel.com/2018/04/12/fixing-wordpress-jetpack-connection-errors/](https://mikestaszel.com/2018/04/12/fixing-wordpress-jetpack-connection-errors/)

이 경우 php-xml 설치

```
sudo apt-get install php-xml
```
