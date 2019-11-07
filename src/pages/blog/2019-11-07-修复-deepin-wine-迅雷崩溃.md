---
layout: blog-post
draft: false
date: 2019-11-07T11:29:03.068Z
title: 修复 Deepin Wine 迅雷崩溃
description: 最近一次 Manjaro 滚动更新后终于第一次踩到坑，Deepin Wine 迅雷突然崩溃了。先给维护者反个馈，几天没有回应后决定自己看看。
quote:
  author: ''
  content: ''
  source: ''
tags:
  - Linux
---
从 `/usr/share/applications/deepin.com.thunderspeed.desktop` 中找到运行方式 `"/opt/deepinwine/apps/Deepin-ThunderSpeed/run.sh" -u %u`。

运行发现错误为 wine 不知为什么没能找到加载迅雷目录下的 dlls 。

```bash
0028:fixme:msvcp:_Locinfo__Locinfo_ctor_cat_cstr (008AED28 1 C) semi-stub
0028:fixme:msvcp:_Locinfo__Locinfo_ctor_cat_cstr (008AED78 1 C) semi-stub
0028:fixme:msvcp:_Locinfo__Locinfo_ctor_cat_cstr (008AEA2C 1 C) semi-stub
0028:fixme:msvcp:_Locinfo__Locinfo_ctor_cat_cstr (008AED28 1 C) semi-stub
0028:fixme:heap:RtlSetHeapInformation 0x8c0000 0 0x8ae5c0 4 stub
0030:fixme:winsock:WSCGetProviderPath ({e70f1aa0-ab8b-11cf-8ca3-00805f48a192} 0x102f0ac 0x102f0a8 0x102f0a4) Stub!
0009:err:module:import_dll Library XLFSIO.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library XLLuaRuntime.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library XLGraphic.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library XLUE.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library DownloadKernel.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library libexpat.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library XLUserS.DLL (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library BaseCommunity.DLL (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library XLGraphicPlus.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library zlib1.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library xlstat.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:import_dll Library mini_unzip_dll.dll (which is needed by L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe") not found
0009:err:module:LdrInitializeThunk Importing dlls for L"c:\\Program Files\\Thunder Network\\Thunder\\Program\\Thunder.exe" failed, status c0000135
0041:fixme:winhttp:request_set_option 0 (null) (null)
```

尝试将目录添加到环境变量

```bash
env WINEPREFIX="$HOME/.deepinwine/Deepin-ThunderSpeed" wine .deepinwine/Deepin-ThunderSpeed/drive_c/windows/regedit.exe 
```

打开注册表，定位到 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`，编辑 `PATH` 加入 `C:\Program Files\Thunder Network\Thunder\Program`，注意以分号 `;` 相隔。

重新启动迅雷，问题解决。
