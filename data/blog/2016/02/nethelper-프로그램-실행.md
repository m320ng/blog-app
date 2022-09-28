---
title: "NetHelper 제한된 프로그램 실행"
date: "2016-02-25"
categories: 
  - "hacking"
tags: 
  - "nethelper"
  - "제한프로그램"
---

삭제하면 편하겠지만 삭제할 수 없는 경우 프로그램 실행을 제한하는 부분을 막아보자.

라이센스없는 프로그램같은 경우 미리 차단해주니 무심코 설치할 수 있는부분을 막아준다생각하면 편하다면(?) 편할 수 있겠지만

문제가 될거 같지 않는 게임같은 경우도 차단해버리니 이부분을 해결하고자 뒤적거려 본거다.

일단 제어판 프로그램 추가/삭제 목록제거는 regedit로 레지스터리에서 제거하면된다.

레지스터리위치

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall
HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall
```

프로그램을 실행했을때 제한된 프로그램일 경우 실행되는 것을 막고 경고 팝업창을 보여준다.

그리고 제한된 프로그램을 실행했을때 NetHelper에 설정된 서버로 보고한다.

구현은 아마 CreateProcess을 hooking해서 제어하는거 같다. 별도의 dll이 삽입되거나하진 않는걸로봐서 dll injection은 아닌거같고 sys를 올리는 커널후킹이 아닌가싶다.

실행제어를 막는부분은 NHCASysMon.exe이란 프로세스가 담당한다.

실행제한 프로그램목록은 Policy\\NH\_MngSWinfo4.ini 를 기준으로 제한한다.

해서 간단하게 ini에서 프로그램 목록을 수정하면 해결 되겠다.

```
C:\Program Files (x86)\IZEX\NetHelper Client V7.0 x64\NHCASysMon.exe
C:\Program Files (x86)\IZEX\NetHelper Client V7.0 x64\Policy\NH_MngSWinfo4.ini
```

탐색기에서 IZEX를 숨겼으므로 탐색기로 들어갈순 없다. 직접 경로를 치거나 간단하게 작업관리자에서 파일위치열기로 들어갈수 있다.

NH\_MngSWinfo4.ini 에서 원하는 프로그램을 삭제한후 NHCASysMon.exe kill하면 변경된 ini을 읽게된다.

프로세스 kill

```
taskkill /im nhcasysmon.exe /f
```
