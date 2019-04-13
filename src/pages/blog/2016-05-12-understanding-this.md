---
layout: blog-post
date: 2016-05-12T12:00:00.000Z
title: JavaScript this 的六道坎
description: 鉴于this风骚的运作方式，对this的理解是永不过时的话题，本文试图通过将其大卸六块来钉住这个磨人的妖精。
quote:
  author: Dr. Watson
  content: '"This is indeed a mystery," I remarked. "What do you imagine that it means?"'
  source: A Scandal In Bohemia
tags:
  - Understanding JavaScript
  - This
  - Recommended
---

鉴于`this`风骚的运作方式，对`this`的理解是永不过时的话题，本文试图通过将其大卸六块来钉住这个磨人的妖精。

# 首先

> `this` is all about context.

`this`说白了就是找大佬，找拥有当前上下文（context）的对象（context object）。

大佬可以分为六层，层数越高权力越大，`this`只会认最大的。

## 第一层：世界尽头

权力最小的大佬是作为备胎的存在，在普通情况下就是全局，浏览器里就是`window`；在`use strict`的情况下就是`undefined`。

```javascript
function showThis () {
  console.log(this)
}

function showStrictThis () {
  'use strict'
  console.log(this)
}

showThis() // window
showStrictThis() // undefined
```
## 第二层：点石成金

第二层大佬说白了就是找这个函数前面的点`.`。

如果用到`this`的那个函数是属于某个 context object 的，那么这个 context object 绑定到`this`。

比如下面的例子，`boss`是`returnThis`的 context object ，或者说`returnThis`属于`boss`。

```javascript
var boss = {
  name: 'boss',
  returnThis () {
    return this
  }
}

boss.returnThis() === boss // true
```

下面这个例子就要小心点咯，能想出答案么？

```javascript
var boss1 = {
  name: 'boss1',
  returnThis () {
    return this
  }
}

var boss2 = {
  name: 'boss2',
  returnThis () {
    return boss1.returnThis()
  }
}

var boss3 = {
  name: 'boss3',
  returnThis () {
    var returnThis = boss1.returnThis
    return returnThis()
  }
}

boss1.returnThis() // boss1
boss2.returnThis() // ?
boss3.returnThis() // ?
```

答案是`boss1`和`window`哦，猜对了吗。

只要看使用`this`的那个函数。

在`boss2.returnThis`里，使用`this`的函数是`boss1.returnThis`，所以`this`绑定到`boss1`；

在`boss3.returnThis`里，使用`this`的函数是`returnThis`，所以`this`绑定到备胎。

要想把`this`绑定到`boss2`怎么做呢？

```javascript
var boss1 = {
  name: 'boss1',
  returnThis () {
    return this
  }
}

var boss2 = {
  name: 'boss2',
  returnThis: boss1.returnThis
}

boss2.returnThis() //boss2
```

没错，只要让使用`this`的函数是属于`boss2`就行。

## 第三层：指腹为婚

第三层大佬是`Object.prototype.call`和`Object.prototype.apply`，它们可以通过参数指定`this`。（注意`this`是不可以直接赋值的哦，`this = 2`会报`ReferenceError`。）

```javascript
function returnThis () {
  return this
}

var boss1 = { name: 'boss1' }

returnThis() // window
returnThis.call(boss1) // boss1
returnThis.apply(boss1) // boss1
```

## 第四层：海誓山盟

第四层大佬是`Object.prototype.bind`，他不但通过一个新函数来提供永久的绑定，还会覆盖第三层大佬的命令。

```javascript
function returnThis () {
  return this
}

var boss1 = { name: 'boss1'}

var boss1returnThis = returnThis.bind(boss1)

boss1returnThis() // boss1

var boss2 = { name: 'boss2' }
boss1returnThis.call(boss2) // still boss1
```

## 第五层：内有乾坤

一个比较容易忽略的会绑定`this`的地方就是`new`。当我们`new`一个函数时，就会自动把`this`绑定在新对象上，然后再调用这个函数。它会覆盖`bind`的绑定。

```javascript
function showThis () {
  console.log(this)
}

showThis() // window
new showThis() // showThis

var boss1 = { name: 'boss1' }
showThis.call(boss1) // boss1
new showThis.call(boss1) // TypeError

var boss1showThis = showThis.bind(boss1)
boss1showThis() // boss1
new boss1showThis() // showThis
```

## 第六层：军令如山

最后一个法力无边的大佬就是 ES2015 的箭头函数。箭头函数里的`this`不再妖艳，被永远封印到当前词法作用域之中，称作 Lexical this ，在代码运行前就可以确定。没有其他大佬可以覆盖。

这样的好处就是方便让回调函数的`this`使用当前的作用域，不怕引起混淆。

所以对于箭头函数，只要看它在哪里创建的就行。

如果对 V8 实现的词法作用域感兴趣可以看看[这里](http://blog.crimx.com/2015/03/29/javascript-hoist-under-the-hood/)。

```javascript
function callback (cb) {
  cb()
}

callback(() => { console.log(this) }) // window

var boss1 = {
  name: 'boss1',
  callback: callback,
  callback2 () {
    callback(() => { console.log(this) })
  }
}

boss1.callback(() => { console.log(this) }) // still window
boss1.callback2(() => { console.log(this) }) // boss1
```

下面这种奇葩的使用方式就需要注意：

```javascript
var returnThis = () => this

returnThis() // window
new returnThis() // TypeError

var boss1 = {
  name: 'boss1',
  returnThis () {
    var func = () => this
    return func()
  }
}

returnThis.call(boss1) // still window

var boss1returnThis = returnThis.bind(boss1)
boss1returnThis() // still window

boss1.returnThis() // boss1

var boss2 = {
  name: 'boss2',
  returnThis: boss1.returnThis
}

boss2.returnThis() // boss2
```
如果你不知道最后为什么会是 boss2，继续理解“对于箭头函数，只要看它在哪里创建”这句话。

# 参考

1. Mozilla Developer Network
1. Kyle Simpson, *this & object prototypes*
1. Axel Rauschmayer, *Speaking JavaScript*

[完]

