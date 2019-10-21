---
layout: blog-post
draft: false
date: 2019-10-21T05:28:48.017Z
title: 实现一个有趣的 RxJS Operator
description: 本文聊聊如何实现一个按 id 切换的 switchMap 。
quote:
  author: Taylor Swift
  content: '"I second-guess and overthink and rethink every single thing that I do."'
  source: ''
---
## 问题

最近有这么一个情况，生产者会产生 `{ id, value }` 结构的值，下游接收发起异步操作。如果是同个 `id` 那么后产生的值总会覆盖前者，前者发起的异步如果返回得比较晚则需要丢弃过时的值。

所以这里就有点类似于 `switchMap` 但不同的是，`switchMap` 总会抛弃前者，而这里只有 `id` 相同才会抛弃。

往下阅读之前不妨想想可以如何解决。

## 排除

首先这里肯定不能是基于 `switchMap`，因为我们需要保留不同 `id` 发起的异步结果。

那么剩下的子流归并操作是 `mergeMap` 和 `concatMap`。`concatMap` 一般用于子流产生多个顺序值，所以这里也不适用。

`mergeMap` 是最普通的归并，没有其它合适 Operator 情况下我们就根据它来实现一个自定义的 Operator。

## 思路

从另一个角度看这个问题，我们只需要根据 `id` 产生一条子流，之后如果出现同个 `id` 的项则取消这条子流。

对于判断后来的同个 `id` 值，我们可以借用一条只有这个 `id` 值的流。

```javascript
takeUntil(input$.pipe(filter(input => input.id === id)))
```

所以这个思路就很明显了。

```typescript
import { Observable, OperatorFunction } from 'rxjs'
import { mergeMap, takeUntil, filter } from 'rxjs/operators'

export function switchMapBy<T, R>(
  key: keyof T,
  project: (val: T) => Observable<R>
): OperatorFunction<T, R> {
  return input$ => {
    return input$.pipe(
      mergeMap(val =>
        project(val).pipe(
          takeUntil(input$.pipe(filter(input => input[key] === val[key])))
        )
      )
    )
  }
}
```

## 优化

在复用了流的情况下，如果这个 Operator 使用时排在较后的位置，那么它前面的操作就要都执行两次，我们可以用将流转热避免这个问题。

```typescript{9}
import { Observable, OperatorFunction } from 'rxjs'
import { mergeMap, takeUntil, filter, share } from 'rxjs/operators'

export function switchMapBy<T, R>(
  key: keyof T,
  project: (val: T) => Observable<R>
): OperatorFunction<T, R> {
  return input$ => {
    const input$$ = input$.pipe(share())
    return input$$.pipe(
      mergeMap(val =>
        project(val).pipe(
          takeUntil(input$$.pipe(filter(input => input[key] === val[key])))
        )
      )
    )
  }
}
```

最后我们还可以让 `project` 支持返回 `Promise`。

```typescript{12}
import { Observable, OperatorFunction, from } from 'rxjs'
import { mergeMap, takeUntil, filter, share } from 'rxjs/operators'

export function switchMapBy<T, R>(
  key: keyof T,
  project: (val: T) => Observable<R> | Promise<R>
): OperatorFunction<T, R> {
  return input$ => {
    const input$$ = input$.pipe(share())
    return input$$.pipe(
      mergeMap(val =>
        from(project(val)).pipe(
          takeUntil(input$$.pipe(filter(input => input[key] === val[key])))
        )
      )
    )
  }
}
```

## 最后

实现自定义 Operator 的确是一个比较好的练手机会，对于重新审视理解流有一定帮助。这种流复用的思考方式还得多加训练才能一步到位。
