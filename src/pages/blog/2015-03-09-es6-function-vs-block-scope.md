---
layout: blog-post
draft: false
date: 2015-03-09T12:00:00.000Z
title: ES6 随笔：函数与块级作用域
description: '阅读 Kyle Simpson 《You don''t JS: Scope and Closures》第三章过程中的一些随笔'
quote:
  author: ''
  content: ''
  source: ''
tags:
  - Understanding JavaScript
  - JavaScript
  - Scope
  - 闲读规范
---

作用域
------

作者提到了 ES5 中有三种方式实现作用域：function、with 和鲜为人知的 try/catch 。with 已经被淘汰，function 方式可以看看之前翻译的经典文章[《深入理解 JavaScript 模块模式 》](http://www.crimx.com/2014/08/05/javascript-module-pattern-in-depth/)，而最后一种 hack 真是让人眼前一亮。他在附录 B 中也提到 google 的 Traceur 也是这么实现的，我试了一下，发现 Traceur 与 Babel 现在都没有采用这种方式了，而是直接检测 shadow 冲突再使用不同的变量名，这可能是考虑到性能的问题。

```javascript
// ES6 代码
// ...
let a = 1;
{
  let a = 2;
  {
    let a = 3;
  }
}
// ...

// Try/Catch 方式
// ...
try {throw 1} catch(a) {
  try {throw 2} catch(a) {
    try {throw 3} catch(a) {
      
    }
  }
}
// ...

// Traceur
// ...
var a = 1;
{
  var a$__0 = 2;
  {
    var a$__1 = 3;
  }
}
// ...

// Babel
// ...
var a = 1;
{
  var _a = 2;
  {
    var _a2 = 3;
  }
}
// ...
```

TDZ
---

有意思的是，这几种 hack 都不能解决 `let` 变量不许提升 (hoist) 的问题。

```javascript
console.log(a); // ReferenceError
let a;
```

`let` 声明行到它所在 block 最开始之间的区域被称为 TDZ [“Temporal dead zone”](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#Temporal_dead_zone_and_errors_with_let)，正常情况下，可以考虑用回上面的方法 hack ，把 TDZ 当做一个 block，但是[这里](https://github.com/babel/babel/issues/563)提到了一种坑爹的情况，函数。

```javascript
function foo() {
  x; // 合法
}
let x;
foo();
```

```javascript
function foo() {
  x; // 不合法
}
foo();
let x;
```

```javascript
foo();
let x;
function foo() {
  x; // 不合法
}
```


这么一来静态分析出错误就变得很麻烦，在 Traceur 的一个 issue 中 **@arv** 提到了[牺牲运行时来检测的方式](https://github.com/google/traceur-compiler/issues/1382)：

```javascript
// ES6
let a = f();
const b = 2;
function f() { return b; }

// hack
$traceurRuntime.UNITIALIZED = {};
$traceurRuntime.assertInitialized = function(v) {
  if (v === UNITIALIZED) throw new ReferenceError();
  return v;
};

var a = $traceurRuntime.UNITIALIZED;
var b = $traceurRuntime.UNITIALIZED;
a = f();
b = 2;
function f() {
  return $traceurRuntime.assertInitialized(b);
}
```

这在 Babel 中需要开启 `es6.blockScopingTDZ` 特性：

```bash
$ babel-node --optional es6.blockScopingTDZ test.js 
```

（3 月 19 日 补）  
注意 `for` 循环闭包的坑，现在还没有好的 polyfill 方案

```javascript
// 0 1 2 3 4
for (let i = 0; i < 5; i += 1) {
  // 忽略我在循环中声明函数
  setTimeout(function timer() {
    console.log(i);
  }, 1*1000);
}
```

块级作用域
----------

作者提到几个块级作用域的好处，比较有意思的一个是对垃圾回收的优化：

```javascript
function process(data) {
  // ...
}

var someReallyBigData = {
  // ...
};

process(someReallyBigData);

var btn = document.getElementById('a_button');
btn.addEventListener('click', function(evt) {
  console.log('button clicked');
}, false);
```

这里 `btn` 的回调函数虽然没有直接用到 `someReallyBigData` ，但 JS 引擎很可能会继续保留 `someReallyBigData` 因为闭包使回调函数引用了 `someReallyBigData` 所在的作用域。ES6 中，使用显式的块则可以向引擎明确回收时机：

```javascript
function process(data) {
  // ...
}

{
  let someReallyBigData = {
    // ...
  };

  process(someReallyBigData);
}// 这里就可以回收 someReallyBigData 了

var btn = document.getElementById('a_button');
btn.addEventListener('click', function(evt) {
  console.log('button clicked');
}, false);
```


