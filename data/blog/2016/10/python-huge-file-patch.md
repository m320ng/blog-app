---
title: "[python] huge file patch"
date: "2016-10-05"
categories: 
  - "code"
tags: 
  - "python"
  - "file-patch"
---

파이썬 연습용.

확실히 스크립트 중에서는 로우파일 다루기도 수월하고

PySide, pywin등 좋은 라이브러리도 많아서 c++/mfc 류의 프로그래밍하기 좋은듯하다.

아래 예제는 nethelper 라는 자산관리솔루션을 무력화 하기위해 만들어봤다.

단순히 문자열을 교체해서 sys파일을 서비스하지 못하게해 global api hooking을 하지 못하게된다.

python source

```
# -*- coding: utf-8 -*-
import sys
import time
import _winreg as reg

#sys.tracebacklimit = 0

BUFF_SIZE = 1024 * 8

def find_byte(filename, find_bit):
    """파일에서 find_bit 찾기"""
    addr = []
    with open(filename, 'rb') as f:
        total = 0
        read_byte = bytearray()
        read_len = 0;
        pad = 0
        while True:
            if read_len > 0:
                pad = len(find_bit)-1
                read_byte = read_byte[read_len-pad:]

            read_byte += f.read(BUFF_SIZE)
            read_len = len(read_byte)
            if read_len - pad == 0:
                break

            pos = 0
            while True:
                pos = read_byte.find(find_bit, pos)
                if pos == -1:
                    break;
                addr.append(total+pos-pad)
                print hex(total+pos-pad),
                print ' found'
                pos += len(find_bit)

            total += read_len - pad

    return addr

def write_byte(filename, addrs, change_bit):
    with open(filename, 'r+b') as f:
        pos = 0
        for addr in addrs:
            f.seek(addr)
            f.write(change_bit)


def replace_patch(filename, find_bit, change_bit):
    addrs = find_byte(filename, find_bit)
    write_byte(filename, addrs, change_bit)


def string_patch(filename, name, rename):
    print '>> patch ' + name
    name_byte = unicode(name).encode('utf-16le')
    rename_byte = unicode(rename).encode('utf-16le')
    replace_patch(filename, name_byte, rename_byte)

def registery_rename(key, subkey, name, rename):
    hklm = reg.ConnectRegistry(None, key)
    try:
        key = reg.OpenKey(hklm, subkey + '\\' + name)
        n,v,t = reg.EnumValue(key, 0)

        newkey = reg.CreateKey(hklm, subkey + '\\' + rename)
        reg.SetValueEx(newkey, None, 0, t, v)

        try:
            reg.DeleteKeyEx(hklm, subkey + '\\' + name)
        except:
            pass

        print 'registery_rename %s -> %s' % (name,rename)
    except:
        pass

def registery_add_startapp(name, value):
    hklm = reg.ConnectRegistry(None, reg.HKEY_CURRENT_USER)
    subkey = r'Software\Microsoft\Windows\CurrentVersion\Run'
    try:
        key = reg.OpenKey(hklm, subkey, 0, reg.KEY_ALL_ACCESS)
        reg.SetValueEx(key, name, 0, reg.REG_SZ, value)
        key.Close()

    except Exception as e:
        print e
        pass


def agent_file_patch(filename):
    string_patch(filename, 'NHCAHide', 'NHCAXide')
    string_patch(filename, 'NHCAHide.sys', 'NHCAXide.sys')
    string_patch(filename, 'NHFltDrv', 'NHFltTrv')
    string_patch(filename, 'NHFltDrv.sys', 'NHFltTrv.sys')
    string_patch(filename, 'NHHookDriver', 'NHHookTriver')
    string_patch(filename, 'NHHookDriver.sys', 'NHHookTriver.sys')
    string_patch(filename, 'NHCAHIDE', 'NHCAXIDE')
    string_patch(filename, 'NHSys32.sys', 'NHTys32.sys')
    string_patch(filename, 'NHSys64.sys', 'NHTys64.sys')
    string_patch(filename, 'PCASp40.sys', 'PCATp40.sys')
    string_patch(filename, 'PCASp50.sys', 'PCATp50.sys')

def agent_registery_patch():
    def reg_patch(name, rename):
        registery_rename(reg.HKEY_LOCAL_MACHINE, r'SYSTEM\CurrentControlSet\Control\SafeBoot\Minimal', name, rename)
        registery_rename(reg.HKEY_LOCAL_MACHINE, r'SYSTEM\CurrentControlSet\Control\SafeBoot\Network', name, rename)
    reg_patch('NHCAHide', 'NHCAXide')
    reg_patch('NHCAHide.sys', 'NHCAXide.sys')
    reg_patch('NHFltDrv', 'NHFltTrv')
    reg_patch('NHFltDrv.sys', 'NHFltTrv.sys')
    reg_patch('NHHookDriver', 'NHHookTriver')
    reg_patch('NHHookDriver.sys', 'NHHookTriver.sys')
    reg_patch('NHSys32.sys', 'NHTys32.sys')
    reg_patch('NHSys64.sys', 'NHTys64.sys')
    reg_patch('PCASp40.sys', 'PCATp40.sys')
    reg_patch('PCASp50.sys', 'PCATp50.sys')

if __name__ == '__main__':
    filename = 'NHCAAgent1.exe'

    agent_file_patch(filename)
    agent_registery_patch()
```
