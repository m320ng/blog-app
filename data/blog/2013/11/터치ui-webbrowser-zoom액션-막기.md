---
title: "터치UI webbrowser Zoom액션 막기"
date: "2013-11-29"
categories: 
  - "tip"
---

html { -ms-touch-action: pan-x pan-y; }

html { -ms-touch-action:none; }

html, \*, body, div, table { -ms-touch-action:none !important; }

\-ms-content-zooming: none;

@-ms-viewport { min-zoom: 1; max-zoom: 1; user-zoom: fixed; }

_in script_

document.body.setAttribute("style","-ms-touch-action: none;");

그외

[http://social.msdn.microsoft.com/Forums/wpapps/en-us/e2c334b5-e464-46c1-a4a9-9571c48cb465/webbrowser-control-vs-ie10-different-behaviors?forum=wpdevelop](http://social.msdn.microsoft.com/Forums/wpapps/en-us/e2c334b5-e464-46c1-a4a9-9571c48cb465/webbrowser-control-vs-ie10-different-behaviors?forum=wpdevelop)
