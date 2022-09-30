---
title: 'cpu, memory 정보조회'
date: '2013-08-10'
categories:
  - 'memo'
tags:
  - 'cpp'
  - 'cpu정보'
---

## 구글메모중

```c
void GetMemoryStatus(long *lMemTotal, long *lAvailMemTotal, long *lVirtualTotal)
{
 MEMORYSTATUS memoryStatus;



 memset(&memoryStatus, 0, sizeof(MEMORYSTATUS));

 memoryStatus.dwLength = sizeof(memoryStatus);

 GlobalMemoryStatus(&memoryStatus);


 // 기본 단위는 바이트
 // 아래는 KB 단위로 환산...

 *lMemTotal = memoryStatus.dwTotalPhys / 1024;

 *lAvailMemTotal = memoryStatus.dwAvailPhys / 1024;

 *lVirtualTotal = memoryStatus.dwTotalVirtual / 1024;
}



void GetProcessorInfo(LPSTR lpCPUSpeed, LPSTR lpProcessorType,

                 LPSTR lpNumProcessors)
{
 SYSTEM_INFO sysInfo;
 LONG result;
 HKEY hKey;
 DWORD data;
 DWORD dataSize;


 //lpCPUSpeed[0] = 0;

 // ---------------------------------------------
 // 프로세서의 속도를 얻어낸다.
 // ---------------------------------------------

 result = RegOpenKeyEx(HKEY_LOCAL_MACHINE, "Hardware\Description\System\CentralProcessor\0", 0,

 KEY_QUERY_VALUE, &hKey);



 if (result == ERROR_SUCCESS)
 {
  result = RegQueryValueEx(hKey, "~MHz", NULL, NULL,(LPBYTE)&data, &dataSize);
  wsprintf(lpCPUSpeed, "%d MHz", data);
 }


 RegCloseKey(hKey);

 // ------------------------------------------
 // 하드웨어 정보를 얻어낸다.
 // ------------------------------------------
 GetSystemInfo(&sysInfo);

 // 프로세서 타입부터 검사한다.
 if (sysInfo.dwProcessorType == PROCESSOR_INTEL_386)
 {
  strcpy(lpProcessorType,  "Intel 386");
 }
 else if (sysInfo.dwProcessorType == PROCESSOR_INTEL_486)
 {
  strcpy(lpProcessorType,  "Intel 486");
 }
 else if (sysInfo.dwProcessorType == PROCESSOR_INTEL_PENTIUM)
 {
  if (sysInfo.wProcessorLevel == 6)
  {
   strcpy(lpProcessorType, "Intel Pentium (II/Pro)");
  }
  else
  {
   strcpy(lpProcessorType,  "Intel Pentium");
  }
 }
 else
 {
  strcpy(lpProcessorType, "알 수 없는 시스템");
 }


 wsprintf(lpNumProcessors, "%d", sysInfo.dwNumberOfProcessors);
}

void GetOSVersion (LPSTR lpstInfo, LPSTR lpstBuildNumber, LPSTR lpstServicePack)//이번에 추가하려는 부분입니다.
 {
  int stat = 0;
  TCHAR data [64];
  DWORD dataSize;
  DWORD win95Info;
  OSVERSIONINFO versionInfo;
  HKEY hKey;
  LONG result;

  lpstServicePack[0] = 0;
  versionInfo.dwOSVersionInfoSize = sizeof (OSVERSIONINFO);

  // 버전 정보를 얻어낸다.
  if (!::GetVersionEx (&versionInfo))
  {
   strcpy(lpstInfo, "운영체제 정보를 얻을 수 없습니다.");
   return;
  }

  // NT이면 서버인지 웍스테이션인지 검사한다. 이는 레지스트리를 보고 검사한다.
  if (versionInfo.dwPlatformId == VER_PLATFORM_WIN32_NT)
  {
   strcpy(lpstInfo, "Windows NT");
   dataSize = sizeof (data);
   result = ::RegOpenKeyEx (HKEY_LOCAL_MACHINE,
    "System\CurrentControlSet\Control\ProductOptions", 0, KEY_QUERY_VALUE, &hKey);
   if (result != ERROR_SUCCESS)
    return;

   result = ::RegQueryValueEx (hKey, "ProductType", NULL, NULL, (LPBYTE) data, &dataSize);
   RegCloseKey (hKey);

   if (result != ERROR_SUCCESS)
    return;

   if (lstrcmpi (data, "WinNT") == 0)
    strcpy(lpstInfo, "Windows NT Workstation");
   else if (lstrcmpi (data, "ServerNT") == 0)
    strcpy(lpstInfo, "Windows NT Server");
   else
    strcpy(lpstInfo, "Windows NT Server - Domain Controller");

   // NT 버전을 알아낸다.
   if (versionInfo.dwMajorVersion == 3 || versionInfo.dwMinorVersion == 51)
    strcat(lpstInfo, " 3.51");
   else if (versionInfo.dwMajorVersion == 5) // 윈도우 2000의 경우
    strcat(lpstInfo, " 5.0");
   else
    strcat(lpstInfo, " 4.0");

   // Build 번호를 알아낸다.
   wsprintf(lpstBuildNumber, "%d", versionInfo.dwBuildNumber);
  }
  else if (versionInfo.dwPlatformId == VER_PLATFORM_WIN32_WINDOWS)
  {
   strcpy(lpstInfo, "Windows 95");
   if ((versionInfo.dwMajorVersion > 4) || ((versionInfo.dwMajorVersion == 4)
    && (versionInfo.dwMinorVersion > 0)))
   {
    strcpy(lpstInfo, "Windows 98");
   }
   // 윈도우 95는 Build 번호가 하위 워드에 들어간다.
   win95Info = (DWORD)(LOBYTE(LOWORD(versionInfo.dwBuildNumber)));
   wsprintf(lpstBuildNumber, "%d", win95Info);
  }
  else
   wsprintf(lpstInfo, "Windows 3.1");

  // 서비스 팩 정보를 얻어낸다.
  strcpy(lpstServicePack, versionInfo.szCSDVersion);
 }
```
