---
title: "VB ActiveX DLL 만들때 CLS ID를 VC 처럼 고정시키는 방법"
date: "2013-08-10"
categories: 
  - "memo"
tags: 
  - "activex"
  - "vb"
---

메뉴->프로젝트->프로젝트속성->구성요소텝 에서

버전호환성을 이진호환성으로

아래는 이진호환성에 대한 부가설명입니다.

"이진호환성은 개발자의 구성요소를 사용하여 컴파일된 프로젝트사이에서 호환성을 유지하는데 유용하다.

이옵션은 이미생성된 DLL의 CLSID를 상속받아서 컴파일한다.비쥬얼베이직에서 구성요소를 처음 컴파일하기

전에는 부여받은 CLSID가 없기때문에 \[이진호환성\]옵션을 선택할수 없다.그래서 처음컴파일할때에는 디폴트값인

\[프로젝트호환성\]으로 컴파일한후,다음에 컴파일할때 \[이진호환성\]으로 컴파일한다."
