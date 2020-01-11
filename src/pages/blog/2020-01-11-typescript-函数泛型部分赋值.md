---
layout: blog-post
draft: false
date: 2020-01-11T06:13:29.648Z
title: TypeScript 函数泛型部分赋值
description: 本文聊聊如何用柯里化解决 TypeScript 函数泛型部分赋值的问题。
quote:
  author: Madeline Brewer
  content: 'I''d never wear something that''s too generic. '
  source: ''
tags:
  - TypeScript
---
## 问题

首先，我们知道 TypeScript 很早（2017）前就实现了带默认值的泛型（generic）

```typescript
type Foo<T = number> = T

// $ExpectType number
type T1 = Foo

// $ExpectType string
type T2 = Foo<string>
```

如果我们定义这么一个部分泛型带默认值的类型

```typescript
type Pluck<TObj extends {}, TKey extends keyof TObj = keyof TObj> = TObj[TKey]
```

那么这个默认值是可以被正确推导的

```typescript
type Obj = { a: number, b: string }

// $ExpectType string | number
type Props = Pluck<Obj>

// $ExpectType string
type Prop = Pluck<Obj, 'b'>
```

对于函数来说，TypeScript 允许泛型从参数中推导

```typescript
function identity<T>(arg: T): T {
  return arg
}

const text = identity('text')

// $ExpectType 'text'
typeof text
```

有时如果泛型不在参数中，那么使用时我们就要提供

```typescript
function fetchJSON<TResult>(src: string): Promise<TResult> {
  return fetch(src).then(r => r.json())
}

// $ExpectType Promise<{ result: string }>
fetchJSON<{ result: string }>('http://blog.crimx.com/json')
```

现在问题就来了，如果我们希望只提供部分的泛型，而剩下的泛型可以推导

```typescript
function fetchData<TResult, TKey extends keyof TResult>(
  src: string,
  key: TKey
): Promise<TResult[TKey]> {
  return fetch(src)
    .then(r => r.json())
    .then(json => json[key])
}

// Argument of type '"result"' is not assignable to parameter of type 'never'.ts(2345)
// $ExpectError
fetchData('http://blog.crimx.com/json', 'result')

// Expected 2 type arguments, but got 1.ts(2558)
// $ExpectError
fetchData<{ result: string }>('http://blog.crimx.com/json', 'result')
```

可以看到，如果没有给泛型提供值，那么 `TKey` 会以 `TResult` 定义时的值 `unknown` 进行推导；如果只提供 `TResult` 那么 TypeScript 会要求提供全部值。

这个特性目前依然存在[争议](https://github.com/microsoft/TypeScript/issues/14400)，要求泛型从两个地方进行推导可能会引起混淆。

## 解决

看回我们的问题，其实我们之所以要提供 `TResult` 是为了声明 `fetch` 的结果。我们是做了这两件事

```typescript
fetchJSON<{ result: string }>('http://blog.crimx.com/json')
  .then(json => json[key])
```

可以用柯里化的方式解决

```typescript
function fetchData<TResult>(
  src: string
): <TKey extends keyof TResult>(key: TKey) => Promise<TResult[TKey]> {
  return key =>
    fetch(src)
      .then(r => r.json())
      .then(json => json[key])
}

// $ExpectType Promise<string>
fetchData<{ result: string }>('http://blog.crimx.com/json')('result')
```

其它的应用也可以归类到这个模式，这严格上说不算是“解决”而是“变通”。牺牲运行时来让 ts 编译器满意实在有点膈应，希望未来的读者有缘读到这篇时已经出现了更好的解决方案。

谢谢阅读！
