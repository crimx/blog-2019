---
title: 在博客上使用 Emoji
tags:
  - Image
  - Emoji
  - Hexo
  - Recommended
quote:
  content: >-
    I propose that the following character sequence for joke
    markers:<p>:-)</p>Read it sideways.
  author: Scott E. Fahlman
  source: ''
date: 2016-12-23T12:00:00.000Z
layout: blog-post
description: ''
---


Emoji 都要出电影了，博客怎么能不用。奇怪的是 hexo 上只有一个插件，要在文中添加 tag，还不支持 hexo3 。我不太喜欢在 markdown 里加各种 tag，所以就打算自己再写个插件。

Github 对 emoji 的支持就很好，所以去观摩了一下。它在生成网页的时候将关键字替换成 emoji 的 unicode 字符，然后再利用 JavaScript 将字符替换成图片，这样即使图片加载失败还有字符 fallback。

于是就参考这种方式写了 [hexo-filter-github-emojis](https://github.com/crimx/hexo-filter-github-emojis) :tada:。

用法与 Github 一样，效果还不错吧 :smile:。

> :speedboat:  
> &nbsp; :tropical_fish:
>
> <br><br><br><br><br>
>
> &emsp;&emsp;&emsp;&emsp; :octopus::dolphin::fish:  
> &emsp;&emsp;&emsp;&emsp; <i>"He touched the butt!"</i>

