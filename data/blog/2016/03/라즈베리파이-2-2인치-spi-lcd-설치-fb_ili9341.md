---
title: "라즈베리파이 2.2인치 spi lcd 설치 (fb_ili9341)"
date: "2016-03-07"
categories: 
  - "etc"
tags: 
  - "라즈베리파이"
  - "spi-lcd"
  - "ili9341"
---

제품은 이것인듯. [http://www.aliexpress.com/item/Smart-Electronics-2-2-Inch-240-320-Dots-SPI-TFT-LCD-Serial-Port-Module-Display-ILI9341/32478452462.html](http://www.aliexpress.com/item/Smart-Electronics-2-2-Inch-240-320-Dots-SPI-TFT-LCD-Serial-Port-Module-Display-ILI9341/32478452462.html)

최신 Raspberry Pi 이미지에는 Kernel에 FBTFT가 있다.

```
$ sudo apt-get update
$ sudo rpi-update
$ sudo reboot
```

SPI 활성

```
$ sudo raspi-config
```

Advance Option에서 SPI활성화

# FBTFT Device Kernel에서 부르기

/boot/config.txt를 열어서

```
$ sudo nano /boot/config.txt
```

끝에 추가

```
dtoverlay=rpi-display,speed=32000000,rotate=270
```

# 콘솔 활성

쉘에서

```
$ con2fbmap 1 1
```

혹은, 부팅할때

```
$ sudo nano /boot/cmdline.txt
```

맨끝줄에 추가

```
fbcon=map:10 fbcon=font:VGA8x8 
```

끌때는

```
$ con2fbmap 1 0
```

# X-Window-System

99-fbturbo.conf를 열어서 fb0를 fb1로 변경해준다.

```
$ sudo nano /usr/share/X11/xorg.conf.d/99-fbturbo.conf
```

# Video Test

샘플 영상 받기

```
$ wget http://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4
```

mplayer 설치후 재생

```
$ sudo apt-get install mplayer
$ sudo SDL_VIDEODRIVER=fbcon SDL_FBDEV=/dev/fb1 mplayer -vo sdl -framedrop BigBuckBunny_320x180.mp4
```

# 폰트변경

VGA8x8는 너무 크다. Terminus 6x12 폰트로 변경해보자.

```
$ sudo dpkg-reconfigure console-setup
```

인코딩과 캐릭터셋은 넘어가고 Font선택화면 나오면 Terminus를 선택한다.

참고: [https://github.com/watterott/RPi-Display/blob/master/docu/FBTFT-Install.md](https://github.com/watterott/RPi-Display/blob/master/docu/FBTFT-Install.md)
