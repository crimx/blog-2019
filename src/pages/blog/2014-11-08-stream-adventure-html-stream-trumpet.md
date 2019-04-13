---
title: Stream-Adventure HTML-Stream 中对 trumpet 的理解
tags:
  - Node
  - JavaScript
  - Stream
quote:
  content: >-
    A programmer had a problem. He thought "I know, I'll create an API". Now
    everybody has a problem.
  author: ''
  source: ''
date: 2014-11-08T12:00:00.000Z
layout: blog-post
description: ''
---

玩了 John Resig 提到的 Stream-Adventure ，在 HTML-Stream 关卡中，根据题目提示写出了代码

```javascript
var through = require('through')
  , trumpet = require('trumpet')

function upper(buf) {
  this.queue(buf.toString().toUpperCase())
}

var tr = trumpet()
process.stdin.pipe(tr).pipe(process.stdout)

var stream = tr.select('.loud').createStream()
stream.pipe(through(upper)).pipe(stream)
```

虽然写出来了，但其实我还是混淆着 tr 和 steam 流。

最后在 nodeschool 的[讨论](https://github.com/nodeschool/discussions/issues/346)中得到了比较好启发。

试着整理一下自己的表述：

这里很明显是有两条流 tr 和 steam ，之前混淆他们的关系，所以一直不能理解。

tr 是主流，输入流入 tr 最后流到输出

![main flow](/img/post/stream/main-flow.jpg)

stream 流是在 tr 内部发生的，tr 会尝试找到 `loud` 类的内容，然后创建流 stream ，流向 through 改变大小写，最后流回 stream 覆盖原来的内容。

![stream flow](/img/post/stream/stream-flow.jpg)

