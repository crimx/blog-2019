---
title: 不侧漏精通 Node.js
tags:
  - Translation
  - JavaScript
  - Node
quote:
  content: One day your life will flash before your eyes. Make sure it's worth watching
  author: Gerard Way
  source: ''
date: 2014-05-22T12:00:00.000Z
layout: blog-post
description: ''
---

原文：[Learn Node.js Completely and with Confidence](http://javascriptissexy.com/learn-node-js-completely-and-with-confidence/)（2013-2-4）

**学习时长**：约2周  
**学习前提**：JavaScript 知识掌握 5/10

要成为 JavaScript 开发者现在是最好的时机了，而且会越来越好。主要是因为 HTML5 的来临， Flash 的逝去，移动设备的普及，以及最重要的 Node.js —— 开发者终于可以在服务器端使用 JavaScrpit 了。

Node.js 本身是革命性的，它已经非常接近未来的现代 web 开发 —— 纯 JavaScript 作为服务器端语言。我将为你提供一条详细的 Node.js 学习路线，对我来说很有效（我用 Node.js 开发的一个[电子商务 web app](http://buildandprice.superfocus.com/)），我相信对你也适用。你将完全学会 Node.js，要自信地走完这个课程，因为2～3个星期后你将可以在短时间内建立一个超快，实时的 web 应用了。

为什么学习 Node.js
--------

JavaScript 已经成为当今的 web 语言，而且毫无疑问未来的几年都会保持这个地位，因为还没有出现 JavaScript 的替代品。ECMAScript 组织正在全速推进 JavaScript 语言。而且 Node.js 的出现使到开发者可以在服务器端使用纯 JavaScript 开发现代 web 应用。


完全了解 Node.js 之后，你将可以开发实时，快速，可扩展，数据驱动的 web 应用；你将有必备的知识去快速适应任何新型，前沿的 JavaScript 框架，如 Derby.js 和 Meter.js。

值得注意的是，几年前我们需要知道一个真正的服务器端语言（比如PHP，Rails，Java，Python 或者 Perl）去开发可扩展，动态的，数据库驱动的web应用，**而现在只用JavaScript就可以实现了**。


不要这样学习 Node.js
----------

1. 现在已有数不清的 Node.js 教程，但大部分都不能用来精通 Node.js，更不用说去判断哪个教程好了。大部分教程都不能满足你完全学会 Node.js 所需要的深度和结构。

   一年前我学习 Node.js 的时候看了一大堆 Node.js 教程，在一些教程中浪费了不少时间。有的教程让人非常失望（我一点实质性的东西都没学到），白折腾让我很沮丧。我愿意在这里点出那些没用的教程或者贴出它们网址，但我只想说，不要在那些教程上浪费你的时间了。

   我深信**还有很多优秀的 Node.js 教程**，但你需要移开一堆普通教程才能找到最好的。这样学习 Node.js 效率不高。我这样走过来了，所以我希望这个教程可以帮到你，让你不用浪费我曾浪费的时间。

2. 不要在亚马逊上根据评论去挑一本 Node.js 书。即便这是挑书的常用方法（我的书就是这么买的），但因为 Node.js 还是一个新的平台，大部分的书都没有足够大的评论样本让你来评估它的实用性和价值。简而言之就是这些评论还不够好。


   如过在亚马逊上搜索“Node.js”，你会发现至少有21本 Node.js 的书。虽然我只读过当中的4本（最好的4本），我发现坏书存在一个模式：作者似乎对 Node.js 体系结构和平台都没有一个深入广泛的理解，而书本仿佛就是一堆普通教程的集合体。我读的4本 Node.js 书中，有两本不错，但我打算只推荐其中一本。这两本书是《[Node.js高级编程](http://www.amazon.cn/Node-js%E9%AB%98%E7%BA%A7%E7%BC%96%E7%A8%8B-%E7%89%B9%E8%B0%A2%E6%8B%89/dp/B00H7V7O90/)》（Professional Node.js: Building JavaScript Based Scalable Software），作者 Pedro Teixera；和《[了不起的Node.js: 将JavaScript进行到底](http://www.amazon.cn/%E4%BA%86%E4%B8%8D%E8%B5%B7%E7%9A%84Node-js-%E5%B0%86JavaScript%E8%BF%9B%E8%A1%8C%E5%88%B0%E5%BA%95-%E5%8A%B3%E5%A5%87/dp/B00GI7EO6U/)》（Smashing Node.js: JavaScript Everywhere），作者 Guillermo Rauch。我推荐前者，但是从后者中你也可以学到不少，所以两本都买吧，如果你非常重视 Node.js 开发的话。

重要说明
----------

> ###书评
> 
> 在我写这篇文章的时候，《Node.js高级编程》在亚马逊上只有两个评论。一个评价很好（5颗星），而另一个是差评 —— 你最好自己看一下。这就是那个差评：
> 
> > 我不知道这本书写得好还是坏，因为它的排版太差了，有很多地方根本看不了。
> 
> 显然，这个评论者没有看过这本书而且他的评论都是关于排版的问题，我倒没发现。我会给这本书5颗星，因为这是目前我读过最好的 Node.js 书。但我不是从亚马逊买的，所以我没有在那里作评论。
> 
> 而且声明一下我跟本文中推荐的两个作者都不认识。
> 

资源
-------

1. 《[Node入门](http://www.nodebeginner.org/index-zh-cn.html)》（[The Node Beginner Book](http://www.nodebeginner.org/)），作者Manuel Kiessling。这本书很薄，但真的是 Node.js 教程。这本书跟另外一本书$9.99捆绑销售，《Hands-on Node.js》，作者是前面提到的 Pedro Teixeira。但有趣的是，我并不觉得捆绑的这本书好用，所以你不需要它，我们也不会用它来学习 Node.js。但既然买两本书才$9.99，就一起买吧。

2. 《Node.js高级编程》，作者 Pedro Teixera  
   - [中文版](http://www.amazon.cn/Node-js%E9%AB%98%E7%BA%A7%E7%BC%96%E7%A8%8B-%E7%89%B9%E8%B0%A2%E6%8B%89/dp/B00H7V7O90/)  
   - [英文版](http://www.amazon.com/gp/product/1118185463/)



精通 Node.js 路线
--------

1. 如果你 JavaScript 已经学得非常好，敲起 JavaScript 代码时觉得自己屌炸天了，请直接跳到第2点。

   如果你的 JavaScript 知识不足以让你用原生 JavaScript 开发一个完整的交互式问答应用。你应该[正确学习 JavaScript](/2014/05/15/how-to-learn-javascript-properly)

   如果你的 JavaScript 基础还行，只是想温习一下，可以按顺序读一读下面三篇文章：

   - [JavaScript 对象详解](http://javascriptissexy.com/javascript-objects-in-detail/)
   - [JavaScript 变量作用域与提升解释](http://javascriptissexy.com/javascript-variable-scope-and-hoisting-explained/)
   - （必读）[轻松掌握 JavaScript 闭包](http://javascriptissexy.com/understand-javascript-closures-with-ease/)

2. 阅读《Node.js高级编程》第1章，按照指示在你的电脑上配置好 Node.js。

3. 阅读《Node入门》整本，这本书很小的，基本上就是个教程。它会给你进行简单的介绍并让你对 Node.js 开发环境涉及的东西有一个基本的了解。在阅读《Node.js高级编程》其它部分之前读读这个，作为一个好的开始。

4. 阅读《Node.js高级编程》第2章。

5. 阅读链接 [CommonJS](http://pages.citebite.com/i9e9e4d1yxip) 部分，不用读完[整篇文章](http://addyosmani.com/writing-modular-js/)。

6. 阅读《Node.js高级编程》第3～6章。

7. 阅读《Node.js高级编程》第7～15章。

8. 可选：如果你买了《了不起的Node.js》，阅读第8～9章。

9. 阅读《Node.js高级编程》第17～22章。

10. 读完《Node.js高级编程》。

11. 现在你已经有足够的 Node.js 知识去建立一个现代 web 应用的后端了，你最好学习 Backbone.js 来迅速开发 web 应用前端。只会 Node.js 的话你只能算是 Node.js 开发者，但学会 Backbone.js 和 Node.js，你就是一个屌炸天的 JavaScript 开发者，拥有建立各种 web 应用的技能和工具了。去[精通backbone.js](http://javascriptissexy.com/learn-backbone-js-completely/)。

12. 精通了 Node.js 与 Backbone.js 后你已经可以开发任意类型的 web 应用了。你现在就可以开始开发点什么了，如果够大胆的话。

    但在你的冒险开始之前，先将下面链接的 NodeApp web 应用建出来；这个练习为你提供了一个现实使用的 Node.js/Backbone.js web 应用开发：<http://dailyjs.com/web-app.html>

13. **进阶学习**：你还需要学习两个技术来帮助巩固你的 Node.js 和 Backbone.js 技能：Handlebars.js 模板与 MongoDB 数据库。事实上，你在 Backbone.js 中就接触过 Underscore.js 模板，在上面第10步时就已学了一点 MongoDB 知识。

    但你还要学习 Handlebars 因为它比 Underscore.js 模板引擎的鲁棒性更好，功能更丰富。读读我的[ Handlebars.js 教程](http://javascriptissexy.com/handlebars-js-tutorial-learn-everything-about-handlebars-js-javascript-templating/)。

    你还要学会用 MongoDB 建立复杂的应用。我将会再写一篇关于 MongoDB 的博文。


祝你好运并且保持专注直到你完成整个课程：**永不放弃**。而且注意不要用超过3周的时间完成这个课程。

