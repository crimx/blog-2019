---
title: prototype 与 __proto__ 的爱恨情仇
tags:
  - Recommended
  - Understanding JavaScript
  - 闲读规范
quote:
  content: 'If you are truly innovating, you don''t have a prototype you can refer to.'
  author: Jonathan Ive
  source: ''
date: 2017-08-12T12:00:00.000Z
layout: blog-post
description: ''
---

经历了上次的[《JavaScript This 的六道坎》](/2016/05/12/understanding-this/) 发现编故事有点上瘾，而且记忆效果也不错哈哈，今天继续唠叨一下 prototype 与 `__proto__` 的爱恨情仇。

先理解两者的一个本质区别，`prototype` 是函数独有的，是人为设定的；`__proto__` 是所有对象都有的，是继承的。

然后来看一个两个神的故事：

首先在 ECMAScript 星球，万物起源于 the Engineers，哦不，是一个叫 [%ObjectPrototype%](http://www.ecma-international.org/ecma-262/7.0/#sec-properties-of-the-object-prototype-object) 的 intrinsic object，也就是 **Object.prototype**。它是万物的尽头，继承于虚无， `Object.prototype.__proto__` 为 `null`。

![objectprototype][objectprototype]

接着由其衍生出第二神，另外一个 intrinsic object [%FunctionPrototype%](http://www.ecma-international.org/ecma-262/7.0/#sec-properties-of-the-function-prototype-object)，也就是 **Function.prototype**。于是有

```javascript
Function.prototype.__proto__ === Object.prototype // true
```

Function.prototype 本身也是个函数对象，这是为了[兼容 ES5](http://www.ecma-international.org/ecma-262/7.0/#sec-properties-of-the-function-prototype-object)。也估计是让人引起误解的源头。但两者还是不同的，这是个特殊的函数对象，它忽略参数总是返回 undefined，且没有 [[Construct]] 内部方法。

搞清楚了这两个 Ancient Gods 接下来就很容易了，相信也听过“函数在 JS 里是一等公民”这类的说法，其实是因为它们都是 %FunctionPrototype% 的子民（这里不用 Function.prototype 是为了避免混淆，记得 prototype 是人为设定的），包括 `Function` 本身。

所以你可以看到，`Object`、`Function`、`String`、`Number`、`Boolean` 等等等的 `__proto__` 都是 `Function.prototype`。

所以接下来的问题就更容易了，比如 `Object instanceof Object`。前面我们知道 `Object.__proto__` 是 %FunctionPrototype%，而它的 `__proto__` 是万物之源 %ObjectPrototype%，恰好也是 `Object.prototype`，所以就是 `true` 啦。

其它的也是同理，举一反三很简单了。


[objectprototype]: /img/post/object-prototype.jpg

