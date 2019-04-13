---
title: 巧妙监测元素尺寸变化
tags:
  - Recommended
  - Resize
  - 闲读源码
  - 闲读规范
quote:
  content: 'Whatever story you want to tell, tell it at the right size.'
  author: Richard Linklater
  source: ''
date: 2017-07-15T12:00:00.000Z
layout: blog-post
description: ''
---

在往下读之前不妨先想一下，你会怎么实现？如何知道元素的尺寸发生变化了？

相信很多人第一反应是 resize 事件，但这个只是 document view 变化才会触发。

然后就是轮询，反复查询值变化了没有。开销不是一般的大，但像这样的库（比如这个[七年前的](https://github.com/cowboy/jquery-resize)）现在还有人用。

最后便是[这个](https://github.com/marcj/css-element-queries)，号称 event based 无性能问题，便去观摩了一番源码。代码本身没什么惊喜，所以本文不会像[之前](/tags/%E9%97%B2%E8%AF%BB%E6%BA%90%E7%A0%81/)一样逐行逐块地分析，而是着重原理，对应[这部分](https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js#L100)的源码。

## 整体思路

这个方法的主要思想是在被监测元素里包裹一个跟元素位置大小相同的隐藏块。隐藏块可以滚动，并有一个远远大于它的子元素。当被监测元素尺寸变化时期望能触发隐藏块的滚动事件。

这个方法听起来很简单是不是，但如果你直接这么实现会发现时而行时而不行，问题就在于触发滚动事件的条件。

## 如何计算滚动？

这是我觉得这个话题值得写成文章的一个有趣点。我们理所当然地看待滚动，但有没有想过它是怎么计算的呢？

### 发生滚动的时机

有问题当然要去请教规范老师。

第一步我们需要知道什么时候才会发生滚动，首先一个题外话，overflow 为 hidden 也是可以滚动的，[另外一篇](/2016/04/18/document-scrollingelement-polyfill/)分析里也遇到过。

在[这里](https://www.w3.org/TR/cssom-view-1/#scrolling-events)提到滚动事件发生的时机，但说得有点笼统

> Whenever an element gets scrolled (whether in response to user interaction or by an API)

但从这段我们可以知道，每次发生滚动的时候，浏览器会先收集起来，在下次 event loop 到达时[统一](https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering)地[处理](https://www.w3.org/TR/cssom-view-1/#run-the-scroll-steps)。

滚动的描述在[这里](https://www.w3.org/TR/cssom-view-1/#scroll-an-element)：

> To scroll an element element to x,y optionally with a scroll behavior behavior (which is "auto" if omitted) means to:
> 
> 1. Let box be element’s associated scrolling box.
> 2. - **If box has rightward overflow direction**
>      Let x be max(0, min(x, element scrolling area width - element padding edge width)).
>    - If box has leftward overflow direction
>      Let x be min(0, max(x, element padding edge width - element scrolling area width)).
> 3. - **If box has downward overflow direction**
>      Let y be max(0, min(y, element scrolling area height - element padding edge height)).
>    - If box has upward overflow direction
>      Let y be min(0, max(y, element padding edge height - element scrolling area height)).
> 4. Let position be the scroll position box would have by aligning scrolling area x-coordinate x with the left of box and aligning scrolling area y-coordinate y with the top of box.
> 5. If position is the **same as** box’s current scroll position, and box does not have an ongoing smooth scroll, **abort these steps**.
> 6. **Perform a scroll** of box to position, element as the associated element and behavior as the scroll behavior.

最后一步[“perform a scroll”](https://www.w3.org/TR/cssom-view-1/#perform-a-scroll)才会真正触发滚动事件。

第五步便是问题关键，位置相同的时候，滚动事件不会发生。

### 重排

根据前面的整体思路，当被监测元素尺寸发生变化时，隐藏元素也跟着变化。于是引发了 Layout/Reflow 使到重新计算滚动位置 *position*。

但这时也许你会发现 *position* 根本没有变化，如图一。

![图一][图一]

```html
<body>
<style>
  .parent {
    height: 100px;
    width: 100px;
    overflow: scroll;
    background: red;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
  }

  .child {
    height: 200%;
    width: 200%;
    background: blue;
  }

  .msg {
    position: absolute;
    top: 370px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }
</style>

<div class="parent">
  <div class="child"></div>
</div>
<div class="msg">
  <div class="msg1"></div>
  <div class="msg2"></div>
</div>

<script>
  var parent = document.querySelector('.parent')
  var child = document.querySelector('.child')
  var msg1 = document.querySelector('.msg1')
  var msg2 = document.querySelector('.msg2')

  parent.scrollTop = 1000
  parent.scrollLeft = 1000

  var eventCount = 0
  function log () {
    msg1.innerText = `scrollTop: ${parent.scrollTop}, scrollLeft: ${parent.scrollLeft}`
    msg2.innerText = `${eventCount} scroll event${eventCount > 1 ? 's were' : ' was'} triggered`
  }

  log()

  parent.addEventListener('scroll', () => {
    eventCount += 1
    log()
  })
</script>
</body>
```

为什么？上面的第二、三步有答案。一般来说，我们的设备都是上到下、左到右，所以属于右下方向溢出，对应上面的 2.1 和 3.1 公式。每次计算滚动距离都会跟可滚动的空间比较取最小值。

因为子元素的尺寸是固定的，且远远大于容器，故两者的差非常大，所以最小值一直是 x 和 y，每次重排都会在同个位置，触发了上面的第五步。

同时根据公式易得：当可滚动空间一开始不比 x 和 y 大，且随滚动不断变小时，就可以让 *position* 发生变化。

于是，我们先让元素滚到最尽头，那么 x 和 y 达到了最大值。当容器尺寸变大时，因为子元素的尺寸是固定的，故 scrolling area 的大小不变，所以两者的差变小了，x 和 y 得到新的最小值，发生了滚动。见图二。

![图二][图二]

```css
/* ... */
.child {
  height: 200px;
  width: 200px;
}
/* ... */
```

```javascript
// .....
var msg2 = document.querySelector('.msg2')

parent.scrollTop = 1000
parent.scrollLeft = 1000

var eventCount = 0
// ....
```

初始的 1 个事件就是上面提到的 event loop 导致的。

可以观察滚动发生，我们期望容器达到最大时 x 和 y 都没有达到最小值，所以子元素的大小须比容器最大值要大。

动图同时也可观察到容器变小时没反应。按上面的公式也很容易知道，容器变小了，差值变大了，所以最小值还是 x 和 y，故不触发滚动。

怎么办呢？

### 物尽其用

再看回公式，我们希望容器变小时，差值也变小。那么只能是让 scrolling area 也跟着变小了。如果子元素大小改为百分比行不？我们来证明一下。

设容器宽度为 `x1` 或者 `x2`，其中 `x2 > x1`，子元素大小为 `n * x1` 或 `n * x2`，因我们不设 padding，则有

```python
n * x1 - x1 < n * x2 - x2
↓
(n - 1) * x1 < (n - 1) * x2
↓
n > 1
```

证明了通过百分比是可行的。

同时我们期望容器达到最小时 x 和 y 都没有达到最小值，容器为 0 时无意义，故设最小为 1，则

```python
(n - 1) * 1 >= 1
↓
n >= 2
```

故我们只需让子元素大小至少为 200% 就可以！见图三

![图三][图三]

```css
/* ... */
.child {
  height: 200%;
  width: 200%;
}
/* ... */
```

```javascript
// .....
var msg2 = document.querySelector('.msg2')

parent.scrollTop = 1000
parent.scrollLeft = 1000

var eventCount = 0
// ....
```

同时也说明百分比不能监测容器变大，因为 `0 < n < 1` 与 `n >=  1 + 1/Max` 矛盾，可自行证明。

所以，结合两个方式就可以监测元素扩大与缩小变化。

## 代码

原理搞通之后代码就不难了，我[这里](https://codepen.io/straybugs/full/mwgWad/)另外重新实现了一遍，修改了隐藏块的创建方式以及加入 [passive events](https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md) 优化滚动。Demo 里拖动一个块改变大小另一个会同步变化，可以看到非常的流畅。

<p>
  <iframe height='408' scrolling='no' title='Sync Twin Boxes' src='//codepen.io/straybugs/embed/mwgWad/?height=408&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; height: 408px;'>See the Pen <a href='https://codepen.io/straybugs/pen/mwgWad/'>Sync Twin Boxes</a> by CRIMX (<a href='https://codepen.io/straybugs'>@straybugs</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</p>

[图一]: /img/post/element-onresize/1.gif
[图二]: /img/post/element-onresize/2.gif
[图三]: /img/post/element-onresize/3.gif

