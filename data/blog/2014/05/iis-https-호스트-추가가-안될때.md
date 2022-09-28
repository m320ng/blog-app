---
title: "iis https 호스트 추가가 안될때"
date: "2014-05-09"
categories: 
  - "tip"
tags: 
  - "iis-https"
---

```
cd \windows\system32\inetsrv\

appcmd set site /site.name:"WebImage" /+bindings.[protocol='https',bindingInformation='*:443:image.bfcmall.co.kr']
```

[http://www.sslshopper.com/article-ssl-host-headers-in-iis-7.html](http://www.sslshopper.com/article-ssl-host-headers-in-iis-7.html)
