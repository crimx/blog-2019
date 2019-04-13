---
title: 解决 Ubuntu 笔记本发热问题
tags:
  - Ubuntu
  - 发热
  - 笔记本
  - 双显卡
  - 散热
quote:
  content: '"Eventually, everything connects."'
  author: ''
  source: ''
date: 2014-05-01T12:00:00.000Z
layout: blog-post
description: ''
---

笔记本发热绝大多数情况是因为CPU和双显卡。

## 先排除双显卡问题

ubuntu自带双显卡控制，该功能还在debug状态，但是在13.10上已经比较稳定了。

13.10之前的需要先加载进来

```bash
mount -t debugfs debugfs /sys/kernel/debug
```

查看显卡情况

```bash
sudo cat /sys/kernel/debug/vgaswitcheroo/switch
```

可以看到

```bash
0:IGD:+:Pwr:0000:00:02.0
1:DIS: :Off:0000:01:00.0
```

IGD就是集成显卡,DIS是独立显卡。  
Pwr为通电的显卡，off为关掉的显卡。  
加号为正在使用的显卡。

以下操作需要在 `root` 权限下进行。但是如果不需要切换显卡，只是切断电源，可以直接进行最后一步然后重启。

切换到独立显卡

```bash
echo DDIS > /sys/kernel/debug/vgaswitcheroo/switch
```

切换到集成显卡

```bash
echo DIGD > /sys/kernel/debug/vgaswitcheroo/switch
```

关闭不使用的显卡

```bash
echo OFF > /sys/kernel/debug/vgaswitcheroo/switch
```

搞定之后，在 `rc.local` 上添加最后一个，开机自动关闭不用的显卡



## CPU情况

有的博客推荐`jupiter`，我的源里没有，懒得找所以用了 `cpufreqd`，效果也是扛扛的。

```bash
sudo apt-get install cpufreqd
```

它支持情景模式，配置 `/etc/cpufreqd.conf`。里面已经有样例了，可以仿照它自己定义。

下面的是我的设置，懒得自己改的可以复制粘贴。

```bash
# this is a comment
# see CPUFREQD.CONF(5) manpage for a complete reference
#
# Note: ondemand/conservative Profiles are disabled because
#       they are not available on many platforms.

[General]
pidfile=/var/run/cpufreqd.pid
poll_interval=2
verbosity=4
#enable_remote=1
#remote_group=root
[/General]

#[acpi]
#acpid_socket=/var/run/acpid.socket
#[/acpi]

#[nforce2_atxp1]
#vcore_path=/some/path
#vcore_default=1500
#[/nforce2_atxp1]

#[sensors_plugin]
#sensors_conf=/some/file
#[/sensors_plugin]

#[Profile]
#name=On Demand High
#minfreq=40%
#maxfreq=100%
#policy=ondemand
#[/Profile]
#
#[Profile]
#name=On Demand Low
#minfreq=20%
#maxfreq=80%
#policy=ondemand
#[/Profile]

[Profile]
name=Performance High
minfreq=100%
maxfreq=100%
policy=performance
#exec_post=echo 8 > /proc/acpi/sony/brightness
[/Profile]

[Profile]
name=Performance Low
minfreq=80%
maxfreq=80%
policy=performance
[/Profile]

[Profile]
name=Powersave High
minfreq=60%
maxfreq=60%
policy=powersave
[/Profile]

[Profile]
name=Powersave Low
minfreq=40%
maxfreq=40%
policy=powersave
[/Profile]

#[Profile]
#name=Conservative High
#minfreq=33%
#maxfreq=100%
#policy=conservative
#[/Profile]
#
#[Profile]
#name=Conservative Low
#minfreq=0%
#maxfreq=66%
#policy=conservative
#[/Profile]

##
# Basic states
##
# when AC use Conservative mode
[Rule]
name=AC Rule
ac=on                    # (on/off)
profile=Conservative High
[/Rule]
 
# stay in Conservative mode for the first minutes
[Rule]
name=AC Off - High Power
ac=off                   # (on/off)
battery_interval=70-100
#exec_post=echo 5 > /proc/acpi/sony/brightness
profile=Conservative Low
[/Rule]

# conservative mode when not AC
[Rule]
name=AC Off - Medium Battery
ac=off                   # (on/off)
battery_interval=30-70
#exec_post=echo 3 > /proc/acpi/sony/brightness
profile=Powersave High
[/Rule]

# conservative mode when not AC
[Rule]
name=AC Off - Low Battery
ac=off                   # (on/off)
battery_interval=0-30
#exec_post=echo 3 > /proc/acpi/sony/brightness
profile=Powersave Low
[/Rule]

##
# Special Rules
##
# CPU Too hot!
[Rule]
name=CPU Too Hot
acpi_temperature=55-100
cpu_interval=50-100
profile=Conservative Low
[/Rule]

# use performance mode if I'm watching a movie
# I don't care for batteries! 
# But don't heat too much.
[Rule]
name=Movie Watcher
programs=xine,mplayer,gmplayer
battery_interval=0-100
acpi_temperature=0-60
cpu_interval=0-100
profile=Performance High
[/Rule]
```

