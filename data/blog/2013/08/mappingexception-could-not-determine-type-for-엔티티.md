---
title: "MappingException: Could not determine type for: 엔티티"
date: "2013-08-13"
categories: 
  - "memo"
tags: 
  - "nhibernate"
  - "hibernate"
---

컬럼이 중복되는 오류

주로 Map을 잘못걸었을때 발생함.

Entity나 Component를 Map으로 prefix없이 걸어서 필드가 중복되었을 경우

다른 참조 Entity쪽에서 잘못 걸어도 같은 오류가 발생함

Map(x => x.Order) 검색
