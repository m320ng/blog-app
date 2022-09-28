---
title: "라즈베리파이 USB무선랜(mt7601u) 드라이버 설치"
date: "2016-02-05"
categories: 
  - "etc"
tags: 
  - "라즈베리파이"
  - "raspberry-pi"
  - "mt7601u"
---

aliexpress 에서 구입한 5불짜리 저렴한 USB무선랜.

mt7601u 칩을 쓴다는거 같은데 라즈베리파이에선 기본적으로 잡히지 않는다.

참고로 비슷한 무선랜중에 rt5370는 그냥 잡힌다고 한다.. 저걸 살껄..

어쨋든 컴파일해서 드라이버를 올린 내용 정리.

```
pi@raspberrypi:~$ lsusb
Bus 001 Device 005: ID 148f:7601 Ralink Technology, Corp. 
```

gcc make 설치

```
pi@raspberrypi:~ $ sudo apt-get update
pi@raspberrypi:~ $ sudo apt-get upgrade
pi@raspberrypi:~ $ sudo apt-get install gcc make
```

mt7601u 드라이버 소스 다운로드. 해당 링크가 끊겼어도 검색하면 많이 나온다

```
pi@raspberrypi:~ $ mkdir src
pi@raspberrypi:~ $ cd src
pi@raspberrypi:~/src $ wget  https://googledrive.com/host/0B_JlgOR4VNe0Sjg4ei0ySEY4aUE/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS.tar.bz2
pi@raspberrypi:~/src $ tar -xvjpf DPA_MT7601*
```

커널소스 다운로드. 내 기준은 4.1.17-v7+ 였지만 다를수 있다.

```
pi@raspberrypi:~/src $ uname -a
Linux raspberrypi 4.1.17-v7+ #834 SMP Mon Feb 1 15:17:54 GMT 2016 armv7l GNU/Linux

pi@raspberrypi:~/src $ mkdir kernel
pi@raspberrypi:~/src $ cd kernel
pi@raspberrypi:~/src/kernel $ wget https://github.com/raspberrypi/linux/archive/rpi-4.1.y.tar.gz
pi@raspberrypi:~/src/kernel $ tar xvfz rpi-4.1.y.tar.gz
```

드라이버 빌드를 할수 있도록 다운받은 소스랑 build 연결

```
pi@raspberrypi:~/src/kernel $ sudo ln -s ~/src/kernel/linux-rpi-4.1.y /lib/modules/4.1.17-v7+/build
(/lib/modules/4.1.17-v7+/build가 이미 연결되어있다면 삭제한다.)
pi@raspberrypi:~/src/kernel $ cd linux-rpi-4.1.y
pi@raspberrypi:~/src/kernel/linux-rpi-4.1.y $ make mrproper
pi@raspberrypi:~/src/kernel/linux-rpi-4.1.y $ gzip -dc /proc/config.gz > .config
(/proc/config.gz가 missing이라고 나오면 sudo modprobe configs 실행후 다시)
pi@raspberrypi:~/src/kernel/linux-rpi-4.1.y $ make oldconfig
pi@raspberrypi:~/src/kernel/linux-rpi-4.1.y $ make prepare
pi@raspberrypi:~/src/kernel/linux-rpi-4.1.y $ make modules_prepare
pi@raspberrypi:~/src/kernel/linux-rpi-4.1.y $ wget https://github.com/raspberrypi/firmware/raw/master/extra/Module.symvers
```

드라이버 소스 빌드

```
pi@raspberrypi:~ $ cd src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS/
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ make all
```

이어지는 오류 수정. 아마도 kernel gcc 버젼이 달라지면서 발생하는 문제 같다. 나같은 경우 rt\_profile.c 에서 implicit-int error가 떳다.

MODULE/os/linux/rt\_profile.c 수정 line 131

