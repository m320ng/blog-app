---
title: "Tomcat7 윈도우서비스 수정/제거"
date: "2017-03-21"
categories: 
  - "memo"
---

```
Update the service named 'Tomcat7'
C:\> tomcat7 //US//Tomcat7 --Description="Apache Tomcat Server - http://tomcat.apache.org/ " ^
     --Startup=auto --Classpath=%JAVA_HOME%\lib\tools.jar;%CATALINA_HOME%\bin\bootstrap.jar
```

```
Update the service named 'MyService'
C:\> tomcat7 //US//MyService --Description="Apache Tomcat Server - http://tomcat.apache.org/ " ^
     --Startup=auto --Classpath=%JAVA_HOME%\lib\tools.jar;%CATALINA_HOME%\bin\bootstrap.jar
```

```
Remove the service named 'Tomcat7'
C:\> tomcat7 //DS//Tomcat7
```

참고: [http://tomcat.apache.org/tomcat-7.0-doc/windows-service-howto.html#Installing\_services](http://tomcat.apache.org/tomcat-7.0-doc/windows-service-howto.html#Installing_services)
