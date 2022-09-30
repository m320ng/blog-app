---
title: 'PKIX path building failed 오류'
date: '2022-05-02'
categories:
  - 'memo'
tags:
  - 'java-ssl'
  - 'pkix'
---

javax.net.ssl.SSLHandshakeException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException

[https://www.lesstif.com/java/java-pkix-path-building-failed-98926844.html](https://www.lesstif.com/java/java-pkix-path-building-failed-98926844.html)

인증서를 keystore에 저장하는 방법

관련 프로그램을 다운받고 실행한다

등록할 도메인 예시 lime.heyo.me

```bash
curl -O https://gist.githubusercontent.com/lesstif/cd26f57b7cfd2cd55241b20e05b5cd93/raw/InstallCert.java
javac InstallCert.java
java -cp ./ InstallCert lime.heyo.me
```

실행 결과

```bash
Added certificate to keystore 'jssecacerts' using alias 'lime.heyo.me-1'
```

실행결과의 alias 명을 이용해서 인증서를 생성한다

```bash
keytool -exportcert -keystore jssecacerts -storepass changeit -file output.cert -alias lime.heyo.me-1
```

output.cert 인증서 파일이 생성된다 인증서를 keystore에 저장

```bash
sudo  keytool -importcert -keystore ${JAVA_HOME}/lib/security/cacerts -storepass changeit -file output.cert -alias sectigo
```

윈도우는 관리자권한으로 cmd실행

```bash
keytool -importcert -keystore "%JAVA_HOME%/lib/security/cacerts" -storepass changeit -file output.cert -alias sectigo
```

설정에따라 실행되는 JRE가 %JAVA_HOME%가 아닐수도 있으니 실제 경로 확인..

```bash
C:\Program Files\AdoptOpenJDK\jdk-11.0.11.9-hotspot\lib\security\cacerts
C:\Program Files\RedHat\java-11-openjdk-11.0.10-1\lib\security\cacerts
```
