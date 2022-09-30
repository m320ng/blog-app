---
title: 'bcp(bulk copy)를 이용한 mssql 백업 복원'
date: '2013-08-10'
categories:
  - 'tip'
tags:
  - 'bcp'
  - 'mssql'
---

파일 테이블 백업 out

```bash
bcp setthetable..Board_notice out Board_notice.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Usetthetable -PPASSWORD -c
```

파일 테이블 복원 in

```bash
bcp karerumaru..Board_notice in Board_notice.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Ukarerumaru -PPASSWORD -c
```

쿼리 백업 out

```bash
bcp "SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Code) as resultNum, * FROM [setthetable].[dbo].[Zipcode]) as numberResults WHERE resultNum BETWEEN 0 AND 10000" queryout Zipcode1.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Usetthetable -PPASSWORD -c
bcp "SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Code) as resultNum, * FROM [setthetable].[dbo].[Zipcode]) as numberResults WHERE resultNum BETWEEN 10001 AND 20000" queryout Zipcode2.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Usetthetable -PPASSWORD -c
bcp "SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Code) as resultNum, * FROM [setthetable].[dbo].[Zipcode]) as numberResults WHERE resultNum BETWEEN 20001 AND 30000" queryout Zipcode3.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Usetthetable -PPASSWORD -c
bcp "SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Code) as resultNum, * FROM [setthetable].[dbo].[Zipcode]) as numberResults WHERE resultNum BETWEEN 30001 AND 40000" queryout Zipcode4.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Usetthetable -PPASSWORD -c
bcp "SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Code) as resultNum, * FROM [setthetable].[dbo].[Zipcode]) as numberResults WHERE resultNum BETWEEN 40001 AND 50000" queryout Zipcode5.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Usetthetable -PPASSWORD -c
```

쿼리 복원 in

```bash
bcp karerumaru..Zipcode in Zipcode1.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Ukarerumaru -PPASSWORD -c
bcp karerumaru..Zipcode in Zipcode2.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Ukarerumaru -PPASSWORD -c
bcp karerumaru..Zipcode in Zipcode3.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Ukarerumaru -PPASSWORD -c
bcp karerumaru..Zipcode in Zipcode4.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Ukarerumaru -PPASSWORD -c
bcp karerumaru..Zipcode in Zipcode5.txt -t"||t" -r"@@n" -Sxxx.239.118.xxx -Ukarerumaru -PPASSWORD -c
```

local

```bash
bcp mhdev..Sponsor in c:Sponsor.txt -t"t" -r"n" -S.SQLEXPRESS -c -T
```
