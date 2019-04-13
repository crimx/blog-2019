---
title: Web 可访问性整理
tags:
  - 可访问性
  - Accessibility
  - 语义化
quote:
  content: Being unconscious is the ultimate disability.
  author: Jessa Gamble
  source: ''
date: 2017-12-08T12:00:00.000Z
layout: blog-post
description: ''
---

## 定义

- 可访问性 Accessibility  
  为障碍用户提供同等用户体验。使障碍用户能对产品感知、理解、定位和交互，并能平等地参与贡献。

- 可用性 Usability  
  可用性和用户体验设计（User Experience Design）是为了让目标用户使用产品高效、满意地达到特定目标。

- 包容性 Inclusion  
  包容性设计（Inclusive Design）、通用设计（Universal Design）和人性化设计（Design For All）尽可能让每个人都能容易地用上产品。包容性要解决的问题非常广，包括软、硬件的可访问性和质量、互联网连通性、计算机文化和技能、经济状况、教育、地理位置、语言、以及年龄和残障。


## 体验屏幕阅读

要解决问题首先得知道问题是怎样的，体验屏幕阅读器：

- [ChromeVox](https://chrome.google.com/webstore/detail/chromevox/kgejglhpjiefppelpmljglcjbhoiplfn/related?hl=en) ，Chrome 扩展
- [NVDA](https://www.nvaccess.org/download/) ，开源跨平台
- VoiceOver (MacOS)


## 工具

- 校验
  - Chrome 自带 Audits
  - [aXe](https://www.axe-core.org/) 扩展、命令行工具等。
  - webaim.org
- 调试
  - Chrome 自带实验性 Accessibility Inspector `chrome://flags/#enable-devtools-experiments`
  - [Web Developer](https://chrispederick.com/work/web-developer/) 扩展
  - [Accessibility Developer Tools](https://chrome.google.com/webstore/detail/accessibility-developer-t/fpkknkljclfencbdbgkenhalefipecmb?hl=en) 扩展
- 颜色
  - [Color-Oracle](http://colororacle.org) 模拟色盲，开源跨平台
  - [Lea Verous Contrast Ratio](http://leaverou.github.io/contrast-ratio/)
  - [WCAG Color Contrast Analyzer](https://chrome.google.com/webstore/detail/color-contrast-analyzer/dagdlcijhfbmgkjokkjicnnfimlebcll)


## 参考规范

有什么问题查规范准没错。在自行实现支持 ARIA 的元素时很有用。

- [Web Content Accessibility Guidelines (WCAG) 2.0](https://www.w3.org/TR/WCAG20/)
- [Accessible Rich Internet Applications (WAI-ARIA)](https://www.w3.org/TR/wai-aria/)
- [HTML 5.1 2nd Edition](https://www.w3.org/TR/html5/sections.html)


## 其它资料

### 文章

- [Accessibility, Usability, and Inclusion: Related Aspects of a Web for All](https://www.w3.org/WAI/intro/usable)
- [Accessibility - W3C](https://www.w3.org/standards/webdesign/accessibility)
- [Web Fundamentals - Accessibility](https://developers.google.com/web/fundamentals/accessibility/)
- [Common idioms without dedicated elements](https://www.w3.org/TR/html5/common-idioms-without-dedicated-elements.html#common-idioms-without-dedicated-elements)
- 本文原文 [Web 可访问性整理](https://blog.crimx.com/2017/12/08/web-accessibility/)

### 视频

- Google 的 [A11ycasts](https://www.youtube.com/watch?v=HtTyRajRuyY&list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g&index=28)
- [Accessibility](https://www.youtube.com/watch?v=o4xHfi4t9S0&list=PLWjCJDeWfDdcEtSnqq_iGLKGA_H_3o3y7) by Thomas Bradley
- [Pragmatic Accessibility: A How-To Guide for Teams (Google I/O '17)](https://www.youtube.com/watch?v=A5XzoDT37iM)

### 课程

- 官方教程 [Web Accessibility Tutorials](https://www.w3.org/WAI/tutorials/)
- [Web Accessibility](https://cn.udacity.com/course/web-accessibility--ud891)


## Tab

对于纯键盘使用者来说， Tab 键承担了重要责任。

### Tab 顺序

要点： Tab 顺序是按照 DOM 结构，而不是 CSSOM 结构。

所以通过 CSS 将元素提前（如 flex order）并不会影响 tab 顺序。在排版的时候需要考虑。

### 其它元素

Tab 默认只会识别部分元素，如果需要让其它元素也被识别，加上 `tabindex="0"` 属性。

不鼓励使用大于 0 的其它数字，除了会造成混乱，一些屏幕阅读器也[不一定会遵循](https://www.youtube.com/watch?v=Pe0Ce1WtnUM&list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g&index=25)。应该用 DOM 顺序来体现 tab 顺序。

### 忽略 Tab

要让 tab 忽略一个元素，即直接跳过去，设置 `tabindex="-1"` 属性。

或者用还在草稿阶段的 `inert` 属性 ([polyfill](https://github.com/GoogleChrome/inert-polyfill))。

### 侧导航栏问题

在一些响应式的网页，侧导航栏在宽度变小时可能会隐藏起来，这时用户如果使用 tab 跳转可能会发现焦点突然不见了，怎么按也没反应。其实是因为 tab 跳到导航栏的链接去了。

解决方式要么改变 DOM 结构，将导航栏移到最后；要么使用前面提到的 `inert` 属性。

### Skip Link

将导航的每个项目绝对定位到屏幕之上，再设置 `:focus` 样式移下来。就可以实现用户按 tab 时一次只显示一个导航链接，用户再按回车即可跳到该位置。可以参考 Github 网页。


## 原生元素

尽可能使用原生支持的元素，如 `<button>` ，而不是用 `<span>` 或 `<div>` 模拟。原因：

- 原生符合语义。
- 原生对屏幕阅读友好，否则需要写一堆 ARIA 属性来提示阅读器。
- 原生不需要 JS 支持。
- 原生元素用键盘可以代替鼠标点击，否则还要监听键盘事件。
- Focus Ring 浏览器自动识别原生元素，否则要另外写 CSS 隐藏。
- CSS 很容易就能改变原生元素的样式，与整体设计统一。


## 语义标签

使用符合语义的标签，辅助设备会自动理解。

- `<article>`：完整、独立的内容。
  - 每篇 `<article>` 应该包含一个标题（`<h1>`-`<h6>`）。
  - 嵌套的 `<article>` 主题应该跟父 `<article>` 相关联。
  - 考虑使用 `<article>` 应该看其内容是否会出现在文档的提纲（outline）中。
  - 辅助设备会将其 role 理解为“article”。
- `<section>`：按主题归在一起的部分内容。
  - 每块 `<section>` 应该包含一个标题（`<h1>`-`<h6>`）。
  - 如果内容是完整、独立的，应该考虑使用 `<article>`。
  - 不要将 `<section>` 当 `<div>` 使用，只为样式时应该用 `<div>` 。
  - 考虑使用 `<article>` 应该看其内容是否会出现在文档的提纲（outline）中。
  - 辅助设备会将其 role 理解为“region”，见[下方](#Landmarks)。
- `<nav>`：包含一系列链接可以跳转到其它页面或者本页面的某部分。
  - 使用列表元素帮助辅助设备理解。
  - 只为主要导航使用。
  - 辅助设备会将其 role 理解为“navigation”，见[下方](#Landmarks)。
- `<aside>`：侧边栏，其内容应该不属于主体内容的一部分。
  - 可以放导航组、广告等。
  - 辅助设备会将其 role 理解为“complementary”，见[下方](#Landmarks)。
- `<h1>`-`<h6>`：一个块或子块的标题。
  - 请勿为了样式而用标题来表示副标题、子标题、额外标题、标语等，变通可参考[这里](https://www.w3.org/TR/html5/common-idioms-without-dedicated-elements.html#common-idioms-without-dedicated-elements)。
  - 辅助设备会将其 role 理解为“heading”加上“1”到“6”。
- `<header>`：对最近的父 [sectioning content](https://www.w3.org/TR/html5/dom.html#sectioning-content) 或 [sectioning root](https://www.w3.org/TR/html5/sections.html#sectioning-roots) 的介绍。
  - 如果父 sectioning root 是 `<body>`，辅助设备会将其 role 理解为“banner”，见[下方](#Landmarks)。
- `<footer>`：代表其最近的父 [sectioning content](https://www.w3.org/TR/html5/dom.html#sectioning-content) 或 [sectioning root](https://www.w3.org/TR/html5/sections.html#sectioning-roots) 的页脚。
  - 如果父 sectioning root 是 `<body>`，辅助设备会将其 role 理解为“content information”，见[下方](#Landmarks)。
- `<address>`：为其最近的父 `<article>` 或 `<body>` 元素提供联系信息。
  - 只提供必要的联系信息，不要包含其它信息。

[sectioning root](https://www.w3.org/TR/html5/sections.html#sectioning-roots) 包括 `<blockquote>`, `<body>`, `<details>`, `<fieldset>`, `<figure>`, `<td>`.

[Sectioning content](https://www.w3.org/TR/html5/dom.html#sectioning-content) 包括 `<article>`, `<aside>`, `<nav>`, `<section>`.


## Landmarks

Landmark roles 定义网页的几个主要部分，可以让辅助设备快速跳转。

总共有[八个](https://www.w3.org/TR/wai-aria/#landmark_roles)。

1. `banner`：**唯一**。跟网站相关的内容，如 logo 、赞助商、站内搜索等。
2. `complementary`：对主体内容的补充。与主体内容相关，但本身独立。如相关文章。
3. `contentinfo`：**唯一**。版权信息、隐私声明等。
4. `form`：表单。**应该**设置可见的标题，并用 `aria-labelledby` 引用标题来告知辅助设备这个表单是干什么的。如果用 JS 提交表单，没有触发 `onsubmit` 事件，则**应该**用其它方式通知表单提交。
5. `main`：**唯一**。主体内容。
6. `navigation`：导航栏。
7. `region`：认为用户可能会感兴趣的，需要让用户可以快速跳转的内容。辅助设备会收集它来生成一个概要页面。每个 region **必须**有可见的标题，并用 `aria-labelledby` 引用。
8. `search`：搜索框。


## 视觉隐藏

使用视觉隐藏而不是 `display: none;` 来隐藏元素同时让辅助设备识别。

```css
.visually-hidden {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  clip: rect(0 0 0 0);
}
```

【完】


