---
title: "Cross-Domain IFrame 스크립트 연동 (1)"
date: "2016-10-06"
categories: 
  - "code"
tags: 
  - "크로스-도메인-스크립트"
  - "cross-domain-iframe"
---

# Cross-Domain IFrame 스크립트 연동

도메인이 다르면 보안 이슈때문에 스크립트에서 서로 객체를 접근 할 수 없다.

크로스 도메인에서 스크립트 연동하는 방법에 대해서 알아보자.

## 방법 1 : _3 iframe 연동_

가장 널리 알려직 방법으로 a.com 과 b.com 이 스크립트를 연동해야하고 b.com이 a.com의 iframe으로 구현되어있다면

b.com에서 iframe으로 a.com 의 스크립트 페이지를 호출한다. 이때 querystring으로 전달할 값을 전달한다.

```
<iframe src="http://a.com/interface.do?height=1000"/> 
```

이런식으로 말이다.

호출된 스크립트 페이지에서 파라메타로 넘어온값을 가지고 스크립트에서 parent.parent 로 접근해서 스크립트 연동을 한다.

말로설명하면 복잡한데 예제를 보면 간단하다.

## 방법 2 : _hash를 이용한 연동_

기본적으로 방법 1과 동일한데 querystring 대신 #해시를 이용한다고 보면된다.

```
<iframe src="http://a.com/interface.do#height=1000"/>
```

값을 이렇게 넘기고

onhashchange 같은 이벤트로 해시가 달라질때마다 인식해서 값을 받아온다.

페이지 리프레시가 일어나지 않으므로 좀 더 빠릿하게 구동된다 보면 되겠다.

다만 브라우저를 타므로 구형브라우저에서는 안될수 있다.

## 방법 3 : _postMessage를 이용한 연동_

마지막으로 postMessage api를 이용하는 방법이다. 스크립트상에서 연동가능하므로 별다른 방법없이 그냥 구현가능하다.

다만 일부 최신브라우저에서만 가능하다.

일단 기본적으로 방법1만 사용하면 모든 브라우저에서 구현가능하다고보면되고

방법2는 좀더 적은 브라우저, 방법3은 거기에서 좀더 적은 브라우저를 대응 할 수 있다.

차례로 적용함에 따라서 유연한 연동을 할 수 있다.

다음 포스트에는 실제 세가지 방법의 소스를 각각 구현해보도록 하고

마지막으로 세가지를 합쳐서 브라우저에 최적화된 방법이 적용될 수 있는 스크립트를 짜보도록 하겠다.

그냥 참고용 사이트

[http://stackoverflow.com/questions/5908676/yet-another-cross-domain-iframe-resize-qa](http://stackoverflow.com/questions/5908676/yet-another-cross-domain-iframe-resize-qa)

[https://github.com/davidjbradshaw/iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer)

[https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage)

[http://easyxdm.net/wp/](http://easyxdm.net/wp/)
