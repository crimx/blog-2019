---
title: CSS Font 单位
tags:
  - CSS
  - Font
  - 闲读规范
quote:
  content: ''
  author: ''
  source: ''
date: 2014-08-16T12:00:00.000Z
layout: blog-post
description: ''
---

了解 CSS font 各个单位的意义，搜了一些资料。

[[1]](#w3)  
![recommended][recommended]


绝对单位
--------

- cm (centimeter 厘米)
- mm (millimeter 毫米)
- in (inch 英寸)
- pt (point 点)
- pc (pica 派卡)

相对单位
--------

- em (em = 目标元素像素值 / 父元素 font-size 的像素值) [[3]](#mozilla)
- ex (约为小写字母 a, c, m, o 之类的高度) [[1]](#w3)
- px (pixel 像素)


em
---

有的文章（书）会提到 em 是指大写字母 M 的宽度（[[4]](#css-design) P57）。那是已经过时的说法，现在很多字体的 M 其实占不到 1em 的宽度。[[2]](#wikipedia)

只用 em 和 px
-------------

例子来自 [www.w3.org](http://www.w3.org/Style/Examples/007/units.en.html)

<p style="line-height: 3.2; text-shadow: 0 0">
  <span style="padding: 1em 0; border-left: 0.5pt solid">0.5pt,</span>
  <span style="padding: 1em 0; border-left: 1px solid">1px,</span>
  <span style="padding: 1em 0; border-left: 1pt solid">1pt,</span>
  <span style="padding: 1em 0; border-left: 1.5px solid">1.5px,</span>
  <span style="padding: 1em 0; border-left: 2px solid">2px</span>
</p>

如果前面四根线看起来一样（或者 0.5pt 的看不见了），你应该是在用不能显示小于 1px 点的电脑显示屏。如果能看到线的厚度递增，你应该在看高质量电脑显示器或打印的纸张。如果 1pt 看起来比 1.5px 厚，你可能在用手持设备。

当需要排列文字与图片的时候用 px 比较合适。

而字体更好是用 em 。（一）不要设置 body 的 font 大小，因为默认大小是读者可以舒适阅读的大小。（二）用 em 设置其它元素大小，比如 2.5em 就是 body 字体的 2.5 倍大小。

只有在设置打印字体的时候才用 pt/cm/in 单位。

新型单位
--------

- rem (root em 就是依据根元素字体大小的比值，em 会叠加，rem 不会)
- vw (window 宽度的 1/100)
- vh (window 高度的 1/100)

参考
----

1. <a href="http://www.w3.org/Style/Examples/007/units.en.html" id="w3">www.w3.org</a>
1. <a id="wikipedia" href="http://en.wikipedia.org/wiki/Em_(typography)">wikipedia</a>
1. <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/font-size" id="mozilla">developer.mozilla.org</a>
1. <a href="http://www.amazon.cn/%E5%9B%BE%E7%81%B5%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%E4%B8%9B%E4%B9%A6-CSS%E8%AE%BE%E8%AE%A1%E6%8C%87%E5%8D%97-%E5%8F%B2%E5%AF%86%E6%96%AF/dp/B00COG3VRC/ref=sr_1_1" id="css-design">《CSS设计指南(第3版)》</a>

[recommended]: /img/post/css/font-units-recommended.png

