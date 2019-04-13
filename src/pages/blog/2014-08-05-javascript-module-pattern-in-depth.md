---
title: 深入理解 JavaScript 模块模式
tags:
  - Understanding JavaScript
  - JavaScript
  - Translation
quote:
  content: >-
    Complexity that works is built up out of modules that work perfectly,
    layered one over the other.
  author: Kevin Kelly
  source: ''
date: 2014-08-05T12:00:00.000Z
layout: blog-post
description: ''
---

拜读 2010 年神文，原文：[JavaScript Module Pattern: In-Depth](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)（2010-03-12）

模块模式（module pattern）是一种常见的 JavaScript 编程模式，大家一般都能很好地熟悉掌握。但其实这里还有不少高级用法没有得到关注。本文将带大家回顾一些基础知识，然后介绍一些值得关注的高级用法，包括一个我认为是我首创的用法。

## 基础知识

我们先简单介绍一下模块模式，自从 Eric Miraglia （就职于 YUI）三年前（2007）的[一篇博文](http://yuiblog.com/blog/2007/06/12/module-pattern/)中提出后便广为人知。如果你已经熟悉模块模式，完全可以放心地跳到[高级模式](#Advanced_Patterns)。

### 匿名闭包

这是使后面所有技术成为可能的基础，也是 **JavaScript 最好的唯一一个特性**。我们只需简单地创建一个匿名函数，然后立即执行。函数中所有的代码都会存在于一个**闭包**当中；闭包在应用的整个生命周期内都会为其代码提供隐私和状态保护。

```javascript
(function () {
  // ... 所有的变量和函数都只在这个作用域中
  // 依然能保持对所有全局的访问
}());
```

注意括住匿名函数的 `()`。这是语言所要求的，因为 `function` 开头的语句会被翻译成**函数声明**，加上括号后就变成了**函数表达式**。

### 全局导入

JavaScript 有一个称为隐式全局变量（implied globals）的特性。当一个名字被使用的时候，解析器会顺着作用域链由里往外一层层查找该名字的变量声明。如果没有找到，这个变量就默认是全局的。如果是在赋值语句中使用且没有找到，就会自动创建一个全局变量。这意味着在匿名闭包中很容易就能使用或创建全局变量。然而，这样的代码会变得难以管理，因为对人来说很难判断哪些变量是全局的。

值得高兴的是，匿名函数为此提供了一个很好的解决方案。通过将全局变量作为参数传入匿名函数，就相当于将其**导入**（import）到我们代码中，比起隐式全局变量此方法既简洁又高效。看例子：

```javascript
(function ($, YAHOO) {
  //现在可以在这段代码中访问全局的 jQuery (作为 $) 和 YAHOO
}(jQuery, YAHOO));
```

### 模块导出

有时候我们不仅要使用全局变量，还希望能**声明**全局变量。这时只需要简单的将它们导出即可，利用匿名函数的**返回值**。到这里就是模块模式的所有基础内容了，看完整的例子：

```javascript
var MODULE = (function () {
  var my = {},
      privateVariable = 1;

  function privateMethod() {
    // ...
  }

  my.moduleProperty = 1;
  my.moduleMethod = function () {
    // ...
  };

  return my;
}());
```

注意这里我们声明了一个 `MODULE` 全局模块。它带有两个属性：一个 `MODULE.moduleMethod` 方法和一个 `MODULE.moduleProperty` 变量。此外它还在匿名函数中利用闭包维持了一个**私有内部状态**（private internal state）。而且我们还能方便地导入所需模块，利用回前面刚讲的知识。

## 高级模式

尽管前面提到的方法已足够应付多数场景，我们还是可以在模块上更进一步创造一些强大的、可扩展的结构。接下来我们把这些方法逐个看一遍，继续用回前面的 MODULE 模块。

### 模块扩展

前面讲的模块模式有一个局限性，即整个模块必须在一个文件里。有大型代码库工作经验的人都知道分割多文件的各种好处。幸运的是，有一个不错的方法可以实现模块扩展：先导入模块，然后添加属性，再把它导出来。看下面的样例，对之前实现的 MODULE 模块进行扩展：

```javascript
var MODULE = (function (my) {
  my.anotherMethod = function () {
    // 增加方法...
  };

  return my;
}(MODULE));
```

这里是为了样例代码一致性才使用了 `var` 关键字，其实可以不要。这段代码运行后 `MODULE` 就得到了一个公开的方法 `MODULE.anotherMethod`。这个扩展文件也会保持其自身的私有内部状态和导入。

### 松耦合扩展

前面的例子需要模块创建部分先运行，然后再跑扩展部分代码；其实顺序是可以不限的。JavaScript 程序在性能上的一个优点就是异步加载脚本。我们可以按任意顺序创建模块的各个部分然后通过松耦合扩展（Loose Augmentation）灵活地加载到一起。每个文件都应该按如下结构创建：

```javascript
var MODULE = (function (my) {
  // 增加功能...

  return my;
}(MODULE || {}));
```

这里的 `var` 关键字是必需的。注意到导入的时候只有 `MODULE` 还不存在时才会去创建模块。这方法意味着可以用 [LABjs](http://labjs.com/) 之类的工具并行加载所有模块文件，无需进行阻塞。

### 紧耦合扩展

松耦合扩展虽然好用，但还是会给模块带来一定局限性。其中最重要一点是无法安全重写模块属性；也不能在初始化过程中使用其它文件的模块属性（初始化完成后才可以）。**紧耦合扩展**（Tight Augmentation）要按一定顺序加载，但好处是允许**重写**。这里有个简单的例子（被扩展的是前面最原始的 MODULE）：

```javascript
var MODULE = (function (my) {
  var old_moduleMethod = my.moduleMethod;

  my.moduleMethod = function () {
    // 重写方法，可以通过 old_moduleMethod 访问旧的方法...
  };

  return my;
}(MODULE));
```

例子重写了 `MODULE.moduleMethod`，且按需可以保持原来方法的引用。

### 克隆与继承

```javascript
var MODULE_TWO = (function (old) {
  var my = {},
      key;

  for (key in old) {
    if (old.hasOwnProperty(key)) {
      my[key] = old[key];
    }
  }

  var super_moduleMethod = old.moduleMethod;
  my.moduleMethod = function () {
    // 重写克隆对象的方法，同时通过 super_moduleMethod 访问父类
  };

  return my;
}(MODULE));
```

此模式恐怕是灵活性最低的选择。它的确给予了一些巧妙的成分，却是以牺牲灵活性为代价。属性如果是对象或函数在这里是不会被复制的，只会变成两个引用指向同个对象。利用其中一个引用进行修改另一个也会受到影响。对于对象来说，可以利用递归克隆解决这个问题；但函数就不行了，除非用 `eval` 或许还可以。虽然这模式不是那么地好用，但为了完整性我还是提了一下它。

### 跨文件私有状态

将模块分成多文件的一个严重局限性是每个文件只能保持其自身的私有状态，无法访问其它文件的私有状态。这个有解决办法。下面的例子是一个松耦合扩展模块，其保持的私有状态跨越了所有的扩展：

```javascript
var MODULE = (function (my) {
  var _private = my._private = my._private || {},
      _seal = my._seal = my._seal || function () {
        delete my._private;
        delete my._seal;
        delete my._unseal;
      },
      _unseal = my._unseal = my._unseal || function () {
        my._private = _private;
        my._seal = _seal;
        my._unseal = _unseal;
      };

  // 可永久访问 _private, _seal, 和 _unseal

  return my;
}(MODULE || {}));
```

所有文件都可以在其局部变量 `_private` 中设置属性，其它文件立即就可以使用。在模块加载完成后，程序应该调用 `MODULE._seal()` 阻止外部代码访问内部的 `_private`。在模块的生命周期里如果需要再次扩展模块，只需在加载新文件之前，先让任意文件中的一个内部方法调用 `_unseal()` 开放权限，执行完扩展后再调用 `_seal()` 封闭。这个模式是我今天工作时突然想到的，我还没有在其它地方见过。我认为这个模式很有用，值得在这里一提。

### 子模块

最后一个高级模式其实是最简单的。有许多创建子模块的好例子，跟创建普通模块一样：

```javascript
MODULE.sub = (function () {
  var my = {};
  // ...

  return my;
}());
```

尽管这里比较显浅，但我觉得还是有必要提一下的。子模块拥有普通模块所有的高级功能，包括扩展和私有状态。

## 结论

大部分的高级模式都可以互相结合，以创造出更有用的模式。如果要我主张一条路线来设计复杂的应用，我会结合**松耦合扩展**，**私有状态**和**子模块**。

本文我一直都没有提过性能，但我想在这里简单说一下：模块模式的**性能表现很好**。它显著地减少了代码量，加快了代码下载速度；使用**松耦合扩展**允许简单的非阻塞并行下载，也加快了下载速度。初始化耗时可能比其它方法慢一点点，但还是值得的。运行时性能只要全局变量正确导入就不会有什么问题，甚至会因使用局部变量表示子模块减短了引用链而得到加速。

最后再介绍一个子模块，它可以动态加载到父模块（没有父模块就会创建一个）。为了简单明了我没有加入私有状态，要加上去也很简单。此模式允许整个复杂的分层代码库完全并行地加载自身、子模块等等。

```javascript
var UTIL = (function (parent, $) {
  var my = parent.ajax = parent.ajax || {};

  my.get = function (url, params, callback) {
    // 好吧，这个方法是有点坑爹，呵呵 :)
    return $.getJSON(url, params, callback);
  };

  // 等等...

  return parent;
}(UTIL || {}, jQuery));
```

希望本文能帮到你，记得在评论里分享你的想法哦！现在勇往直前，写出更好、更模块化的 JavaScript 吧！

