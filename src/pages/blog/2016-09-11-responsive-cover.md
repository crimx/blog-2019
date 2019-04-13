---
title: 自适应背景图片
tags:
  - CSS
  - Background
  - Responsive
  - Recommended
quote:
  content: >-
    It's not necessary to go far and wide. I mean, you can really find exciting
    and inspiring things within your hometown.
  author: Daryl Hannah
  source: ''
date: 2016-09-11T12:00:00.000Z
layout: blog-post
description: ''
---

很多时候我们希望背景图片能够在元素不同大小的情况下都能够显示出主体。

居中是最常见的方式，但如果主体不在中间这个效果就大打折扣了。

这个对我来说一开始仅仅是一个念头，也没太注意。直到一次在 podcast 上听到有位嘉宾做了一个 jQuery 插件 <https://github.com/wentin/ResponsifyJS>，主要就是为了实现这种效果。

感兴趣地去看了一下，感觉还是太重了。但我有个缺点就是一旦开始了就不容易停下来，就继续找了一下资料。发现其实浏览器本身就有很好的实现。

<p style="text-align: center; font-size: 1.29rem;">
  <span>Background Positon!</span>
</p>


`background-position` 支持百分比属性。当使用百分比属性的时候，就是将背景图片与元素在百分比指定的位置重合。比如说 `20% 40%`，在横向上背景图片的 20% 与元素的 20% 对齐，竖向上背景图片的 40% 与元素的 40% 对齐。

这就相当于指定了一个焦点。把焦点放到主体上，那么无论元素怎么变化，主体都会有较好的显示效果。而且这些计算都是浏览器来干的！

现在唯一麻烦的地方就是要指定焦点。我继续找了一些资料，JavaScript 上也有人实现一些 Content Aware 的算法，比如这个 [Smartcrop.js](https://github.com/jwagner/smartcrop.js/)。但是由于我没有批量的图片需要调整，就没有折腾去研究这个，而是研究怎么方便手动选择。

后来就做了这个所见即所得工具，<http://www.crimx.com/portrait-crop/>，除了标记焦点以外还可以进行竖向的裁剪，节省空间。

移动焦点的时候右边会实时计算 `background-position`，包括了横向和竖向的结果。不需要裁剪的话只用横向的就行。

右下还提供了 json 格式。我的博客就是为所有封面保存了一个 json 文件，在 hexo 中设钩子去读再作为 inline css 写入。每次添加的时候复制粘贴就可以。

裁剪框是基于 [cropperjs](https://github.com/fengyuanchen/cropperjs) 实现的，添加了个焦点。实现的时候还顺便修了 bug 提交了个 pr 给原作者哈哈。

**2016年12月31日按**：他今天才 merge …… :sweat_smile: 都忘记有提过这个 pr 了