```
const *pWirelessIWscEventText[IW_IWSC_EVENT_TYPE_NUM]
[변경]
const char *pWirelessIWscEventText[IW_IWSC_EVENT_TYPE_NUM]
```

혹은 config.mk 수정

MODULE/os/linux/config.mk line 218

```
WFLAGS := -DAGGREGATION_SUPPORT -DPIGGYBACK_SUPPORT -DWMM_SUPPORT  -DLINUX -Wall -Wno-trigraphs
[변경(-Wno-implicit-int 추가)]
WFLAGS := -DAGGREGATION_SUPPORT -DPIGGYBACK_SUPPORT -DWMM_SUPPORT  -DLINUX -Wall -Wno-trigraphs -Wno-implicit-int
```

rt\_linux.c에서 incompatible types when assigning to type ‘int’ from type ‘kuid\_t’ 에러도 떳다.

UTIL/os/linux/rt\_linux.c 수정 line 1188

```
pOSFSInfo->fsuid = current_fsuid();
pOSFSInfo->fsgid = current_fsgid();
[변경]
pOSFSInfo->fsuid = current_fsuid().val;
pOSFSInfo->fsgid = current_fsgid().val;
```

sta\_cfg.c에서 macro "**DATE**" might prevent reproducible builds 에러도 떳다.

config.mk 수정

MODULE/os/linux/config.mk line 218

```
WFLAGS := -DAGGREGATION_SUPPORT -DPIGGYBACK_SUPPORT -DWMM_SUPPORT  -DLINUX -Wall -Wno-trigraphs -Wno-implicit-int
[변경(-Wno-error=date-time 추가)]
WFLAGS := -DAGGREGATION_SUPPORT -DPIGGYBACK_SUPPORT -DWMM_SUPPORT  -DLINUX -Wall -Wno-trigraphs -Wno-implicit-int -Wno-error=date-time
```

warning은 엄청 많이 뜨지만 별상관없는거 같다. 난 저정도 수정해주니 에러는 없었음

이제 드라이버 인스톨

```
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo mkdir -p /etc/Wireless/RT2870STA
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo cp RT2870STA.dat /etc/Wireless/RT2870STA
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo cp MODULE/os/linux/mt7601Usta.ko /lib/modules/4.1.17-v7+/kernel/drivers/net/wireless/
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo cp UTIL/os/linux/mtutil7601Usta.ko /lib/modules/4.1.17-v7+/kernel/drivers/net/wireless/
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo cp NETIF/os/linux/mtnet7601Usta.ko /lib/modules/4.1.17-v7+/kernel/drivers/net/wireless/
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ depmod -a
```

재부팅후

```
pi@raspberrypi:~ $ ifconfig -a
```

wlan0이 떳다면 설치완료. 확인안된다면 부팅메세지 확인

```
pi@raspberrypi:~ $ dmesg|grep 7601
[ 10.765833] mtutil7601Usta: disagrees about version of symbol module_layout
```

나같은 경우 위와 같은 메세지가 확인되었다. 라즈베리파이 펌웨어 업데이트후에 드라이버 다시 복사

```
pi@raspberrypi:~ $ sudo rpi-update
pi@raspberrypi:~ $ cd DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo cp MODULE/os/linux/mt7601Usta.ko /lib/modules/4.1.17-v7+/kernel/drivers/net/wireless/
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo cp UTIL/os/linux/mtutil7601Usta.ko /lib/modules/4.1.17-v7+/kernel/drivers/net/wireless/
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ sudo cp NETIF/os/linux/mtnet7601Usta.ko /lib/modules/4.1.17-v7+/kernel/drivers/net/wireless/
pi@raspberrypi:~/src/DPA_MT7601U_LinuxSTA_3.0.0.3_20130717_LS $ depmod -a
```

이후 난 재부팅하니깐 되었다.

참고: [https://www.raspberrypi.org/forums/viewtopic.php?t=49864](https://www.raspberrypi.org/forums/viewtopic.php?t=49864)
