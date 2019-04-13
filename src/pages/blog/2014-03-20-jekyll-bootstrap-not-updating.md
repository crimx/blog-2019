---
title: Jekyll-bootstrap Not Updating Problem Fixed
tags:
  - Jekyll
quote:
  content: If opportunity doesn't knock... build a door.
  author: Milton Berle
  source: ''
date: 2014-03-20T12:00:00.000Z
layout: blog-post
description: ''
---

I had a jekyll blog on the github and changed it to Jekyll-bootstrap yesterday.   
I tested it locally, everything was ok. Pushed successfully. But my github pages didn't change.

After debugging, I realised that the problem occured right after the theme `hooligan` was installed.

To fix this problem, you only need to:

* Remove the `_theme_packages` file:

```bash
git rm _theme_packages
```

* Create a `.gitignore` file in the root of your Page repository. 
* Put `_theme_packages/*` into the file.
* Better install the theme again.

This solution worked for me.



我昨天把jekyll换成了jekyll-bootstrap，在本地测试成功，push也成功了。但是github pages一直没有改变。  
重复安装了很多次，终于发现当我安装完`hooligan`主题后，github pages就没反映了。最后发现是主题下载包`_theme_packages`跟github有冲突。

所以，先remove掉

```bash
git rm _theme_packages
```

在根目录添加`.gitignore`文件，写入

```bash
_theme_packages/*
```

最好把主题重新安装一次

如果上面的办法没用的话，我建议删掉仓库重新来一遍，我就是这样成功的，注意发布之后有可能要等一会才有效哦。

