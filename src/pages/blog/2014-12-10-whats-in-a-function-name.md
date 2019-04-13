---
title: JavaScript 函数名里面有什么？
tags:
  - Understanding JavaScript
  - Translation
  - Function
  - 闲读规范
quote:
  content: >-
    Do not go gentle into that good night but rage, rage against the dying of
    the light.
  author: Dylan Thomas
  source: ''
date: 2014-12-10T12:00:00.000Z
layout: blog-post
description: ''
---

原文：[What's in a Function Name?](http://bocoup.com/weblog/whats-in-a-function-name/)（2014-11-25）

每次为 JSHint 提交代码我都会学到一些 JavaScript 的新东西。最近的一次知识之旅中我接触到了函数对象的 `name` 属性。

JSHint 有一个很有意思但很少人知道的功能：代码分析报告。当以编程方式使用时，JSHint 会返回一个对象，描述已分析代码的数据。它包括（但不限于）代码中函数对象的信息：

```javascript
jshint('function myFn() {}');
console.log(jshint.data().functions);
/*
  [{
    name: 'myFn',
    param: undefined,
    line: 1,
    character: 15,
    last: 1,
    lastcharacter: 19,
    metrics: { complexity: 1, parameters: 0, statements: 0 }
  }]
 */
```

JSHint 网站本身实时生成的“Metrics”报告是这个功能最突出的使用。比如：

> Metrics
> 
> - There is only one function in this file.
> - It takes no arguments.
> - This function is empty.
> - Cyclomatic complexity number for this function is 1.

我得知这个功能在与一个不相关的 bug 一起工作时会出错。更困扰我的是，我发现自己以前对 JavaScript 函数名的理解完全是错误的。对我的三观质疑了几个小时（“名字意味着什么？”、“我是真实存在的么？”....）之后，我决定开始研究这个 issue 并一劳永逸地学习正确的理解。下面是我所学到的东西。

## 你以为自己知道...

首先我该解释一下我一开始对 name 如何在 JavaScript 中分配的误解。

我以前只知道函数对象间的一个区别 —— 函数声明与函数表达式。前者需要一个标识符，所以我通常认为这是一个“命名函数”：

```javascript
function myFunction() {

}
```

而后者不需要标识符，我就把它叫作“匿名函数”：

```javascript
(function() {

}());
```

这种推断在直觉上是合理的，因为它用了直白的词语定义如“命名的”和“匿名的”。这也许可以解释为何不止我一个人存在这个误解。事实上：现在的 JavaScript （ECMAScript 5.1 或缩写 ES5）对于函数的 `name` 属性并没有明确的说明。稍微看看这个[相关的说明](http://es5.github.io/#x13)可以支持我的观点。我们一般认为命名函数表达式中的标识符会指向“name”，实际上它只会被用在环境记录（environment record）中创建一个入口（entry），（跟 `var` 声明一样）。除此以外的说明都会存在平台特定的细微差异。

（三观已崩溃）

## ...你根本不知道

碰巧下一代 JavaScript （即 ES6 ，[工作草案在这里](https://people.mozilla.org/~jorendorff/es6-draft.html)）的说明中明确了函数 `name` 属性的初始化。很方便的是，它完全是依赖于一个叫 [SetFunctionName](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-setfunctionname) 的[抽象操作](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations)。学习函数名赋值的来龙去脉其实就是简单（虽然也比较无聊）地去研究草案中关于这个操作的所有文献。对于平台实现者来说这必不可少，但对于我们来说，稍微学习几个例子就足够了。

首先，这个规范形式化了一些我们可以预料到的行为：

```javascript
// 函数形式 ........................ `name` 属性的值
function myFunc() {}                  // 'myFunc;
(function() {}());                    // ''
```

但远不止如此！这份规范还列出了一系列情况下，函数表达式（我前面所以为的“匿名函数”）也应该被赋予 `name` 值：

```javascript
// 函数形式 ........................ `name` 属性的值
new Function();                       // 'anonymous'
var toVar = function() {};            // 'toVar'
(function() {}).bind();               // 'bound'

var obj = {
  myMethod: function() {},            // 'myMethod'
  get myGetter() {},                  // 'get myGetter'
  set mySetter(value) {}              // 'set mySetter'
};
```

但这里要清楚，新规范只会在上面的这些情况下才改变函数对象的 `name` 属性。至于现在的 ES5 语法，环境记录依然会保持不变，只有函数声明才会产生新入口。

这让我很惊讶，因为不像函数声明，我从来没有想到对变量或属性的赋值会与函数对象的创建有联系。但 ES6 就是这么任性！JSHint 团队将这个行为称作“名推断”（name inference）。函数对象本身没有让标识符定义，而是由运行时通过其初始赋值去对函数的名字做“最佳猜测”。

最后，ES6 定义了一大堆不兼容 ES5 的新代码格式。当中一部分进一步扩展了函数名推断的语义：

```javascript
// 函数形式 ........................ `name` 属性的值
let toLet = function() {};            // 'toLet'
const toConst = function() {};        // 'toConst'
export default function() {}          // 'default'
function* myGenerator() {}            // 'myGenerator'
new GeneratorFunction() {}            // 'anonymous'

var obj = {
  ['exp' + 'ression']: function() {}, // 'expression'
  myConciseMethod() {},               // 'myConciseMethod'
  *myGeneratorMethod() {}             // 'myGeneratorMethod'
};

class MyClass {
  constructor() {}                    // 'MyClass'
  myClassMethod() {}                  // 'myClassMethod'
}
```

最后一个例子让我很吃惊，构造函数居然被赋予类的名字而不是“constructor”？对于其它大多数的类方法，其 `name` 值跟你想的基本一样。但构造方法很特殊，因为他们本质上都是引用其归属的类。这在 ES5 中也有相应的例子：

```javascript
function MyClass() {}
MyClass.prototype.constructor === MyClass;
```

这个原则同样适用于 ES6 ，即便构造函数体与 `class` 关键字出现在不同的表达式中。

## 标准偏差

手中有了完整的规格书，我们就可以重新看看 JSHint 中函数名推断的过程。注意它也不是一模一样照搬实现的，有些地方我们是故意做得跟规范不同。

「表达式」：很多情况下，实现者会直接以表达式的结果去调用 `SetFunctionName` 。（如：“设 `propKey` 为对 `PropertyName` 求值的结果。[…] `SetFunctionName(propValue, propKey)` 。”）且因为 JSHint 是一个静态分析工具，它不会对检测的代码做任何计算（见文末）。所以这种情况下，我们会报告此函数的 `name` 为“(expression)”。

「未命名」：规范要求“若 `description` 值为 **undefined** ，则 `name` 值取空字符串。”这里意思是类似下面的函数声明：

```javascript
(function() {

})();
```

其 `name` 值应该为 “” 。但我们决定对这种函数的 `name` 报告为“(empty)”。因为 JSHint 这个工具的目的是协助开发者而不是 JavaScript runtime ，我们觉得在这种情况下将规范作重新解释是可以接受的。具体来说：JSHint 在其报告中赋予函数的名字不会引起兼容性问题，所以我们实现了不同的行为，因为这样做更有帮助。

[改进的函数名推断已经在 JSHint 的 master 分支中 landed 了](https://github.com/jshint/jshint/pull/1971)，可以展望它会出现在下个 release 中。

## 其它名字的函数

我从不厌倦去阅读下一代 JavaScript 的各种炫酷新特性。即便如此，对比起 generator、class、module 和 promise ，函数名的确显得有些过时。悲观者甚至会认为这是语言中的一个没有必要的累赘。但正如任何优秀的标准，这个新特性实际上也是一种现实需求的体现。

报错的栈跟踪里需要函数名。缺少函数名推断的情况下，平台一般会用一些通用的替换值如“(anonymous function)”去报告没有名字的函数。这往往会从整体上削弱了栈跟踪的实用性。现在的一些性能检测工具和控制台会识别一个叫 `displayName` 的非标准值，并在栈跟踪时回退到该值。[Malte Ubl 最近也赞成将此纳入 JavaScript 库代码](https://medium.com/@cramforce/on-the-awesomeness-of-fn-displayname-9511933a714a)，[Ember.js 也对此稍作尝试](https://github.com/emberjs/ember.js/blob/43423f6acd1abd4ffb0de6afb744d4897ae2f768/packages/ember-metal/lib/logger.js#L20)。

但随着 runtime 实现了新功能，诸如此类的非标准方法就变得没什么必要了。这个小小的改变可以帮助开发者专注于着手解决问题而无需担心怎么减少调试陷阱。所以即使在即将到来的各种 JavaScript 会议中你不太可能会见到标题为“ES6 中的函数名推断”之类的演讲，这个小小的特性依然值得庆祝。

- JSHint 的确会[对封闭字符串做连接操作](https://github.com/jshint/jshint/blob/d0b3cfd935c9445f14b37ea9694d8a172a52739a/src/jshint.js#L2335-L2348)，但这基本算不上是代码执行。

