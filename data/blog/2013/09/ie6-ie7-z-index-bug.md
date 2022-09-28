---
title: "IE6 IE7 position:relative, z-index Bug"
date: "2013-09-06"
categories: 
  - "tip"
---

1. z-index 먹힘
    
    ie6,7 에서는 상위노드가 **z-index없는** position:relative 로 설정되었을 경우 하위 노드의 position:absolute 나 position:relative 가 먹혀버리는경우가 있다. 대부분의 브라우져에서는 z-index가 설정되지 않을경우 이를 무시해주는데 ie6,7 에서는 꼭 상위노드에 z-index로 우선순위를 잡아줘야 제대로 동작한다.
    
2. hidden 이 안됨
    
    ie6,7 에서는 하위노드에서 position:relative로 설정되었을경우 절대 hidden이 안된다. 상위노드도 relative 로 설정하면된다.
