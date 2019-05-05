---
layout: blog-post
draft: false
date: 2019-04-26T10:04:05.691Z
title: 搭建 Gatsby 博客三：使用 Netlify CMS 管理文章
description: 一个博客如果不能方便地编写文章将非常打击作文欲望。本文将谈谈如何在 Gatsby 中配置 Netlify CMS 管理文章。
quote:
  author: A. B. Yehoshua
  content: >-
    The most difficult and complicated part of the writing process is the
    beginning.
  source: ''
tags:
  - Gatsby
  - Blog
  - Netlify
---
## 为什么选择 Netlify CMS

搭建 Gatsby 博客其实不需要 CMS 都是可以的，编写 Markdown 然后 build 即可。但这么做还是略嫌不便，通过 CMS 一般可以在一个可视化的在线环境中编辑文章，然后一键即可发布。

Gatsby 主流的两个 CMS 是 Contentful 和 Netlify CMS。

对于 Contentful 来说，文章是放在 Contentful 的服务器上的，管理也是通过 Contentful 提供的工具。当然其质量还是不错的，喜欢的可以参照官方的[教程](https://www.contentful.com/r/knowledgebase/gatsbyjs-and-contentful-in-five-minutes/)搭建。

Netlify CMS 是跟项目一起发布的，默认是在 `/admin` 页面下。文章也是存在源项目中，就是原来默认的 Markdown 文件。Netlify CMS 借助 Oauth 把写好的 Markdown 文件推送到项目源码的仓库上，再配合 Netlify 检测仓库变动自动构建发布。当然后者也不是必须的，可以换其它方式自动构建。

Netlify CMS 的优点是开源免费，文章跟项目源码在一起，界面可以高度自定义，甚至可以自行扩充 React 组件，基本满足简单的博客编写需求。

## 配置 Netlify CMS

如果用官方的 [starter](https://github.com/netlify-templates/gatsby-starter-netlify-cms) 配置将会非常简单。此 starter 默认使用 Github 作为仓库，Netlify 作为自动构建服务器。

### 配置 Widgets

默认的 `/static/admin/config.yml` 已经配置好了大部分，如果对文章 Markdown 添加了自定义的 front matters 则需要再做些细调。

Widgets 代表了在 CMS 中可输入的模块，[官方](https://www.netlifycms.org/docs/widgets/)为常见的类型都提供了默认的 widgets ，没有满足的也可以[自定义](https://www.netlifycms.org/docs/custom-widgets/)。

如我的[博客](https://blog.crimx.com)中每篇文章都有一个 `quote` 域放些引用文字，那么在[配置](https://github.com/crimx/blog-2019/blob/3af6a9706e2c1e7f7c1a3c1dac0ad981d5603693/static/admin/config.yml#L14-L28)中添加上

```yml
fields:
  - label: "Quote"
    name: "quote"
    widget: "object"
    fields:
      - {label: "Content", name: "content", widget: "text", default: "", required: false}
      - {label: "Author", name: "author", widget: "string", default: "", required: false}
      - {label: "Source", name: "source", widget: "string", default: "", required: false}
```

如此即可在 CMS 中填写相关信息。

### 配置预览

CMS 中提供了文章预览界面，如果需要自定义只需修改 `/src/cms/` 下相应的文件即可，就是简单的 React 组件。

以上便是 Netlify CMS 最常用的配置，只需简单的修改博客现在就能跑起来了。接下来的文章我们会通过实现草稿模式和上下篇文章来深入理解 Gatsby 的机制。
