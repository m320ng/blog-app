---
title: "dotnet tool 확인할 수 없습니다.(error NU1100: NU1101:)"
date: "2019-12-16"
categories: 
  - "tip"
tags: 
  - "dotnet-tool"
---

# dotnet tool 찾지못하는 문제

```
error: '.NETCoreApp,Version=v3.1'에 대해 '*****'을(를) 확인할 수 없습니다.

or

error NU1100: '.NETCoreApp,Version=v3.1'에 대해 '*****'을(를) 확인할 수 없습니다.
error NU1100: '.NETCoreApp,Version=v3.1/any'에 대해 '*****'을(를) 확인할 수 없습니다.
도구 패키지를 복원할 수 없습니다.
'dotnet-aspnet-codegenerator' 도구를 설치하지 못했습니다. 다음과 같은 이유 때문일 수 있습니다.

* 미리 보기 릴리스를 설치하려고 하는데 --version 옵션을 사용하여 버전을 지정하지 않았습니다.
* 이 이름으로 패키지가 검색되었지만 .NET Core 도구가 아니었습니다.
* 아마도 인터넷 연결 문제 때문에 필요한 NuGet 피드에 액세스할 수 없습니다.
* 도구 이름을 잘못 입력했습니다.

패키지 명명 적용을 비롯하여 더 많은 이유를 보려면 https://aka.ms/failure-installing-tool을 방문하세요.

error NU1101: '*******' 패키지를 찾을 수 없습니다. 원본에 ID가 Microsoft Visual Studio Offline Packages인 패키지가 없습니다.
```

## 해결책

1) 버전문제

```
  --version 3.1.0 등 구체적으로 버전 명시
```

2) 기존에 설치된 Nuget과 출동(구버전 visual studio)

```
  %appdata%\NuGet 에서 Nuget.config 삭제
```

> 윈키+R 실행창에 %appdata%\\NuGet 입력.
