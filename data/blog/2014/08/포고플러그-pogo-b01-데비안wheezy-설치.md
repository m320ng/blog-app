---
title: "포고플러그 (POGO-B01) 데비안(wheezy) 설치"
date: "2014-08-19"
categories: 
  - "memo"
---

## 0\. arch-linux를 설치후 arch-linux 에서 debian을 설치한다. arch-linux가 설치될 usb메모리, debian이 설치될 usb메모리 이렇게 두개가 필요하다.

## 1\. 우선 Arch-Linux부터 설치. 이 작업을 하면 이후 arch-linux로 부팅된다.

[http://archlinuxarm.org/platforms/armv6/pogoplug-v3oxnas-eol](http://archlinuxarm.org/platforms/armv6/pogoplug-v3oxnas-eol) 참고

> 1) my.pogoplug.com 에 포고플러그를 등록하고 SSH를 활성화시킨다.  
> 2) usb메모리를 꽂는다. (난 뒤쪽 두번째 슬롯에 꽂았고 /dev/sda로 잡혔다.)  
> 3) 6번부터 명령어를 쭉 따라가면됨

## 2\. debian 설치. 아래 링크에서 pogoplug에 맞게 구성된 debian wheezy를 다운받는다.

[http://pogoplug.cwsurf.de/forum/viewtopic.php?f=5&t=114&sid=c7624ebf7b6a84be9875ccd1bda50d75](http://pogoplug.cwsurf.de/forum/viewtopic.php?f=5&t=114&sid=c7624ebf7b6a84be9875ccd1bda50d75) -> debian-wheezy-pogoplugv3pro-shv.1.clean.tar.gz

> 다운받은 파일을 포고플러그 home(~) path에 넣는다. 1) debian을 설치할 usb를 꽂는다.  
> 2) usb ext3로 포맷

난 **sdb1**로 잡혀서 **sdb1**이지만 다를수 있다. fdisk -l로 확인해보길..

```
umount /dev/sdb1      (혹시 붙어있으면 언마운트후..)
mkfs.ext3 /dev/sdb1   (포맷)

mount /dev/sdb1 /mnt  (포맷후 마운트)

cd /mnt
tar xvzf ~/debian-wheezy-pogoplugv3pro-shv.1.clean.tar.gz

vi etc/network/interfaces (맥어드레스 수정 00:xx:xx:xx:xx:xx -> 포고플러그 밑바닥에 있는 맥어드레스로)
```

## 3\. 종료후 arch-linux가 설치된 usb를 제거하고 그 위치에 debian이 설치된 usb로 바꿔껸다.
