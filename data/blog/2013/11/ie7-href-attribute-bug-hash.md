---
title: "ie7 href attribute bug (hash)"
date: "2013-11-27"
categories: 
  - "tip"
---

ie7에서

'innerHTML'로 HTML을 넣을때

a링크의 href에 hash만 넣었는데도 실제 attribute로 가져올때에는 풀경로까지 다붙어서 가져온다.

```
<a id="next-btn" href="#next">NEXT</a>
```

이것을

```
var href = $('#next-btn').attr('href');
alert(href);
```

# next 가 나올것을 기대하지만, http://www.xxx.com/list#next 를 가져온다. -\_-

$('#next-btn')\[0\].hash 이나 #으로 잘라쓰자..

참고 : [http://forum.jquery.com/topic/getting-the-href-is-broken-in-ie7](http://forum.jquery.com/topic/getting-the-href-is-broken-in-ie7)
