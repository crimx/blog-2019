---
layout: blog-post
draft: false
date: 2019-04-22T12:23:21.961Z
title: 搭建 Gatsby 博客二：使用 GraphQL 管理资源
description: Gatsby 默认使用了 GraphQL 来管理资源。本文将谈谈这么做的优点以及当中的一些坑。
quote:
  author: Gina Bellman
  content: >-
    “I love those connections that make this big old world feel like a little
    village.”
  source: ''
tags:
  - Gatsby
  - Blog
  - GraphQL
---
## 为什么用 GraphQL

[上一篇](/2019/04/18/搭建-gatsby-博客一：为什么选-gatsby/)介绍了选择 Gatsby 的原因，其中提到了 Gatsby 使用 GraphQL 。大家可能会有疑惑，不是建静态博客么，怎么会有 GraphQL？难道还要部署服务器？

其实这里 GraphQL 并不是作为服务器端部署，而是作为 Gatsby 在本地管理资源的一种方式。

通过 GraphQL 统一管理实际上非常方便，因为作为一个数据库查询语言，它有非常完备的查询语句，与 JSON 相似的描述结构，再结合 Relay 的 Connections 方式处理集合，管理资源不再需要自行引入其它项目，大大减轻了维护难度。

## 带魔法的 GraphQL

这里也是 Gatsby 的第一个坑。在 Gatsby 中，根据 js 文件的位置不同，使用 GraphQL 有两种形式，且 Gatsby 对其做了魔法，在 `src/pages` 下的页面可以直接 `export` GraphQL 查询，在其它页面需要用 [StaticQuery 组件](https://www.gatsbyjs.org/docs/static-query/)或者 [useStaticQuery](https://www.gatsbyjs.org/docs/use-static-query/) hook。

这里面查询语句虽然写的是字符串，但其实这些查询语句不会出现在最终的代码中，Gatsby 会[先对其抽取](https://www.gatsbyjs.org/docs/page-query#how-does-the-graphql-tag-work)。

个人其实不太喜欢魔法，因为会增加初学者的理解难度。但不得不承认魔法确实很方便，就是用了魔法的项目应该在文档最显眼的地方说明一遍。

## 快速上手 GraphQL

GraphQL 结构跟最终数据很相似，基本语法也非常简单，看看官方文档即可。一个快速上手的方式是访问项目开发时（默认 `http://localhost:8000`）的 `/___graphql` 页面，通过 GraphiQL 编辑器右侧可以浏览所有能够查询的资源。

另一个需要理解的是 Relay 的 Connections 概念，你会发现 Gatsby 里所有的数据集合都是以这种方式查询。推荐阅读 [Apollo 团队分享的文章](https://blog.apollographql.com/explaining-graphql-connections-c48b7c3d6976)。

对 Connections 细致的理解往往是实现分页等底层需求时才需要，而这些均有插件完成。一般使用时只需要知道集合里每个项目的数据在 `edges.node` 中，同时通过 GraphiQL 浏览其它可以使用的数据。如对于 Markdown 文章，相应插件提供了字数统计以及阅读时长等数据，均可通过 GraphQL 直接获取。

## Debug GraphQL

Gatsby 魔法带来的另外一个坑是 GraphQL 报错信息不全，可能会默默被吞掉，也可能无法定位到最终文件。

我在修改 starter 时踩到一个坑是复制组件时忘了修改 static query 查询语句的名称，导致重名报错。

避免错误最好方式是在 GraphiQL 编辑器中写好运行无误再复制到组件中。

## Remark 插件坑

Gatsby 中处理 markdown 最常用也是默认的插件是 `gatsby-transformer-remark`。这个插件对 markdown 文件解析后会生成 `MarkdownRemark` GraphQL 节点，其中 front matters 数据也会被解析出来。同时 `MarkdownRemark` 的集合对应为 `allMarkdownRemark` connections。

对于 connections 节点我们一般可以用 `sort` 和 `filter` 来筛选处理数据（可在 GraphiQL 编辑器中浏览），这里有一个坑便是如果要处理 front matters 数据，它们必须存在所有查询的 markdown 文件上并且具有相同的类型，插件才会生成相应的 fields，否则可能会抛出异常或者更糟糕的，默默失败了。

避免方式同上，先在 GraphiQL 编辑器中运行一遍，看看筛选的结果是否正确。

另外一种处理方式是在 `/gatsby-node.js` 中通过 `onCreateNode` 钩子，在生成 markdown 相关节点时手工处理，确保节点存在。

这在实现草稿和上下篇的时候会用到，具体例子我会在后续文章中再写。
