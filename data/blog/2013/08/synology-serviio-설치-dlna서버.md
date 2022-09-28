---
title: "synology serviio 설치 (dlna서버)"
date: "2013-08-25"
categories: 
  - "etc"
tags: 
  - "synology"
  - "dlna"
  - "serviio"
---

## serviio?

기본적으로 dsm에 미디어서버가 있으나 자막보기가 안되서 불편하다. 공개 dlna서버 serviio를 설치해보자.

## 설치 순서

1. 패키지센터 소스추가
    
    [http://packages.pcloadletter.co.uk](http://packages.pcloadletter.co.uk)
    
2. Java 설치
    
    버전은 6, 7 둘다 상관없다고 되어있다. _(이글 작성 기준은 7로 설치)_
    
    1. 오라클 홈페이지에서 Java SE Embedded 다운로드
        
        [http://www.oracle.com/technetwork/java/embedded/downloads/javase/index.html](http://www.oracle.com/technetwork/java/embedded/downloads/javase/index.html)
        
        **ARMv5 Linux - Headless EABI, SoftFP ABI, Little Endian2** 다운로드
        
        /volume1/public 에 복사
        
    2. 패키지센터에서 Java SE for Embedded 7 설치
        
3. Serviio 설치
    
    패키지센터에서 Serviio 설치. **이때 버전확인은 필수!** _(이글 작성 기준은 1.2.x 버전.)_
    
    별도로 dsm에서 설정하는 버튼이 없다. 다만 로그확인은 바로 가능한데 패키지센터에 설치버튼 바로아래 있다.
    
4. ServiioConsole 설치
    
    1. ServiioConsole 다운로드
        
        [http://www.serviio.org](http://www.serviio.org)
        
        윈도우용을 다운받자. serviio-1.x.x-win-setup.exe
        
        **dsm에서 설치한 server와 버전이 맞아야한다.** 버전이 다르다면 아래링크를 확인해보자.
        
        [http://www.videohelp.com/tools/Serviio/old-versions](http://www.videohelp.com/tools/Serviio/old-versions)
        
    2. 설치및 실행설정
        
        **설치시 폴더를 되도록이면 루트에 설치하자. (eg. c:serviio)** 경로명에 따라 설정파일을 못찾는 경우가 있다.
        
        serviio 설치된 폴더아래 bin 으로 이동
        
        ServiioConsole.exe.vmoptions 메모장으로 열어서 수정한다.
        
        ```
        -Dserviio.remoteHost=192.168.0.10
        ```
        
        192.168.0.10는 본인 아이피(or 도메인)에 맞게 설정한다. 23423포트, 23424포트를 사용하니 방화벽설정이 되어있다면 확인하자.
        
        ServiioConsole.exe 실행.
        
        혹시 실행이 안되거나 에러메세지가 나타난다면 serviio 설치된 폴더아래 log폴더를 확인해보자. (더불어 dsm에 서버 로그도)
        
5. ServiioConsole 설정
    
    \[Library\] 탭에서 폴더 추가. (Add Path..)
    
    /volume1/video
    
    /volume1/photo
    
    /volume1/music
    
    등등..
    
    추가하는 폴더는 dsm에서 \[제어판\]-\[공유폴더\] 에서 **읽기이상**의 권한을 serviio 사용자에게 줘야한다.
    
    Libarary에 폴더를 추가하고 Save를 누르면 이미지 인덱싱을 시작하는데.. 사진에따라 시간이 오래걸릴수 있다. \[Show Status\]로 진행상황 체크. _(너무 많으면 일단 사진폴더는 제외시켜도..)_
    
    \[Remote\] 탭에서 비밀번호를 설정한다.
    
    비밀번호를 설치하면 아래의 링크로 접속이 가능하다.
    
    [http://192.168.0.10:23424/mediabrowser](http://192.168.0.10:23424/mediabrowser)
    
6. 이후 설정
