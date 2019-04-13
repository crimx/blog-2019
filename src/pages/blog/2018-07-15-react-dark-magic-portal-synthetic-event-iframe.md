---
title: React 黑魔法之 Portal + SyntheticEvent + iframe
tags:
  - JavaScript
  - React
quote:
  content: >-
    One of the things I loved about working on 'Portal' was that we'd get emails
    from people saying, 'I love to play first-person shooters but my girlfriend
    won't play them with me. But I got her to play 'Portal' and she had a
    blast.'
  author: Kim Swift
  source: ''
date: 2018-07-15T12:00:00.000Z
layout: blog-post
description: ''
---

在实现划词扩展的时候，查词面板等模块需要植入到源网页，为了更方便地隔离样式污染，植入的模块均使用了 `<iframe>` 包装。在前一个 Vue 实现的版本 Saladict 5 中，有几个不太舒服的小小小小地方：

1. `<iframe>` 内外事件不通。
2. `<iframe>` 内外环境不一样，变量不能共用，需要 `postMessage` 交流。
3. Vue 组件必须要有一个根元素，且 `v-if` 隐藏之后元素原地还是会留下注释标记。在浏览器审查元素时看起来不太干净。

当然这个不影响呈现效果，所以当时也不怎么纠结了。然而后来在逛 React 文档的时候，意外发现了 [Portal](https://reactjs.org/docs/portals.html) 这个神器。

Portal 精妙的地方在于从 React 的角度（也是代码作者的角度），组件可以保持原来的结构，但实际可以渲染到任意地方（甚至是[其它窗口](https://hackernoon.com/using-a-react-16-portal-to-do-something-cool-2a2d627b0202)！）。

更令人拍案叫绝的是， [SyntheticEvent](https://reactjs.org/docs/events.html) 也是抽象到 React 层的，所以组件事件捕获冒泡全正常使用。

对于 `<iframe>` 需要做些小改变，[有人发现](https://github.com/iphong/react-portal-frame/blob/c6d42b7bfdb07eb4b3f908912356846970f713f2/src/index.js#L151-L153)，只需要把 `<body>` 组件上所有事件 `null` 掉即可。

这样就方便地解决了前两个小痛点了！

最后一点的解决方式是在组件不显示的时候将 Portal 的载体元素 `remove` 掉，显示时再 `appendChild` 回去。甚至配合动画也非常简单，在动画结束时 `remove` 即可。

最后如果对实现感兴趣的话可以参考：

- [封装的 PortalFrame 组件](https://github.com/crimx/ext-saladict/blob/dev/src/components/PortalFrame.tsx)。
- [在 PortalFrame 外部监听内部事件](https://github.com/crimx/ext-saladict/blob/5242bbf596a88a04b5ea067a4b4f3989e80d46ef/src/content/components/DictPanelPortal/index.tsx#L285-L290)。
- [与动画组件配合移除载体元素](https://github.com/crimx/ext-saladict/blob/dev/src/content/components/SaladBowlPortal/index.tsx)。

值得一提的是，也有人吸取灵感实现了 Vue 版的 [Portal](https://github.com/LinusBorg/portal-vue)。然而这个功能[没有得到官方青睐](https://github.com/vuejs/vue/issues/4841)，只是社区实现。由于没有内核权限，相比于 React Portal 这仅是部分实现。

