---
layout: blog-post
date: 2019-04-18T12:50:53.112Z
title: 搭建 Gatsby 博客一：为什么选 Gatsby
description: >-
  Gatsby 是一个 React 建站框架。在使用 Gatsby 搭建了一个小博客后，非常喜欢其管理数据的方式。然而，尽管上手可以非常快，对于刚开始用
  Gatsby 的人来说，理解其基本思想是个小门槛。官方提供了非常详细的教程，甚至有点过于基础了，本文面向有 React 基础，没有使用过 Gatsby 和
  GraphQL 的读者分享一份笔记。
quote:
  author: F. Scott Fitzgerald
  content: '“It takes two to make an accident.” '
  source: The Great Gatsby
tags:
  - Gatsby
  - Blog
---
## 为什么选 Gatsby

我的博客最初是用 Github Pages 默认的 [Jekyll](https://jekyllrb.com) 框架，其使用的 [Liquid](https://shopify.github.io/liquid/) 模板引擎在使用上有诸多不便。

后来基于 Node.js 的 [Hexo](https://hexo.io) 横空出世，我便重构了[博客](https://blog2018.crimx.com)对其深入整合，还为其写了一个 [emoji 插件](https://github.com/crimx/hexo-filter-github-emojis)。在编写过程中发现其 API 设计比较不成熟，调试体验也不是很好，阅读其它插件代码时发现很多都需要用到未公开接口。同时资源管理需要借助其它 Task runner，如当时比较流行的 Grunt 和 Gulp 。这样下来直接依赖了大量包，冲突不可避免的产生。

在一次换系统之后，项目终于构建不了了，包冲突处理起来非常头疼，也影响到了写博文的兴致。

拖延了一段时间后，终于开始考虑更换框架。这时 React Angular Vue 生态已比较成熟，所以就没必要考虑其它的模板引擎。

首先注意到的是新星 [VuePress](https://vuepress.vuejs.org/) 。然而考察过后发现其正在 v1 到 v2 的更替期，v1 功能比较简陋，v2 还在 alpha 期不稳定。且 VuePress 目前还是针对静态文档优化比较多，作为博客依然比较简陋。

这时 [@unicar](https://twitter.com/unicar9) 正好推荐了基于 React 的 [Gatsby](https://www.gatsbyjs.org/)。发现其生态很强大，再搭配 React 庞大的生态，确实非常吸引人。

而且在了解过程中还发现了 [Netlify CMS](https://netlifycms.org) 这个内容管理平台，如此一来，文章数据完全可以存在 Github 中，同时可以便捷地编辑文章。

## Gatsby 项目结构

建议使用 Starter 修改着理解 Gatsby，我用的是 [Gatsby + Netlify CMS Starter](https://github.com/netlify-templates/gatsby-starter-netlify-cms)。

完整的 Gatsby 项目结构可以看[文档](https://www.gatsbyjs.org/docs/gatsby-project-structure/)，这里针对搭建博客用到的功能说明一下。

- `/src/pages` 目录下的组件会被生成同名页面。
- `/src/templates` 目录下放渲染数据的模板组件，如渲染 Markdown 文章，在其它博客系统中一般叫 `layout`。
- `/src/components` 一般放其它共用的组件。
- `/static` 放其它静态资源，会跳过 Webpack 直接复制过去。

接下来是两个比较常用的配置文件，需要修改时参考 Starter 改即可。

- `/gatsby-config.js` 基本用来配置两个东西：
  1. `siteMetadata` 放一些全局信息，这些信息在每个页面都可以通过 GraphQL 获取到。
  2. `plugins` 配置插件，这个按用到时按该插件文档说明弄即可。
- `/gatsby-node.js` 可以调用 [Gatsby node APIs](https://www.gatsbyjs.org/docs/node-apis/) 干一些自动化的东西。一般有两个常用场景：
  1. 添加额外的配置，比如为 Markdown 文章生成自定义路径。
  2. 生成 `/src/pages` 以外的页面文件，如为每个 Markdown 文章生成页面文件。

此外还有两个不那么常用的配置文件。

- `/gatsby-browser.js` 可以调用 [Gatsby 浏览器 APIs](https://www.gatsbyjs.org/docs/browser-apis/)，一般插件才会用到，如滚动到特定位置。
- `/gatsby-ssr.js` 服务器渲染的配置，一般也是插件才用到。

这就是搭建 Gatsby 博客的基本结构了，可以看到非常简单，且因为其丰富的生态，其它底层接口基本不需要用到。但接下来还是会有一些小坑，第一个便是 GraphQL，我会在下一篇文章中分析。
