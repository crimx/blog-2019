---
title: 理解 RxJS ：四次元编程
tags:
  - RxJS
  - JavaScript
  - Functional
quote:
  content: We are ready for any unforeseen event that may or may not occur.
  author: Dan Quayle
  source: ''
date: 2018-02-16T12:00:00.000Z
layout: blog-post
description: ''
---

学习 RxJS 最大的问题是官方造了很多概念，但文档又解释得不太全面和易懂，需要结合阅读各种文章（特别是 [Ben Lesh](https://medium.com/@benlesh) 的，包括视频）。本文试图整体梳理一遍再用另外的角度来介绍，希望能帮助初学者或者对 RxJS 的一些概念比较含糊的使用者。

# 为什么需要 RxJS

RxJS 属于响应式编程，其思想是将时间看作数组，随着时间发生的事件被看作是数组的项，然后以操作数组的方式变换事件。其强大的地方在于站在四维的角度看问题，这就像是拥有了上帝视野。

在处理事件之间的关系时，对于传统方式，我们需要设置各种状态变量来记录这些关系，比如对点击 `Shift` 键进行计数，需要手动设置一个 `let shiftPressCount: number`，如果需要每 600ms 清零，又需要添加计时的状态，这些状态都需要手动维护，当它们变得复杂和庞大的时候我们很快就会乱了，因为没有明确的方向，不好判断这些状态同步了没有。

而这正是 RxJS 发光发热的地方。因为从四维的角度看，这些状态就不是单个变量，而是一系列变量。比如对按键计数：

```javascript
Rx.Observable.fromEvent(document, 'keydown')
  .filter(({ key }) => key === 'Shift')
  .scan(count => count + 1, 0)
  .subscribe(count => console.log(`按了 ${count} 遍 Shift 键`))
```

相信有使用过数组方法的人第一次看也大概能知道这里干了些什么（把 `scan` 看作是会输出中间结果的 `reduce`）。中间状态都在变换的过程中被封装起来，每一次事件的 `count` 都是独立的，不容易乱，也使得可以用纯函数去表达状态的变换。链式调用（或者 RxJS5 的 pipeable）在一定程度上限制了状态数据的流动方向，增加了可预测性，更加容易理解。


# 理解 RxJS

## 基本概念

使用 RxJS 前先理解它要做什么，这里引入了两个概念，Producer （生产者）和 Observer （观察者）。

先看一个熟悉的例子：

```javascript
document.addEventListener('click', function handler (e) {
  console.log(e.clientX)
})
```

这里的 Producer 是 DOM 事件机制，会不定期产出 MouseEvent 事件。Observer 就是 `handler`，对事件作出反应。

再看前面的例子：

```javascript
Rx.Observable.fromEvent(document, 'keydown')
  .filter(({ key }) => key === 'Shift')
  .scan(count => count + 1, 0)
  .subscribe(count => console.log(`按了 ${count} 遍 Shift 键`))
```

Producer 还是 DOM 事件机制，Observer 是 `subscribe` 的参数。所以可以理解 RxJS 为连接 Producer 和 Observer 的纽带。

于是这个纽带的成分叫 [Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) （可被观察的）就不难理解了。Observable 就是由事件组成的四维数组。RxJS 将 Producer 转换为 Observable，然后对 Observable 进行各种变换，最后再交给 Observer。

对 Observable 进行变换的操作符叫做 Operator，比如上面的 `filter` 和 'scan'，它们输入 Observable 再输出新的 Observable。RxJS 有巨量的 Operators ，这也是学习 RxJS 的第二难点，我已经分类整理了六十多个，整理完会再写一篇文章介绍，敬请关注。

## 创建 Observable

RxJS 封装了许多有用的方法来将 Producer 转换为 Observable，比如 [`fromEvent`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-fromEvent)、[`fromPromise`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-fromPromise)，但其根本是一个叫 [`create`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-create) 的方法。

```javascript
var observable = Rx.Observable.create(observer => {
  observer.next(0)
  observer.next(1)
  observer.next(2)
  setTimeout(() => {
    observer.next(3)
    observer.complete()
  }, 1000)
})
```

这其实跟 Promise 的思路很像，Promise 只能 `resolve` 一遍，但这里可以 `observer.next` 很多个值（事件），最后还能 complete（不是必须的，可以有无限事件）。官方把这个类 `resolve` 的参数也叫做 `observer`，因为 `observer.next(0)` 的意思是“Subscribe 我的那个 Observer 接下来会获得这个值 `0`”。我认为这是一个不好的决定，重名对于新人太容易混淆了，这个其实可以从另一个角度看，把它叫做 producer，“产生”了下个值。

## Subscribe 不是订阅者模式

一个常见的误解是认为 RxJS 就是 `addEventListener` 那样的订阅者模式，`subscribe` 这个方法名也很有误导性。然而两者并不是一回事，订阅者模式会维护一个订阅者列表，事件来了就一一调用列表上的每个订阅者传递通知。但 RxJS 并没有这么一个列表，它就是一个函数，可以跟 Promise 类比，Promise 的 executor 是在 `new Promise(executor)` 时马上执行的，而 RxJS `Rx.Observable.create(observer)` 的 `observer` 则是在每次执行 `subscribe` 后都调用一遍，即每次 `subscribe` 的 Observables 都是独立的，都会重新走一遍整个流程。

这个时候你也许会想，这样每次都完整调用一遍岂不是很浪费性能？没错，如果需要多次 subscribe 同个 Producer 这么做会比较浪费，但如果只是 subscribe 一遍，维护一个订阅者列表也没有必要。所以 RxJS 引入了 Hot 和 Cold Observable 的概念。

## Hot & Cold

Observable 冷热概念其实就是看 Producer 的创建受不受 RxJS 控制。

前面我们知道，`create` 会将 Producer 转化为 Observable 。如果这个 Producer 也是在 `create` 回调里面产生的，那么就是 Cold ，因为 Producer 还不存在，只有 `subscribe` 了之后才会被创建。

但如果 Producer 在之前就创建了，比如 DOM 事件，`create` 回调里仅仅是对 Producer 添加 listener，那么这就叫做 Hot ，因为不需要 `subscribe` 来启动 Producer 。

只有 Hot Observable 才可以实现订阅者模式。可以通过一个特殊的 Observable 叫 [Subject](http://reactivex.io/rxjs/class/es6/Subject.js~Subject.html) 来创建，其内部会维护一个订阅者列表。通过 [`share`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-share) 方法可以将一个 Cold 的 Observable 转换为 Hot 。原理是内部用 Subject subscribe 上流的 Observable 实现转接。

# 使用 RxJS

理解了基本概念之后就可以直接开写了，本身没有什么魔法，参考一下 api 依样画葫芦即可。

使用 RxJS 最常见的问题是不知道什么时候该用哪个 Operator 。这其实跟数组操作是一样的，RxJS 提供了数量庞大的 Operators ，基本覆盖了各种可以想到的数组操作，建议先从 JavaScript 常见的数组操作开始，如 `map`、`filter`、`scan`（也有 `reduce` ，但这个通常不是我们想要的，我们一般不需要在 complete 之后才输出结果，而是每次都输出阶段性的结果）。

多翻[官方文档](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html)，常用的 Operators 都描述得非常详细，有弹珠图（Marble Graph）和一句话总结；缺点是措辞有时可能会比较抽象，不是那么好理解。

另外就是第三方的 [learnrxjs](http://learnrxjs.io/operators) 和 [Rxjs 5 ultimate](https://chrisnoring.gitbooks.io/rxjs-5-ultimate/content/operators.html)，按作者的思路组织，更通俗易懂些，可以作为补充理解；缺点是可能跟官方不同步，以及不全。

我整理完也会再写一篇文章介绍，敬请期待。

