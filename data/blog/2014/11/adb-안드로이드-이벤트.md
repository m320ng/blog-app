---
title: "adb 안드로이드 화면저장및 이벤트"
date: "2014-11-14"
categories: 
  - "hacking"
---

# 기본

1. 이벤트 수집
    
    adb shell getevent
    
2. 이벤트를 발생해본다. (화면에 터치) 저장하고 16진수를 10진수로 변경.
    
3. 저장한 이벤트 발생
    
    adb shell sendevent /dev/input/event7 1 330 1 adb shell sendevent /dev/input/event7 3 58 1 adb shell sendevent /dev/input/event7 3 53 668 adb shell sendevent /dev/input/event7 3 54 429 adb shell sendevent /dev/input/event7 0 2 0 adb shell sendevent /dev/input/event7 0 0 0 adb shell sendevent /dev/input/event7 1 330 0 adb shell sendevent /dev/input/event7 3 58 0 adb shell sendevent /dev/input/event7 3 53 668 adb shell sendevent /dev/input/event7 3 54 429 adb shell sendevent /dev/input/event7 0 2 0 adb shell sendevent /dev/input/event7 0 0 0
    
4. 화면저장
    
    adb shell screencap /sdcard/screen.png adb pull /sdcard/screen.png screen.png
    

# 좀더

1. 이벤트발생 : sendevent를 세미콜론으로 이어붙인다.
    
    adb shell sendevent /dev/input/event7 1 330 1;sendevent /dev/input/event7 3 58 1;sendevent /dev/input/event7 3 53 668;
    
2. 화면저장 : screencap시 파일명저장대신 stdout으로 출력하고 저장한다. '\\r'를 지우는과정이 포함된다.
    
    adb shell screencap -p | sed 's/\\r$//' > screen.png
