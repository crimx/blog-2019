---
title: 纯 CSS 实现浮动介绍
tags:
  - CSS
quote:
  content: “The people who drive us nuts often change us most.”
  author: Auliq Ice
  source: ''
date: 2017-04-29T12:00:00.000Z
layout: blog-post
description: ''
---

把扩展上传到 Chrome 商店需要在开发者后台填写一系列表单，非常喜欢它对详细介绍的处理，就想着偷师一下。

先上效果，下面是模仿的样子。由于详细介绍一般比设置本身要长，它使用了隐藏、按需显示的方式减少了高度。

<p>
  <iframe height='522' scrolling='no' title='Pure CSS Relative Aside' src='//codepen.io/straybugs/embed/JNWMmW/?height=522&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; height: 522px;'>See the Pen <a href='https://codepen.io/straybugs/pen/JNWMmW/'>Pure CSS Relative Aside</a> by CRIMX (<a href='http://codepen.io/straybugs'>@straybugs</a>) on <a href='http://codepen.io'>CodePen</a>.
  </iframe>
</p>

看了开发者后台的代码，它是使用 JavaScript 响应鼠标事件并计算高度和显示。作为 CSS 洁癖，我第一反应当然是先考虑用 CSS 实现。

这里主要的问题其实就是如何让鼠标在设置（body）上响应介绍（aside）的显示。

在实现 iPhone 滑块开关的时候，就是通过 `<input>` 的 `:check` 来控制 `<label>` 的变化，方法是利用 `+` 选择符选择兄弟姐妹元素。

像这种控制其它元素的情况都可以用这个方法。

```css
.item-aside {
  z-index: -1;
  opacity: 0;
}

.item-body:hover + .item-aside {
  z-index: 1;
  opacity: 1;
}
```

全部的代码，也火速使(tou)用(shi)在了 [Saladit](http://www.crimx.com/crx-saladict/) 的设置界面：

```html
<ul class="menu">
  <!--  (li.item>((.item-header>lipsum1)+(.item-body>lipsum5)+(.item-aside>lipsum10)))*10  -->
  <li class="item">
    <div class="item-header">Lorem.</div>
    <div class="item-body">Lorem ipsum dolor sit amet.</div>
    <div class="item-aside">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat, vitae.</div>
  </li>
  <li class="item">
    <div class="item-header">Nesciunt.</div>
    <div class="item-body">Sit doloremque repellat natus libero.</div>
    <div class="item-aside">Pariatur quibusdam voluptas, vero accusamus itaque. Neque magni autem sunt.</div>
  </li>
  <li class="item">
    <div class="item-header">Animi!</div>
    <div class="item-body">Similique voluptas, sint quam eligendi.</div>
    <div class="item-aside">Unde repudiandae, mollitia voluptatum similique repellendus eum. Ut, quae! Deleniti.</div>
  </li>
   <!--  ......  -->
</ul>
```

```scss
* {
  box-sizing: border-box;
}

.menu {
  margin: 15px 10%;
}

.item {
  display: flex;
  position: relative;
  margin-bottom: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.item-header {
  width: 2 / 12 * 100%;
  padding: 0 10px;
  text-align: right;
  font-weight: bold;
}

.item-body {
  flex: 1;
  width: 10 / 12 * 100%;
  margin-right: 4 / 12 * 100%;
  padding: 10px;
  background-color: #fafafa;
  
  &:hover + .item-aside {
    z-index: 1;
    opacity: 1;
  }
}

.item-aside {
  width: 4 / 12 * 100%;
  position: absolute;
  z-index: -1;
  top: 0;
  right: 0;
  padding-left: 10px * 2 + 1px;
  padding-right: 10px;
  opacity: 0;
  transition: all 400ms;
  
  // left line
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 10px;
    border-left: 1px #ddd solid;
  }
  
  &:hover {
    z-index: 1;
    opacity: 1;
  }
}
```


