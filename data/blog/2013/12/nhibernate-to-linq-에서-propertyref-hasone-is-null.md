---
title: "nhibernate to linq 에서 propertyref hasone is null"
date: "2013-12-09"
categories: 
  - "memo"
---

```
                    var query = from x in CardApprLog.Query()
                            where x.IsDelete == false 
                                && (x.RequestDeductWelCard == null || x.RequestDeductWelCard.State == RequestDeductWelCardState.취소)
                                && list.Contains(x.Id)
                            select x;
```

x.RequestDeductWelCard == null 이 처리가 안됨. x == null 과 같이 표현.

null이 표현이 안되는건가?
