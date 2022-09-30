---
title: 'react-native 3rd-party android module conflicting libc++_shared.so'
date: '2021-08-20'
categories:
  - 'memo'
tags:
  - 'libc_shared-so'
---

1. More than one file was found with OS independent path 'lib/arm64-v8a/libc++\_shared.so'

```gradle
android {
    ...

    packagingOptions {
        pickFirst 'lib/**/libc++_shared.so'
    }
}
```

1. 버전 충돌

react-native-0.63.x.aar 안의 libc++\_shared.so 를 복사해서 3rd-party 모듈안에 넣어서 버전을 맞춰준다.

ex) zoom sdk 의 경우 mobilertc.aar 압축을 풀어서 (zip으로 인식) 복사해서 덮어씌운후 다시 mobilertc.aar 으로 압축한다.

jni/arm64-v8a/libc++\_shared.so jni/armeabi-v7a/libc++\_shared.so ...

1. E/libc++abi: terminating with uncaught exception of type std::bad_cast: std::bad_cast

```java
// MainApplication.java
public void onCreate() {
    System.loadLibrary( "c++_shared");
    ...
}
```
