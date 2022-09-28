---
title: "Sum throws 'Value cannot be null' error on linq query"
date: "2013-08-13"
categories: 
  - "memo"
tags: 
  - "nhibernate"
  - "hibernate"
---

Sum throws 'Value cannot be null' error on linq query

Linq query fails when trying to sum a decimal: session.Query().Where(x => x.Customer.Id == 4).Sum(x => x.Amount);

nullable로 캐스팅

\-->

Linq query fails when trying to sum a decimal: session.Query().Where(x => x.Customer.Id == 4).Sum(x => (int?)x.Amount) ?? 0;
