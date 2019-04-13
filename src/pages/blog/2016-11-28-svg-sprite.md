---
title: SVG Symbol 和 Sprite 的好处和坑
tags:
  - Image
  - SVG
  - Sprite
  - Recommended
quote:
  content: >-
    I propose that the following character sequence for joke
    markers:<p>:-)</p>Read it sideways.
  author: Scott E. Fahlman
  source: ''
date: 2016-11-28T12:00:00.000Z
layout: blog-post
description: ''
---

# SVG Symbol

用 Symbol 来把 SVG 合并到一个文件几乎是现在最流行的用法。

## Symbol 好处

### 方便

利用 ID 来取图案，所以不用各种计算，可以随便放。

### 反复利用

这应该是一个不太容易发现的好处，你可以在文件内部继续用`<use>`来做图案的各种版本。这样 SVG 的优势更加明显，节省了好多空间。

比如这个博客里用到的社交图案，原本的是只有图案本身。例如这是 Codepen 的图案：

```html
<symbol id="icon-codepen" viewBox="0 0 32 32">
  <title>codepen</title>
  <path class="icon-path" d="M17.050 1.259c-0.882-0.546-2.016-0.546-2.855 0.042l-12.764 8.649c-0.672 0.462-1.092 1.218-1.092 2.016v9.321c0 0.84 0.42 1.596 1.134 2.057l12.974 8.355c0.84 0.546 1.931 0.546 2.813 0l13.226-8.482c0.714-0.462 1.134-1.218 1.134-2.057v-9.153c0-0.84-0.42-1.596-1.134-2.057l-13.436-8.691zM26.959 11.378l-4.87 3.191-4.576-3.233-0.042-6.382 9.489 6.424zM14.11 4.954v6.256l-4.702 3.191-4.702-3.065 9.405-6.382zM3.446 14.401l3.023 1.973-3.023 2.057v-4.031zM14.195 27.753l-9.447-6.172 4.744-3.233 4.744 3.107c-0.042 0-0.042 6.298-0.042 6.298zM12.389 16.332l3.065-2.099 3.569 2.267-3.149 2.099-3.485-2.267zM17.553 27.753v-6.298l4.535-2.939 4.87 3.107-9.405 6.13zM28.302 18.557l-3.233-2.057 3.233-2.099v4.157z"/>
</symbol>
```

现在直接在文章里`<use>`：

```html
<svg fill="#000">
  <use xlink:href="/images/symbol-defs.svg#icon-codepen" />
</svg>
```

就是这个效果:

<p style="text-align: center; max-height: 150px;">
  <svg fill="#000">
    <use xlink:href="/images/symbol-defs.svg#icon-codepen" />
  </svg>
</p>

在`symbol-defs.svg`里还有它的另外一个版本，带圆圈的，只需要添加几行就可以：

```html
<symbol id="icon-codepen-circle" viewBox="0 0 32 32">
  <title>codepen</title>
  <circle cx="50%" cy="50%" r="50%" fill="#000"/>
  <use xlink:href="#icon-codepen" width="20" x="6" fill="#fff"/>
</symbol>
```

同样的使用方式，既环保又方便：

<p style="text-align: center; max-height: 150px;">
  <svg fill="#000">
    <use xlink:href="/images/symbol-defs.svg#icon-codepen-circle" />
  </svg>
</p>

## Symbol 坏处

### 不完全支持

这种方式并不完全支持 SVG 的各种特性。比如我开始就踩到了一个坑。我的 LOGO 里使用了`clippath`，使用这种方式就会失去效果。这个貌似是个[陈年老 bug](https://bugs.chromium.org/p/chromium/issues/detail?id=109212) 来的。

解决方式就是利用工具合并路径，最好还压缩成一条，方便管理。编辑工具推荐 [Boxy SVG](https://boxy-svg.com/main.html#download)，生成的代码非常轻盈，而且尽可能保留原来的样子，不会像 Illustrator 一样源码面目全非。压缩工具推荐 [SVGOMG!](https://jakearchibald.github.io/svgomg/)，号称 [SVGO](https://github.com/svg/svgo)'s Missing GUI。

### 奇怪的宽高

在宽和高是百分比的情况下，会出现跟`<img>`或者普通`<svg>`不一样的计算。有时高空出一段，有时宽空出一段。

这个我纠结了很久，没有找到原因。我猜是受到原本整个 SVG 的影响。

解决方法是用相同宽高比的父`<div>`来限制；或者不用百分比。

### 慢

因为零部件是可以`<use>`的，所以引擎不能像图片一样直接解析完就一整块到处扔。

虽然这个延时非常的小，一般几乎感觉不到，但是如果像这个博客左边的菜单栏一样（电脑上），在每个页面都是同样的元素，那么切换页面的时候就可以肉眼感受到图案的闪动。这种情况就只能放弃使用 Symbol。可以考虑单独一张 SVG 图片或者：:point_down:

# SVG Sprite

SVG Sprite 与以前的 PNG Sprite 一样，把图案按一定方式平铺到一张大图片上。

## Sprite 好处

### 对齐

SVG 不受大小限制，所以 Sprite 可以按统一的规格排列。

取的时候也不受大小限制，利用百分比来取。

比如这个博客左边菜单的图案就是 SVG Sprite，[利用 Sass 自动计算百分比](https://github.com/crimx/blog/blob/master/themes/crimx/source/_scss/libs/_svg-icons.scss)。

### 快

这种方式与普通图片一样肉眼看不到延时，而且还结合了 SVG 不受大小限制的优势。

## Sprite 坏处

### 添加麻烦

图案受位置影响，当然没有 Symbol 方法来得方便。

因为需要快速显示的图案不多，我是利用 [Boxy SVG](https://boxy-svg.com/main.html#download) 一个一个添加的。

不太用心的查过一下，没注意到有合适的自动化工具。

能用 Symbol 的当然优先使用 Symbol 方法，所以 Sprite 用的也不多，手动添加可以满足。

### 有误差

使用百分比因为受小数影响，图案会有`1px`浮动，当然这个`1px`是根据图案当前大小得出的，所以越小图案浮动的位置越大。

解决方法有两个，一是避免产生小数，按倍数来设置图案大小；二是按图案最小的情况计算出血，把图案缩小空出足够位置。

