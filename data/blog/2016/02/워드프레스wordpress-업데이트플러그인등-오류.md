---
title: "워드프레스(wordpress) 업데이트(플러그인등) 오류"
date: "2016-02-03"
categories: 
  - "etc"
tags: 
  - "wordpress"
---

각종 플러그인 테마 워드프레스 업데이트시 다운로드를 못받는 현상

```
Warning: 예상치 못한 에러가 발생했습니다. WordPress.org나 서버 설정에 오류가 있습니다. 문제가 지속되면 지원 포럼에 문의하세요. (워드프레스가 WordPress.org에 안전한 연결을 설정할 수 없습니다. 서버 관리자와 연락하세요.) 

다운로드 실패. error:0D07908D:lib(13):func(121):reason(141)
```

원인은 [php curl ssl 인증관련 오류](http://curl.haxx.se/mail/curlphp-2002-11/0038.html) 로 웹호스팅 서버 설정에 문제가 있어보인다.

일단 임시적인 해결책은 ssl관련 주석처리하는 방법으로 해결했다.

/wp-includes/class-http.php

request 메소드 ssl관련 주석처리

```
line 132, 133

//'sslverify' => true,
//'sslcertificates' => ABSPATH . WPINC . '/certificates/ca-bundle.crt',
```
