---
title: "C# 에서 WebKit"
date: "2013-10-05"
categories: 
  - "etc"
---

오랜만에 C#.Net 어플리케이션을 만들게 되었다. 어플리케이션은 거의 대부분 MFC로만 만들었는데.. 이번에는 워낙 간단한 프로그램이고 유지보수성향이 강해 C#으로 해볼까한다.

HTML컨테이너로 특정 폼을 보여주고 수정받을 수 있도록 구현하려고 하는데 기본 WebBrowser 컨트롤을 이용하게 되면 설치된 IE 버전을 타게 되서 배포시 문제점이 예상된다.

해서.. 생각한방법이 WebKit을 이용해서 구현해보면 어떨까해서 찾아보았다.

The WebKit Open Source Project

[http://www.webkit.org/](http://www.webkit.org/)

먼저 WebKit 홈페이지다. windows 용 소스를 받아 빌드하면 된다. 환경 세팅도해야하고 빌드도하고.. C#용 컨트롤로 만들고.. 할일이 많아보안다.

좀 더 찾아보자.

WebKit.Net : .NET 포팅버전. 0.5 에서 멈춘듯. 최종 일자 2010-08-28

[http://webkitdotnet.sourceforge.net/](http://webkitdotnet.sourceforge.net/)

.NET으로 포팅해놓은게 있다!! ...근데 2010년이 최종 업데이트.

일단 이것으로 샘플 코드를 만들어보자. 제대로 동작하면 어차피 C#컨트롤 감싸는건 비슷할테고.. 나중에 최신 WebKit엔진만 다시 빌드해서 넣으면 별차이 없지 않을까?

몇가지 인터페이스관련 형변환 오류가 나는데.. 그냥 형변환만 적당히 바꿔주면 컴파일은 잘된다.

근데.. 느린거 같다. 왜이렇게 느리지??

간단한 입력 폼및 자바스크립트연동 위주니깐 일단은 사용해보고.. 정안되면 그냥 기본 WebBrowser로 바꿔야겠다.

## 추가

Awesomium

[http://www.awesomium.com/](http://www.awesomium.com/)

최근까지 업데이트 되고 있다. 각종 문서화나 소스정리가 잘되어있어서 쉽게 적용 가능하다.

한가지 단점은 인쇄를 지원하지 않는다.. ㄷㄷㄷ

대안책으로 pdf문서로 출력해주는 방법을 제공하고있다.
