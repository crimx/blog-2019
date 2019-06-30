---
layout: blog-post
draft: false
date: 2019-06-30T16:28:59.688Z
title: Arch Linux 使用 iptables 管理网络
description: 出门在外，有时需要流量上网，本文聊聊如何使用 iptables 只允许特定的程序连接网络。
quote:
  author: ' Darren Shan '
  content: '"Wi-Fi is a blessing from the gods." '
  source: 'Wolf Island (The Demonata, #8)'
tags:
  - Linux
---
## GUI?

面对这个需求其实第一反应是找找有没有带 GUI 的管理工具。很可惜，在 Linux 下进行应用层的网络管理似乎不容易，目前只找到一个工具 [Douane](https://douaneapp.com/)，但是看 issue 貌似不是很稳定，且一个软件拆成几个仓库，编译过程十分繁琐。

## iptables

后来了解到 iptables 这个内置的包过滤工具，发现配置起来简单多了。

其解决方案是新建一个用户组，让 iptables 默认拦截扔掉所有包，但除了这个用户组中的程序。

1. 新建用户组 `internet`
   ```bash
   sudo addgroup internet
   ```
2. 保存以下脚本并运行
   ```bash
   #!/bin/sh

   # 清理所有规则
   sudo iptables -F

   # 只允许 internet 组
   sudo iptables -A OUTPUT -p all -m owner --gid-owner internet -j ACCEPT

   # 允许本地连接
   sudo iptables -A OUTPUT -p tcp -d 127.0.0.1 -j ACCEPT
   sudo iptables -A OUTPUT -p tcp -d 192.168.0.1/24 -j ACCEPT

   # 拒绝所有包
   sudo iptables -A OUTPUT -j REJECT

   # 以 internet 为主要用户组打开新的 shell
   sudo -g internet -s
   ```
   现在只有在新 shell 中打开的程序才可以访问网络。
3. 如果最后的切换提示没有权限，执行 `sudo visudo` 最后添加 `crimx ALL=(ALL:internet) ALL`，代表用户 `crimx` 允许在 `internet` 组执行任意命令。`crimx` 换成你的用户名即可。
4. 要恢复正常网络访问，只需重启或者恢复默认
   ```bash
   sudo iptables-restore /etc/iptables/empty.rules 
   ```
