---
title: CSS 自适应正方形
tags:
  - CSS
  - Responsive
  - Square
quote:
  content: ''
  author: ''
  source: ''
date: 2015-02-28T12:00:00.000Z
layout: blog-post
description: ''
---

[padding 使用百分数值时是根据其包含块的 width 值计算的。][padding-mdn]

> With respect to the width of the containing block.

所以可以利用 `height = 0;` 并用 `padding-bottom = 100%;` 撑起一个正方形：

<p>
  <iframe height='265' scrolling='no' title='CSS Responsive Square' src='//codepen.io/Crimx/embed/VYdMWJ/?height=265&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; height: 265px;'>See the Pen <a href='http://codepen.io/Crimx/pen/VYdMWJ/'>CSS Responsive Square</a> by Jesse Wong (<a href='http://codepen.io/Crimx'>@Crimx</a>) on <a href='http://codepen.io'>CodePen</a>.
  </iframe>
</p>

```html
<div class="container">
  <div class="spacer"></div>
  <div class="content">item</div>
</div>
```

```css
.container {
  position: relative;
  width: 20%;
}

.spacer {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background: orange;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
}
```

参考资料

- [CSSだけで正方形を作る](http://qiita.com/usp/items/96f3cf9997ebb5b3dbb9)
- [padding-CSS MDN][padding-mdn]


[padding-mdn]: https://developer.mozilla.org/en-US/docs/Web/CSS/padding#Syntax 

