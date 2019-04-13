---
title: CSS 过渡未知高度
tags:
  - CSS
  - Transition
quote:
  content: ''
  author: ''
  source: ''
date: 2016-11-12T12:00:00.000Z
layout: blog-post
description: ''
---

有时候往 dom 里插入一些元素，会希望 dom 慢慢腾开空间，再把插入的元素呈现出来。

但对于过渡 `height` 未知的元素，暂时没有完美的方法，浏览器还不支持 `height` 过渡到 `auto`。而且这种方式也会造成这个元素后面的所有元素一并重绘，蛮耗资源的。

以下是利用 `max-height` 来过渡，适合已知元素高度的范围。但也不是完美方法，`max-height` 固定了，那么同样的时间，元素高度越小过渡就会显得越快。所以只好尽量选最接近的 `max-height`。

<p>
  <iframe height='300' scrolling='no' title='css transition max-height' src='//codepen.io/straybugs/embed/preview/ObqVBy/?height=300&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; height: 300px;'>See the Pen <a href='http://codepen.io/straybugs/pen/ObqVBy/'>css transition max-height</a> by CrimX (<a href='http://codepen.io/straybugs'>@straybugs</a>) on <a href='http://codepen.io'>CodePen</a>.
  </iframe>
</p>

写的时候犯了一个小错误，折腾了一会才发现时间 0 忘了加单位。CSS 时间里`0`[是非法的值](https://developer.mozilla.org/en-US/docs/Web/CSS/time)。

