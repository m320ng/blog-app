---
title: "zoom video sdk \"set aec delay20\" \"fps error\" SharedArrayBuffer관련 오류"
date: "2021-08-24"
categories: 
  - "code"
tags: 
  - "zoom"
---

## 관련 zoom document 내용

[https://marketplace.zoom.us/docs/guides/stay-up-to-date/announcements#web-isolation](https://marketplace.zoom.us/docs/guides/stay-up-to-date/announcements#web-isolation)

## SharedArrayBuffer 지원못할때 발생하는 오류

크롬 92버전(2021년 7월 업데이트)부터 cross-origin isolation이 필수가 됨

Making your website "cross-origin isolated" using COOP and COEP Use COOP and COEP to set up a cross-origin isolated environment and enable powerful features like `SharedArrayBuffer` performance.measureUserAgentSpecificMemory() and high resolution timer with better precision.

SharedArrayBuffer on Chrome desktop requires cross-origin isolation starting from Chrome 92. Learn more at SharedArrayBuffer updates in Android Chrome 88 and Desktop Chrome 92.

[https://web.dev/coop-coep/](https://web.dev/coop-coep/)

## SharedArrayBuffer 지원 확인

해당웹페이지에서 개발자모드(F12) 콘솔에서 간단히 확인할 수 있다.

```
typeof SharedArrayBuffer ==='function'
> false
```

## 해결방법 1 : COOP, COEP 설정

- nginx 설정

```
      add_header Cross-Origin-Embedder-Policy require-corp;
      add_header Cross-Origin-Opener-Policy same-origin;
```

- 개발 react 설정

zoom video sdk react 샘플 config-overrides.js addDevServerCOOPReponseHeader 참조

```
const addDevServerCOOPReponseHeader = (config) => {
  config.headers = {
    ...config.headers,
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  };
  return config;
};
```

이 방법은 COEP가 require-corp로 설정되서 외부 스크립트를 사용할때는 문제가 되기도 한다.

(카카오 주소찾기 api 같은..)

## 해결방법 2 : OriginTrials 설정 (94버전까지만 허용)

(\* 2021년 11월 02일기준 103버전까지로 변경됨)

[https://developer.chrome.com/origintrials/#/trials/active](https://developer.chrome.com/origintrials/#/trials/active)

SharedArrayBuffers in non-isolated pages on Desktop platforms > REGISTER

등록후 나온값을 meta 태그나 http header에 넣는다.

[https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md#valid-until-feedback](https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md#valid-until-feedback)

- meta 태그

```
<meta http-equiv="origin-trial" content="**insert your token as provided in the developer console**">
```

- nginx 설정

```
add_header Origin-Trial **token as provided in the developer console**
```

- 개발 react 설정

zoom video sdk react 샘플 config-overrides.js addDevServerCOOPReponseHeader 참조

```
const addDevServerCOOPReponseHeader = (config) => {
  config.headers = {
    ...config.headers,
    'Origin-Trial':
      '**token as provided in the developer console**',
  };
  return config;
};

```
