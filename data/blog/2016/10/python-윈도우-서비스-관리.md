---
title: '[python] 윈도우 서비스 관리'
date: '2016-10-05'
categories:
  - 'code'
tags:
  - 'python'
  - 'window-service'
  - '윈도우서비스'
---

파이썬 연습.

win32serviceutil를 이용해서 윈도우 서비스를 관리.

우선 pywin32를 설치해야한다.

[https://sourceforge.net/projects/pywin32/](https://sourceforge.net/projects/pywin32/)

아래예제는 'NetHelper Client V7.0 Main Service' 라는 서비스를 시작/중지하는 소스이다.

python 소스

```python
try:
    import winxpgui as win32gui
except ImportError:
    import win32gui
import win32serviceutil

if __name__ == '__main__':
    service_name = 'NetHelper Client V7.0 Main Service'

    def message_box(hwnd, message, caption = 'message'):
        win32gui.MessageBox(hwnd, message, caption, win32con.MB_ICONEXCLAMATION | win32con.MB_OK)

    def stop_service(sysTrayIcon):
        try:
            win32serviceutil.StopService(service_name)
            print '{} stopped'.format(service_name)
        except:
            print 'could not stop service {}'.format(service_name)
        message_box(sysTrayIcon.hwnd, 'NelHelper 서비스가 중지되었습니다')

    def start_service(sysTrayIcon):
        try:
            win32serviceutil.StartService(service_name)
            print '{} start'.format(service_name)
        except:
            print 'could not start service {}'.format(service_name)
        message_box(sysTrayIcon.hwnd, 'NelHelper 서비스가 시작되었습니다')
```
