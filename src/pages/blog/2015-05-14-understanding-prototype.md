---
title: 理解 Prototype
tags:
  - Understanding JavaScript
  - Prototype
  - Recommended
quote:
  content: >-
    I'm not Fred, I'm George," said the boy. "Honestly, woman, call yourself our
    mother? Can't you tell I'm George?
  author: Fred Weasley
  source: ''
date: 2015-05-14T12:00:00.000Z
layout: blog-post
description: ''
---

Prototype 初看很好理解，实际上很容易混淆。而且因为不影响平时使用，一直没用动力去了解，长时间都是在一知半解的状态。

## 混淆

混淆主要是因为 `[[prototype]]` 和 `prototype` 名字长得太像。看回以前总结的模拟继承[笔记](/2014/07/27/javascript-inheritance)，基本就是照搬书，压根没搞清楚。

首先是 `[[prototype]]`， **每个对象**都会有 `[[prototype]]`属性，它的本质就是指向另外一个对象。

然后是 `prototype`。`prototype` 是 `function` 对象特有的属性。每个 `function` 都有一个 `prototype`（同时也会有 `[[prototype]]`）。`prototype` 里有个叫 `constructor` 的属性，一般情况下就是指回这个 `function`。

## 获取

ES5 提供 `Object.getPrototypeOf()` 方法来获取一个对象的 `[[prototype]]`；也可以访问 `Object.prototype.__proto__`，而且这个很早就存在了，但在 ES2015 才标准化。

## 创建

### New

当 `new` 一个 `function` 的时候，返回的那个新对象里的 `[[prototype]]` 就会指向这个 `function` 的 `prototype`。

```javascript
function Person () {
  // ...
}

var p = new Person()

Object.getPrototypeOf(p) === Person.prototype // true

```

### Object.create()

ES5 提供了 `Object.create()` 方法来创建对象，它的第一个参数就是 `prototype` ，创建的新对象的 `[[prototype]]` 会指向这个参数。

```javascript
var obj = {}

Object.getPrototypeOf(Object.create(obj)) === obj // true

```

在《JavaScript高级程序设计》提到了这个方法的 polyfill ，当然，当时也是糊里糊涂地跟着实现了一遍，不怎么明白。

这里需要理解 `Object.create()` 干了什么。它返回了一个对象，这个对象可以指定 `[[prototype]]`。

在 ES2015 之前只能通过 `new` 来赋予一个对象 `[[prototype]]`。

所以这个 polyfill 的核心思想就是利用一个空函数来改梁换柱。下面是简化的代码：

```javascript
function create (proto/* , 第二个参数 */) {
  // ...
  var Fn = function () {}
  Fn.prototype = proto || {}
  var obj = new Fn()
  // ...
  return obj
}

var obj = {}

Object.getPrototypeOf(create(obj)) === obj // true

```

### Object.setPrototypeOf()

ES2015 增加了 `Object.setPrototypeOf()` 来设定对象的 `[[prototype]]`，但是尽量不要用，可能会有[性能问题](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)。

## 判断

`instanceof` 和 `isPrototypeOf()` 都可以判断，但两者不一样。

`object instanceof constructor` 沿着 `constructor.prototype` 来搜。也就是说 `constructor` 只能是函数。

`prototypeObj.isPrototypeOf(object)` 是基于对象，不一定是函数。

```javascript
function Father () {}

var f = new Father()

f instanceof Father // true
f instanceof Father.prototype // Error
Father.prototype.isPrototypeOf(f) // true
Father.isPrototypeOf(f) // false

function Child () {}
Child.prototype = f

var c = new Child()
c instanceof Father // true
c instanceof f // Error
f.isPrototypeOf(c) // true
Father.isPrototypeOf(c) // fasle
Father.prototype.isPrototypeOf(f) // true

```

## 继承

`Child.prototype = Father.prototype` 不久好了么，收工。

这里的问题看出来了么。这种方式最大的问题是当在 `Child` 的 `prototype` 上增加一些属性的时候，会影响到 `Father` 去了，因为它们是同个对象。

那好吧，`Child.prototype = new Father()` 搞定。

这里的问题就更隐蔽一些。首先，我们只想要 `prototype`，这种方式会返回 `Father` 的一个对象，可能会增加一些没必要的属性；其次，`Father` 本质是一个函数，如果在 `Father` 里如果做了其它一些操作，比如改变了闭包或者全局变量什么的，`new` 的时候就会执行，有时候我们不希望这样。

所以，更好的方法就是用 `Object.create()` 创建一个 `[[prototype]]` 指向父类 `prototype` 的对象，然后再手动指定 `constructor`。

```javascript
function Father () {}
Father.prototype.isHandsome = function () {
  return true
}

function Child () {}

Child.prototype = Object.create(Father.prototype)
Child.prototype.constructor = Child

var c = new Child()

c.isHandsome() // true

```

[完]

