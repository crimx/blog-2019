---
title: 理解 Anki 基础概念
tags:
  - Anki
  - GTD
  - Time Management
  - Todo List
  - Recommended
quote:
  content: ''
  author: ''
  source: ''
date: 2016-03-20T12:00:00.000Z
layout: blog-post
description: ''
---

在尝试了 Anki 、 SuperMemo 、 Quizlet 和 Memrise 之后，最后选用了 Anki。

Anki 是一个卡片记忆系统，基于 [SuperMemo][supermemo] 老版的 SM2 算法，在实用性和有效性方面做了很好的平衡。简洁的界面，全平台免费同步，用 HTML 和 CSS 做模板，导入导出非常灵活，很适合程序员使用。


Anki 跟其它几个系统一样，都引入了自身的一套理念，不理解的话用起来就会无从下手。看了[官方的文档][anki_doc]后，解决了很多疑惑和误解，并试图在本文用自己的理解总结一遍。**但这篇文章不是操作说明书**，如何操作这个网上已经有很多中文资料和视频，就不重复劳动了。


可以把 Anki 的使用分成四个步骤：

1. 得到问题
1. 录入数据
1. 使用卡片
1. 循环记忆

主要需要理解前两个。

## 得到问题

把想要记忆的材料整理出一道道“问题-答案”对，参照 [SuperMemo 的 20 条规则][supermemo_rules]。

这些规则核心的概念是

[1、先理解再记忆](https://www.supermemo.com/en/articles/20rules#Do not learn if you do not understand)。

[4、最小信息原则](https://www.supermemo.com/en/articles/20rules#minimum information principle)。这个规则与 [9、避免使用集合](https://www.supermemo.com/en/articles/20rules#Avoid sets)和 [10、避免使用枚举](https://www.supermemo.com/en/articles/20rules#Enumerations)都是一个道理：保证每次的答案都是固定的，不一定是一模一样，但必须是有固定的顺序，且尽可能的细化，这样可以减少无必要的记忆负担，提高重复记忆的效果。

[6、使用图像](https://www.supermemo.com/en/articles/20rules#Use imagery)、 [7、使用思维导图](https://www.supermemo.com/en/articles/20rules#mnemonic techniques)和 [14、私人化定制例子](https://www.supermemo.com/en/articles/20rules#Personalize and provide examples) 提到了耳熟能详的右脑记忆和联想记忆。

[5、填空题](https://www.supermemo.com/en/articles/20rules#Cloze deletion) 以及变种 [8、图像填空题](https://www.supermemo.com/en/articles/20rules#Graphic deletion)提到了填空题的好处。Anki 有自己的一套方式录入填空题，后面会提到。


## 录入数据

录入数据最常用的方法就是在软件的上一条条的填入，但 Anki 提供了更方便的导入方式，结合 HTML 可以更灵活地控制显示方式。但必须注意，导入功能不是为了方便直接使用别人分享的数据；根据先理解再记忆的原则，最好还是手动用文本记录好，然后利用文本编辑器或者编写脚本批量添加样式，最后导入到 Anki 里。

在录入之前需要理解 Anki 数据的一些概念：

Anki 一个最大的亮点就是“用户负责录入数据，Anki 负责生成卡片”。这也是我一开始没有注意并误解了的地方。Anki 将数据和卡片分开提供了巨大的灵活性，可以用一组数据产生不同的卡片。

### Cards 和 Decks

[Cards](http://ankisrs.net/docs/manual.html#cards) 就是卡片，每张卡片包含了正面和背面，一般正面会放问题，背面放问题和答案，但都是可以改的，很灵活。

[Decks](http://ankisrs.net/docs/manual.html#decks) 就是牌组，卡片放牌组里面，牌组也可以放牌组里面，方便分类整理，用 `::` 分隔。

### Notes 和 Fields
Anki 中的数据主要分为 [Notes（记录） 和 Fields（字段）](http://ankisrs.net/docs/manual.html#notes-&-fields)。

如果把数据看成表格，字段就是表格的表头，代表了都有什么类型的数据，一条记录就是一组数据，包含了每种字段的一个取值。

使用文本导入时，文本里的一行就是一条记录，每条记录里面的各个字段用分隔符分隔。分隔符可以是逗号、分号或 tab ，Anki 会以第一条记录判断用什么分隔符，并判断有多少个字段。而字段的名称最后在要导入的那个牌组上面设置。

比如记忆英文，可以有三个字段：英文、中文、例句，文本中的一行记录就可以是：`Apple; 苹果; I love apple.` 。这里就代表了：

```
英文: Apple
中文: 苹果
例句：I love apple.
```

这样的好处就是可以非常灵活地生成卡片。比如可以将英文作为卡片正面，将中文和例句放在背面；也可以将中文放在正面，英文和例句放在背面。非常的方便。

得到了数据以后，就可以对卡片的样式和类型进行调整。

### Card Types

可以将一套卡片统一成一个类型，然后对这个类型套用一个模板去显示。


### Note Types

卡片的类型也是可以很方便修改，[这个视频](https://www.youtube.com/watch?v=5tYObQ3ocrw)除了介绍添加答案输入，后面还提到了如何改成填空题

<iframe style="width: 100%; height: 540px;" src="https://www.youtube.com/embed/5tYObQ3ocrw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

理解了这些基本概念就可以开始使用 Anki 了，遇到了其它问题可以查[文档][anki_doc]、[视频](http://ankisrs.net/docs/manual.html#_intro_videos)、[支持][anki_support]和[中文论坛][anki_china]。



[supermemo]: https://www.supermemo.com
[supermemo_rules]: https://www.supermemo.com/en/articles/20rules
[anki_doc]: http://ankisrs.net/docs/manual.html
[anki_china]: http://bbs.ankichina.net/
[anki_support]: https://anki.tenderapp.com/discussions

