---
title: "테이블 데이터 복사 (identity_insert)"
date: "2016-03-06"
categories: 
  - "memo"
---

붙여넣기용

```
set identity_insert dbname..IssueCategory on

insert into dbname..IssueCategory
(id, name, position, depth, path, IsLeafNode, IsActive, IsDelete, CategoryName1, CategoryName2, CategoryName3, CategoryName4, AcceptAllowIssueEmployee, Parent_id, Category1_id, Category2_id, Category3_id, Category4_id, Created, Updated, CreateBy_id, UpdateBy_id)
select
id, name, position, depth, path, IsLeafNode, IsActive, IsDelete, CategoryName1, CategoryName2, CategoryName3, CategoryName4, AcceptAllowManageEmployee, Parent_id, Category1_id, Category2_id, Category3_id, Category4_id, Created, Updated, CreateBy_id, UpdateBy_id
from original_dbname..IssueCategory

set identity_insert dbname..IssueCategory off
```
