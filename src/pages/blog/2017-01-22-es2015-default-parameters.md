---
title: 深入 ES2015 默认参数
tags:
  - TDZ
  - Understanding JavaScript
  - Function
  - Parameters
  - Arguments
  - Recommended
quote:
  content: >-
    Life can be much broader once you discover one simple fact: Everything
    around you that you call life was made up by people that were no smarter
    than you.
  author: Steve Jobs
  source: ''
date: 2017-01-22T12:00:00.000Z
layout: blog-post
description: ''
---

ES2015 为函数加入了方便的默认参数语法。

```javascript
function foo (x = 1) {
  // ...
}
```

很方便是吧，但每件新东西总有坑。


## TDZ

```javascript
var x = 1

function foo (x = x) {
  // ...
}

foo() // ReferenceError: x is not defined
```

这个是最早见的坑，已经有不少文章指出了是个 TDZ (Temporal Dead Zone) 的问题。我找了大量资料，大部分文章基本是参考自[这篇](http://dmitrysoshnikov.com/ecmascript/es6-notes-default-values-of-parameters/comment-page-1/#tdz-temporal-dead-zone-for-parameters)，它指出了 TDZ 但没有说明为什么。唯有[这篇文章](http://code.wileam.com/default-value-n-params-env/)引用了规范，但论据和结论牛头对了马嘴。

本着强迫症的精神，亲自去啃了一遍规范，现在把思路整理出来。其它关于 JavaScript 的文章可以看这里<https://blog.crimx.com/tags/Understanding-JavaScript/>。

### TDZ 基本

先简单说一下什么是 TDZ。一般最开始见到这个词都是跟 `let` 和 `const` 挂钩。

两者不会像 `var` 一样抬升，但它们又会占领了所在的作用域的*整个部分*，于是这个作用域在 `let` 和 `const` 声明之前的部分就会有一个*死区*，AKA 占着茅坑不拉屎。

```javascript
var x = 1

{
  let x = 2 // 这是 OK 的，这个作用域只有一个 x
}
```

```javascript
var x = 1

{
  x = 4 // ReferenceError 茅坑已被占
  let x = 2
}
```

```javascript
var x = 1

let x = 3 // SyntaxError 不能重复声明
```

对作用域不太熟悉的可以参考一下我以前的一些[**笔记**](https://blog.crimx.com/tags/Scope/)。

### ~~默认参数 TDZ~~

~~在规范 [9.2.12 FunctionDeclarationInstantiation(func, argumentsList)](http://www.ecma-international.org/ecma-262/6.0/#sec-functiondeclarationinstantiation) 的步骤 27.c.i.2 可以看到：~~

> ~~Let status be envRec.CreateMutableBinding(n).~~

~~这是没有默认参数的情况，也就是 ES5 的做法。这个 mutable binding 顾名思义，就是 `var` 对应的绑定。~~

~~在步骤 28.f.i.5.a 就说明了有默认参数怎么算：~~

> ~~Let initialValue be envRec.GetBindingValue(n, false).~~

~~这个 [GetBindingValue](http://www.ecma-international.org/ecma-262/6.0/#sec-module-environment-records-getbindingvalue-n-s) 就是占茅坑的怂恿者：~~

> ~~The concrete Environment Record method GetBindingValue for module Environment Records returns the value of its bound identifier whose name is the value of the argument N. However, if the binding is an indirect binding the value of the target binding is returned. *If the binding exists but is uninitialized a ReferenceError is thrown*, regardless of the value of S.~~

~~所以带默认参数的时候才会有 TDZ 。~~

### x = x

参数的处理在规范 [9.2.12 FunctionDeclarationInstantiation(func, argumentsList)](http://www.ecma-international.org/ecma-262/6.0/#sec-functiondeclarationinstantiation) 的 23、24 和 25，将参数当做数组解构处理。

在 [IteratorBindingInitialization](http://www.ecma-international.org/ecma-262/6.0/#sec-destructuring-binding-patterns-runtime-semantics-iteratorbindinginitialization) 中，参数按照各种情况处理。 `x = x` 属于 SingleNameBinding ，在 6.a 和 6.b 中 GetValue 会试图对右 x 取值（Initializer），从而触发 Reference Error 。

> a. Let defaultValue be the result of evaluating Initializer.
> b. Let v be [GetValue](http://www.ecma-international.org/ecma-262/6.0/#sec-getvalue)(defaultValue).

就像 `let x = x` 一样，先遇到左边的 `x` ，开始占茅坑。然后遇到等号，因为等号是右往左运算的，所以就继续看右边，发现了 `x` 。这是一个读取的行为，但这个作用域的 `x` 茅坑已经被左边的 `x` 占了，而且伦家还没完事呢。所以右边的 `x` 就踩了死区，引发 Reference Error 。

## 中间作用域

眼光锐利的朋友很可能发现了，我在前一步提到了作用域被占了，那么这个作用域是什么作用域？

这是一个中间作用域，介于函数所在的作用域和函数内部的作用域。

[9.2.12 FunctionDeclarationInstantiation(func, argumentsList)](http://www.ecma-international.org/ecma-262/6.0/#sec-functiondeclarationinstantiation)

> **NOTE 1** When an execution context is established for evaluating an ECMAScript function a new function Environment Record is created and bindings for each formal parameter are instantiated in that Environment Record. Each declaration in the function body is also instantiated. If the function’s formal parameters do not include any default value initializers then the body declarations are instantiated in the same Environment Record as the parameters. *If default value parameter initializers exist, a second Environment Record is created for the body declarations.* Formal parameters and functions are initialized as part of FunctionDeclarationInstantiation. All other bindings are initialized during evaluation of the function body.

### 为什么

为什么需要夹个新作用域？这主要是为了防止默认参数里面的表达式会被函数内部的变量污染。

```javascript
var x = true

function foo (y = () => x) {
  var x = false
  return y()
}

foo() // true
```

如果默认参数没有中间作用域，函数 `() => x` 就会跟 `var x = false` 共用一个作用域，`x` 就会被 shadow 掉，`foo()` 就会返回 `false` ，函数里面的变量泄露了，明显违背默认参数的本意。

这个 bug 可以在 Firefox 51 之前的版本观察到（目前稳定版是 50.1.0）。

## 解构参数

解构 Destructured 也是相当好用的新家庭成员，还可以跟默认参数结合使用。

```javascript
function foo ({x = 1, y}) {
  return [x, y]
}

foo({ y: 5 }) // [1, 5]
```

```javascript
let [x = 1, y] = []   // x = 1, y = undefined
;[x = 1, y] = [3, 5]  // x = 3, y = 5
;({text: x = 1} = {}) // x = 1
;({text: x = 1} = { text: 2 }) // x = 2
```

这里的 `{}` 必须用括号括起来让它解释为表达式，不然会成为块声明。

