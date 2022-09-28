---
title: "XBMC 재생 깨짐 (W510)"
date: "2013-11-13"
categories: 
  - "etc"
tags: 
  - "xbmc"
  - "xbmc-외부플레이어"
  - "xmbc-팟플레이어"
---

W510(Acer태블릿)문제인지 Atom문제인지 특정 동영상이 XBMC에서 재생이 원할하지 않고 회색화면으로 깨져서 나온다.

PotPlayer에서는 제대로 재생되는걸로 보아.. 아예 재생을 못하는 영상은 아닌거 같은데 말이다..

일단 일단 기본플레이어를 PotPlayer로 변경하는 방법으로 해결을 했는데

근본적으로 코덱이나 필터설정부분을 찾아봐야겠다.

## 1\. 기본 플레이어 변경방법

참고 :

[http://forum.xbmc.org/showthread.php?tid=167410](http://forum.xbmc.org/showthread.php?tid=167410)

[http://forums.overclockers.co.uk/showthread.php?p=21977369](http://forums.overclockers.co.uk/showthread.php?p=21977369)

1. 먼저 플레이어 설정파일을 연다.

위치는 C:Program FilesXBMCsystemplayercorefactory.xml

1. 외부 동영상 플레이어를 연결한다.

PotPlayer로 연결을 했다. args로 인자도 넘길 수 있다.

근데 PotPlayer는 외부인자도 별게 없어서..

전체화면으로 재생하려면 PotPlayer설정에서 미리 전체화면으로 설정해놔야한다.

```
    <playercorefactory>
      <players>
        <player name="PotPlayer" type="ExternalPlayer" audio="false" video="true">
          <filename>C:Program FilesDAUMPotPlayerPotPlayer.exe</filename>
          <!--
          <args>/fullscreen</args>
          -->
          <forceontop>false</forceontop>
          <!-- 외부 플레이어 화면을 맨 위에 놓을지를 정합니다.
          KMP는 KMP의 자체 옵션을 이용하는게 좋습니다. -->
          <hidexbmc>true</hidexbmc>
          <!-- XBMC를 최소화합니다. KMP가 종료되면 자동으로 복구됩니다.
          KMP의 환경설정에서 "동영상 재생 종료시 프로그램 종료" 설정을 권장합니다. -->
          <hideconsole>false</hideconsole>
          <hidecursor>false</hidecursor>
        </player>
      </players>

      <rules name="system rules">
        <rule name="rtv" protocols="rtv" player="DVDPlayer" />
        <rule name="hdhomerun/myth/mms/udp" protocols="hdhomerun|myth|cmyth|mms|mmsh|udp" player="DVDPlayer" />
        <rule name="lastfm/shout" protocols="lastfm|shout" player="PAPlayer" />
        <rule name="rtmp" protocols="rtmp" player="videodefaultplayer" />

        <!-- dvdplayer can play standard rtsp streams -->
        <rule name="rtsp" protocols="rtsp" filetypes="!(rm|ra)"  player="PAPlayer" />

        <!-- Internet streams -->
        <rule name="streams" internetstream="true">
          <rule name="aacp/sdp" mimetypes="audio/aacp|application/sdp" player="DVDPlayer" />
          <rule name="mp2" mimetypes="application/octet-stream" filetypes="mp2" player="PAPlayer" />
        </rule>

        <!-- DVDs -->
        <rule name="dvd" dvd="true" player="DVDPlayer" />
        <rule name="dvdimage" dvdimage="true" player="DVDPlayer" />

        <!-- Only dvdplayer can handle these normally -->
        <rule name="sdp/asf" filetypes="sdp|asf" player="DVDPlayer" />

        <!-- Pass these to dvdplayer as we do not know if they are audio or video -->
        <rule name="nsv" filetypes="nsv" player="DVDPlayer" />

        <!-- pvr radio channels should be played by dvdplayer because they need buffering -->
        <rule name="radio" filetypes="pvr" filename=".*/radio/.*" player="DVDPlayer" />
      </rules>

      <rules action="prepend">
        <rule video="true" player="PotPlayer"/>
      </rules>
    </playercorefactory>
```

## 그외에 살펴볼만한 내용

[http://community.acer.com/t5/Tablets/W510-Video-Hardware-Gpu-decoding/td-p/13865](http://community.acer.com/t5/Tablets/W510-Video-Hardware-Gpu-decoding/td-p/13865)

W510 Video Hardware Gpu decoding

Media Player Classic will also use hardware acceleration if you do this:

1. Start MPC and go to View --> Options -->External Filters
    
2. Click on "Add Filters" and select "Microsoft DTV-DVD Video Decoder"
    
3. Click on "Prefer"
    
4. Restart MPC with a 1080p file and enjoy hardware accelerated video with CPU less than 10%.
