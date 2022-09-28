---
title: "mssql query log"
date: "2014-01-13"
categories: 
  - "memo"
---

select db\_name(st.dbid) DBName ,qs.total\_elapsed\_time/1000 ,creation\_time ,last\_execution\_time,text from sys.dm\_exec\_query\_stats qs cross apply sys.dm\_exec\_sql\_text(qs.plan\_handle)st join sys.dm\_exec\_cached\_plans cp on qs.plan\_handle = cp.plan\_handle where creation\_time >= '2014-01-13 14:30:00' --and db\_name(st.dbid) is not null and cp.objtype = 'proc' --and text like '%delete%' order by last\_execution\_time desc;
