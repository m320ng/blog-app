---
title: "mssql history 조회"
date: "2013-08-10"
categories: 
  - "memo"
tags: 
  - "mssql"
---

```
select
DB_NAME(dbid) dbname
,OBJECT_NAME(objectid) objname
,qs.total_elapsed_time
,creation_time
,last_execution_time
,text
from sys.dm_exec_query_stats qs cross apply sys.dm_exec_sql_text(qs.plan_handle) st
join sys.dm_exec_cached_plans cp on qs.plan_handle = cp.plan_handle
where creation_time >= '2011-10-21 00:00:00'
--and db_name(st.dbid) is not null and cp.objtype = 'proc'
and text like '%delete%'
order by last_execution_time desc;

select top 10
DB_NAME(dbid) dbname
,OBJECT_NAME(objectid) objname
,*
from sys.dm_exec_query_stats qs cross apply sys.dm_exec_sql_text(qs.plan_handle) st


----------------------------------------------------------------------------------------------

select
DB_NAME(dbid) dbname
,OBJECT_NAME(objectid) objname
,qs.total_elapsed_time
,creation_time
,last_execution_time
,text
from sys.dm_exec_query_stats qs cross apply sys.dm_exec_sql_text(qs.plan_handle) st
join sys.dm_exec_cached_plans cp on qs.plan_handle = cp.plan_handle
where last_execution_time >= '2011-09-01 00:00:00'
--and db_name(st.dbid) is not null and cp.objtype = 'proc'
and db_name(st.dbid) = 'mjdb'
--and text like 'DELETE%'
order by last_execution_time desc;

select 
st.*,qs.*,req.*
from 
sys.dm_exec_query_stats qs cross apply sys.dm_exec_sql_text(qs.sql_handle) st 
left outer join sys.dm_exec_requests req on req.query_hash = qs.query_hash
where last_execution_time >= '2011-10-21 00:00:00'
and text like '%Select Into%'


select top 100
(Select Text from sys.dm_exec_sql_text(a.sql_handle)) as Query, 
b.login_name, 
b.login_time, 
b.program_name, 
b.host_name 
from sys.dm_exec_requests a Inner Join sys.dm_exec_sessions b on a.session_id = b.session_id
where login_time >= '2011-10-01 00:00:00'


select * from sys.dm_exec_sessions
where login_time >= '2011-10-24 00:00:00' and login_time <= '2011-10-25 00:00:00'

select top 10 
*
from sys.dm_exec_requests
where sql_handle is not null


select sq.text,r.* from sys.dm_exec_requests r 
join sys.dm_exec_sessions s 
on r.session_id = s.session_id 
CROSS APPLY sys.dm_exec_sql_text (r.sql_handle) sq 

select * from sys.dm_exec_sessions

select * from sys.dm_exec_sql_text(0x02000000C3F7F215873DB36110FEEF01BFD8651964491F1D)

select top 1 * from tbl_order

select top 1 * from tbl_order_product

select top 1 * from tbl_settlement_history

select * from tbl_login_log

dbcc log('master', 2)
```
