---
title: Sublime Text Title Case 快捷键
tags:
  - Sublime Text
quote:
  content: ''
  author: ''
  source: ''
date: 2016-05-27T12:00:00.000Z
layout: blog-post
description: ''
---

Preferences -> Key Bindings 添加：

```json
[
  { "keys": ["ctrl+k", "ctrl+t"], "command": "title_case" }
  // .....
]
```

然后就可以用 <kbd>Ctrl</kbd>+<kbd>k</kbd> 再按下 <kbd>Ctrl</kbd>+<kbd>t</kbd> 使用 Title Case。

Package Control 上有个很老的 Package，Smart Title Case。能识别更复杂的情况，但是有 bug，核心代码已经修复 <https://github.com/ppannuto/python-titlecase>，但 Package 的作者早已不再维护，下载量也不大。

