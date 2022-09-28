---
title: "vsflexgrid lpk (웹배포)"
date: "2013-08-10"
categories: 
  - "memo"
tags: 
  - "vsflexgrid"
---

웹상에서 Component사의 ActiveX배포하는 방법입니다.

(상당한 삽질끝에 소프트웨어 납품업체에 문의해서 알게 된 방법입니다.)

따지고 보면 어려운 부분은 크게 없는데 해보지 않았던 부분이기에 어렵게 느껴졌던 것이라고 사료됩니다.

1) 개발PC에 라이센스 키를 넣고 Component를 Install 합니다.

2) 인터넷에서 다운 받은 LPK\_TOOL.exe를 이용해 .lpk 파일을 만듭니다.

3) 제작사에서 제공한 인증된 OCX 파일이 들어있는 .cab 파일과 함께 배포 폴더에 복사 한 후

4) 웹화면내의 Obejct 태그를 삽입합니다.

2번 LPK\_TOOL은 인터넷에서 검색하면 쉽게 다운 받을 수 있을겁니다

3번 제작사에서 인증된 OCX파이 들어있는 .cab파일은 Install이 되면서 생성이 됩니다. 설치된 경로에 보시면 종류별로 .cab파일들이 있을겁니다.

4번 .lpk 오브젝트코드 (LPKPath는 절대경로이던 상대경로이던 상관 없습니다.)

```
<OBJECT CLASSID = "clsid:5220cb21-c88d-11cf-b347-00aa00a28331"><param name="wmode" value="transparent" /><PARAM NAME="LPKPath" VALUE="xxx.lpk"></OBJECT>
```

.cab 오브젝트코드 (vsflex8 사용)

```
<OBJECT id="fg" name="fg" Width="100%" Height="100%" classid="CLSID:C945E31A-102E-4a0d-8854-D599D7AED5FA" codebase="vsflex8.cab#version=8.0.20062.231">
<param name="wmode" value="transparent" /><PARAM name ="AUTOSTART" value ="TRUE"/>
</OBJECT>
```

그리고 한 페이지에 하나의 lpk object만 적용이 되더군요

이문제는 lpk파일을 작성시 왼쪽화면어서 여러개의 activeX를 추가하면 됩니다.

그럼 수고하시구요. 이글로 인해 검색의 번거로움이 조금이나마 줄었으면 하네요

아래의 내용을 참고하세요

http://www.aivosto.com/visdev/vdmbvis58.html

http://devcenter.infragistics.com/Support/KnowledgeBaseArticle.Aspx?ArticleID=933

http://msdn.microsoft.com/library/default.asp?url=/workshop/components/activex/licensing.asp

http://msdn.microsoft.com/library/default.asp?url=/workshop/author/dhtml/reference/properties/codebase.asp

http://support.microsoft.com/default.aspx?scid=kb;en-us;159923
