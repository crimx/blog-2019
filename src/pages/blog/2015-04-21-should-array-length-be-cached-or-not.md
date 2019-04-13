---
title: JavaScript 有必要缓存 for 循环中的 Array.length 吗？
tags:
  - Recommended
  - Understanding JavaScript
  - JavaScript
  - Array
quote:
  content: '"TL;DR: No"'
  author: ''
  source: ''
date: 2015-04-21T12:00:00.000Z
layout: blog-post
description: ''
---

## 问题

缓存 `Array.length` 是老生常谈的小优化。

```javascript
// 不缓存 
for (var i = 0; i < arr.length; i++) {
...
}

// 缓存
var len = arr.length;
for (var i = 0; i < len; i++) {
...
}
```


但笔者对这种破碎的写法感到不适，也对这种写法的实际优化效果产生疑问。

且推崇这种写法的朋友似乎很多也是“前辈这么说+自己想了一下觉得有道理”。

由于 for 循环搭配 `Array.length` 是极度常用的 JavasScript 代码，所以非常必要搞清楚。


## 结论

先上笔者得到的结论：缓存 `Array.lengh` 对优化影响不大，甚至会减慢。

## 理由

### 从测试结果上看

stackoverflow 上也有这个讨论，[For-loop performance: storing array length in a variable](http://stackoverflow.com/questions/17989270/for-loop-performance-storing-array-length-in-a-variable) 。

accepted 的答案是说缓存会起到加速的结果，给出了 [jsPerf](http://jsperf.com/for-loop-research) 测试。

但是有答案反对，也给出了 [jsPerf](http://blogs.msdn.com/b/eternalcoding/archive/2015/01/07/javascript-shoud-i-have-to-cache-my-array-s-length.aspx) 测试。

两个答案的区别在于 （[Loop-invariant code motion](http://en.wikipedia.org/wiki/Loop-invariant_code_motion)），accepted 答案的测试循环里没有访问到数组，是不实际的，后面会讲到。

从另一篇文章 [Shoud I have to cache my array’s length?](http://blogs.msdn.com/b/eternalcoding/archive/2015/01/07/javascript-shoud-i-have-to-cache-my-array-s-length.aspx) 的测试结果也可以看出缓存差别不大。

![array-caching-performance-1][array-caching-performance-1]

还有这篇 [JavaScript's .length Property is a Stored Value](http://www.erichynds.com/blog/javascript-length-property-is-a-stored-value)

![array-caching-performance-2][array-caching-performance-2]

### 从 V8 的中间代码分析

这篇文章 [How the Grinch stole array.length access](http://mrale.ph/blog/2014/12/24/array-length-caching.html) 从 V8 的 hydrogen 探讨 `Array.length` 在 for 循环中的处理。

正如上面提到的 [Loop-invariant code motion](http://en.wikipedia.org/wiki/Loop-invariant_code_motion)，引擎会聪明的把能确定不变的代码移到循环外。

所以像下面这种代码也不会影响引擎对 `Array.length` 的优化：

```javascript
function uncached(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]
  }
}
```

而当循环中调用不可[内联函数](http://zh.wikipedia.org/zh/%E5%86%85%E8%81%94%E5%87%BD%E6%95%B0)时，引擎没法做优化，每次循环都会重新计算一遍 `length`

```javascript
function BLACKHOLE(sum, arr) {
  try { } catch (e) { }
}

function uncached(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (sum < 0) BLACKHOLE(arr, sum);
  }
  return sum;
}
```

但这时即便是在循环外缓存了 `length` 也是没有用的，引擎没法预判数组的变化，当需要访问数组元素时会触发 bounds check ，从而照样要计算一遍 `length` 。所以缓存 `length` 是没有用的。

甚至，由于多了一个变量，底层的寄存器分配器每次循环还要多一次恢复这个变量。这个只有在大规模的情况下才会看出区别。

## 结尾

当然这篇文章也有局限性，仅仅讨论了 V8 引擎，也没有讨论访问 `length` 代价更高的 `HTMLCollection` 。但这已经足够让我们不用再局限于缓存的写法，可以放开来按照自己喜欢的方式去写循环了。

【完】

[array-caching-performance-1]: /img/post/javascript/array-caching-performance-1.jpg
[array-caching-performance-2]: /img/post/javascript/array-caching-performance-2.jpg

