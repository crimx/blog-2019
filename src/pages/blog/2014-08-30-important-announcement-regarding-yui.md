---
title: 关于 YUI 的重要公告
tags:
  - Translation
  - JavaScript
quote:
  content: ''
  author: ''
  source: ''
date: 2014-08-30T12:00:00.000Z
layout: blog-post
description: ''
---

原文：[Important Announcement Regarding YUI](http://yahooeng.tumblr.com/post/96098168666/important-announcement-regarding-yui)（2014-8-30）


雅虎 UI 库（YUI）从 2005 年就开始在雅虎使用，并在 2006 年 2 月 13 日宣布公开。虽然对比现在变化了不少，但 YUI 一直都是致力于提供一个全面的工具集，让开发人员轻松地创建 web 富应用程序。同样的，YUI 在 Yahoo 历史中占有重要的地位：成千上万行依赖于 YUI 的代码今天依然在雅虎中使用着。

然而，我们都清楚的知道产业正朝着新方向发展。众所周知，在过去几年 web 平台已经发生了急剧的转变，JavaScript 史无前例的流行。Node.js 的出现让 JavaScript 可以在服务器端使用，为创建同构单页应用（isomorphic single page application）打开大门。新型包管理器（npm、bower）有效地刺激了第三方生态系统的发展；开源、单一目的的工具相辅相成，拥抱着 UNIX 哲学，构建出极其复杂的开发用例。新型构建工具（Grunt 及其插件生态系统、Broccoli、Gulp）使一个个小模块很容易就可以组装成大型的集成应用程序。新型应用框架（Backbone、React、Ember、Polymer、Angular 等）帮助我们用新的方式构建可扩展、可维护的 web 应用程序。新型测试工具（Mocha、Casper、Karma 等）降低了构建可靠持续交付流水线的门槛。标准机构（W3C、Ecma）将近几年大型 JacaScript 框架搬上台面的内容进行了标准化，使大量的设备实现原生支持。最后，浏览器厂商现在都致力于不断改进其 web 浏览器，逐渐向标准看齐。且有了所谓的“常青 web 浏览器”（evergreen web browsers —— 让用户方便地运行最新稳定版的 web 浏览器），我们可以展望用户代理之间的差异性将显著减少。

在这种形势下，Web 技术发展的结果是 YUI 之类的大型 JavaScript 库已逐渐失去社区的青睐。许多开发者如今是把大型 JavaScript 库看做是束缚其发展的围墙。于是，YUI 的 issue 和 pull request 数量在过去几年一点点地减少。许多 YUI 核心模块都没有活跃的维护者，仅仅依赖外部参与者偶尔提交的补丁。且很少审核者能有时间保证提交的补丁能快速、完全地被审核。

因此，为了集中精力发展新技术，我们做出了一个艰难的决定，即刻终止所有 YUI 的新开发。这意味着此后 YUI 的新版本将少之又少，且只会包含对雅虎利益有重大影响的针对性补丁。

YUI 团队在雅虎的使命依然是针对内部开发者提供最佳的次世代表现技术。我们对 web 表现技术的未来保持乐观，并希望能继续与外部的前端社区一同分享和学习。

Julien Lecomte，雅虎表现技术工程部总监

