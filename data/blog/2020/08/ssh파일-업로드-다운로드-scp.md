---
title: "SSH파일 업로드 다운로드 (scp)"
date: "2020-08-13"
categories: 
  - "tip"
tags: 
  - "scp"
  - "ssh-copy"
---

# scp

scp 원본파일 대상

## 올리기 예제

scp -P 10022 public\_html.tar.gz readonlyuser@114.108.128.127:~/public\_html.tar.gz

## 다운받기 예제

scp -P 10022 readonlyuser@114.108.128.127:~/public\_html.tar.gz public\_html.tar.gz

## 키파일 사용 (-i)

scp -i ~/aws.pem ./app2.tar.gz ubuntu@note.heyo.me:~/app2.tar.gz

## 폴더 (-r)

scp -r -i ~/aws3.pem ./dump ubuntu@test.heyo.me:~/dump
