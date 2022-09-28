---
title: "엑셀읽기 숫자, 문자가 NULL값으로 반환될때 (HDR, IMEX)"
date: "2013-09-03"
categories: 
  - "memo"
tags: 
  - "excel"
---

Microsoft.Jet.OLEDB.4.0 Extended Properties

- HDR : YES를 하게 되면 Excel Sheet의 제일 윗줄은 데이타가 아닌 타이틀이 존재한다는 것을 알립니다. NO를 하게 되면 첫줄부터 데이타가 시작함을 알립니다.
    
- IMEX : Excel 데이터를 로드할 경우, Excel의 ISAM 드라이브에서 처음 몇 개의 행을 읽어서 데이터의 유형을 결정하게 됩니다. 이 때, 데이터 유형은 **텍스트 형(nvarchar)이거나 숫자 형(Float)형** 둘 중의 하나로 결정되어 집니다. 이로인해 연속된 문자타입 중 숫자타입이 나오면 그값은 Null로 읽어 들여 지는 현상이 생기며, 반대의 경우도 마찬가지 입니다. 기본값은 0이며, 1로 셋팅을 하면 숫자가 정상적으로 읽어 들여집니다.
    

IMEX의 가능한 설정은 다음과 같습니다.

```
0 is Export mode
1 is Import mode
2 is Linked mode (full update capabilities)
```

이 옵션은 레지스터리값 TypeGuessRows 의 줄수만큼 비교를 합니다. 기본값이 8이므로 8줄안에 혼합값이 없을경우 IMEX옵션이 무시될 수 있습니다. 전체 적용을 하려면 해당 레지스터리값을 0으로 변경합니다.

32bit 위치

```
HKEY_LOCAL_MACHINESOFTWAREMicrosoftJet4.0EnginesJet 4.0Excel
```

64bit 위치

```
HKEY_LOCAL_MACHINESOFTWAREWow6432NodeMicrosoftJet4.0EnginesJet 4.0Excel
```

참고

[http://support.microsoft.com/kb/194124](http://support.microsoft.com/kb/194124)
