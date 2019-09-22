---
layout: blog-post
draft: false
date: 2019-09-22T07:37:53.903Z
title: 真·复用组件 - React hooks 结合 RxJS 封装异步逻辑
description: 本文聊聊 React hooks 如何改变旧有的开发思路，以及如何利用 hooks 结合 RxJS 将异步逻辑封装到组件中，从而轻松复用功能更复杂的组件。
quote:
  author: Stephen Hawking
  content: ”Time can behave like another direction in space under extreme conditions. “
  source: ''
tags:
  - React
  - RxJS
  - Hooks
---
## 一个时代的结束

在 React 开发中，过去一个惯例是按组件是否维护自身 state 区分为 Dumb/Pure/Presentational 和 Smart/Stateful/Container 。这并不是因为这么写更好，而是因为过去 React 中使用 state 的话必须绑定到 class 组件中，这使到 state 非常难以剥离复用和测试，故如此区分其实是一种无奈的曲线之举。

这样的情况在 React hooks 出现后终于得到了改变。如果你有封装过 custom hooks 就会意识到，hooks 逻辑是独立于组件而存在的。如官方的[例子](https://reactjs.org/docs/hooks-custom.html#extracting-a-custom-hook)


```javascript
import React, { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```

这使到逻辑非常容易被复用和测试，所以正如 Dan Abramov 也[建议](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)不必再教条式地对组件做旧有的区分。有了 hooks 我们可以大胆地复用功能更丰富的组件。

## Hooks 与异步逻辑

因为 hooks 是生活在函数组件中，它们很可能会被反复调用许多遍，所以一般我们的逻辑都是多包了一层函数，也叫 Thunk，这使到我们的逻辑可以延迟到恰当的时候执行。React 提供了 `useEffect` 和 `useLayoutEffect` 来让我们存放异步的逻辑。

但一般来说，我们仅用 `useEffect` 来实现一些简单的异步逻辑，如一次性的初始化获取数据，添加外部事件监听，等等。而一些稍微复杂的逻辑我们一般是放到上层的状态管理仓库中处理，如 Redux 。这是因为复杂的异步往往会涉及到不同时间点的状态，我们往往需要用很多中间变量去维护。

```javascript
function useAPI(keyword) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    let isStale = false
    fetchAPI(keyword).then(result => {
      if (!isStale) {
        setResult(result)
      }
    })

    return () => {
      isStale = true
    }
  }, [keyword])

  return result
}
```

如这个例子中，因为 Promise 不能取消，我们需要一个中间变量 `isStale` 来取消已经过时的结果，以避免早先的查询因为网络延迟问题而覆盖了后面的结果。

这只是个简单的例子，对于更复杂的，按过去的思路，将这类逻辑放到 Redux 中处理是一种符合习惯的解决方法。但如果这些状态不被其它组件所共用，那么我们其实是在用一种两边不讨好的方式在开发：一来引入了额外的全局状态和仓库连接步骤，二来这个组件又不能方便地被独立复用。

我们需要一种更省事的方式来封装异步逻辑。

## RxJS：？？有人叫我？

异步处理是存在已久的问题，业内早已有许多成熟的解决方案，RxJS 便是其中之一。但如果你没有接触过 RxJS 或者是新手，在搜集资料的时候可能会发现一种两极分化的情况：一部分人在惊叹赞美，一部分人在极力劝退。

这是因为响应式编程用了一种常理以外的角度观察世界，也是笔者在[《理解 RxJS 》](https://blog.crimx.com/2018/02/16/understanding-rxjs/)中提到的，一种上帝的四维视野：逻辑不再存在于时间之中，而是在时间之外。我们不需要维护什么中间状态，每一个时间点上的状态我们都可以直接得到。

当然代码还是在我们的四维世界里执行的。RxJS 有点像电子游戏，只会渲染你需要的部分。比如我们告诉 RxJS 需要时间点 1 和 4 的状态，那么到时间点 4 的时候，我们就有了 1 和 4 的状态，不需要的状态就被丢弃了，但在我们看来，它们都还在，就像游戏中我们看不见的其它场景。

对于部分人来说这可能比较难接受，就像有人晕车、有人晕船，觉得不适有的人会选择再适应一下，有的人会更换其它适合自己的方式，有的人会劝大家不要坐车坐船，见仁见智。

在笔者看来，这是一种正确的异步处理方式。虽然有初期的学习成本，但这个是一次性的。从 RxJS 的角度看，时间点上的状态可以像数组一样处理，这带来了极大的便利。

## React 中使用 RxJS

唠叨了一番，那么如何在 React 中使用 RxJS 呢？

首先我们已经有了相当成熟的 [redux-observable](https://redux-observable.js.org)，这是类似于 redux-saga 的管理方式。不一样的是 redux-saga generator 的使用方式是自用的，离开了这个框架没什么移植性，而 redux-observable 使用的 RxJS 是通用的，与这框架无关。但两者的入门成本也不一样，具体对比可以参考[这里](https://stackoverflow.com/a/40027778/3432641)。

对于 hooks 中使用 RxJS 的，目前有几个。

[reactjs-hooks-rxjs](https://github.com/leandrohsilveira/reactjs-hooks-rxjs) 是一个对订阅组件外部 Observable 的简单封装。

[rxjs-hooks](https://github.com/LeetCode-OpenSource/rxjs-hooks) 提供了两个 API 转换 Observable，可以与 React 的 props, state 和事件交互。在使用过程中发现两个 API 设计得过于复杂，不仅使用起来不方便，由于 hooks 不能可选且顺序必须固定的特性，复杂的接口代表了一些没用到的资源会存在空转状态。

最后因为一个无法解决的 [issue](https://github.com/LeetCode-OpenSource/rxjs-hooks/issues/60) 笔者不得不弃用而重新设计一个轮子 [observable-hooks](https://github.com/crimx/observable-hooks)。

![observable-hooks](https://github.com/crimx/observable-hooks/raw/master/observable-hooks.png?raw=true)

这个超小的库是一个全方位的解决方案，通过简化每个 API 的职责解决了空转的问题并提高了性能。React 与 RxJS 交接的地方都交给 hooks 处理，这保持了 Observable 的纯净性，允许逻辑像 Epic 一样分离测试，所以如果项目本身就用了 redux-observable 的话会非常方便。

一个简单的例子，检测用户的输入状态，停下来一秒后复原。

```jsx
import React from 'react'
import { useObservableState } from 'observable-hooks'
import { timer } from 'rxjs'
import { switchMap, mapTo, startWith } from 'rxjs/operators'

const App = () => {
  const [isTyping, updateIsTyping] = useObservableState(
    event$ => event$.pipe(
      switchMap(() =>
        timer(1000).pipe(
          mapTo(false),
          startWith(true)
        )
      )
    ),
    false
  )

  return (
    <div>
      <input type="text" onKeyDown={updateIsTyping} />
      <p>{isTyping ? 'Good you are typing.' : 'Why stop typing?'}</p>
    </div>
  )
}
```

可以看到异步逻辑是纯净的，能够被剥离出来进行复用或测试。`useObservableState` 是一个简单封装避免了初始化触发额外的 setState ，核心的三个 API 是

- [`use-observable`](https://www.crimx.com/observable-hooks/modules/_use_observable_.html) 从变量变化到 Observable ，以及对各种 Observables 进行各种处理（merge, concat...）。
- [`use-observable-callback`](https://www.crimx.com/observable-hooks/modules/_use_observable_callback_.html) 从事件回调到 Observable 。
- [`use-subscription`](https://www.crimx.com/observable-hooks/modules/_use_subscription_.html) 从 Observable 回到外部。

通过这三个 API 的组合就可以达到 React 和 RxJS 的无缝交接，利用 Thunk 保证了 Observable 只会被创建一遍，每次都返回同样的变量。

更多的例子：

Pomodoro Timer Example

<iframe src="https://codesandbox.io/embed/github/crimx/observable-hooks/tree/master/examples/pomodoro-timer?autoresize=1&fontsize=14&hidenavigation=1&view=preview" title="pomodoro-timer" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Typeahead Example

<iframe src="https://codesandbox.io/embed/github/crimx/observable-hooks/tree/master/examples/typeahead?autoresize=1&fontsize=14&hidenavigation=1&view=preview" title="typeahead" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## 最后

现在 [observable-hooks](https://github.com/crimx/observable-hooks) 已经非常稳定，文档测试齐全，在[「沙拉查词 7」](https://saladict.crimx.com/)中已经大量使用实现复杂的组件动效，效果非常不错。如果你像我一样喜欢 React 和 RxJS 的话强烈建议试一试！
