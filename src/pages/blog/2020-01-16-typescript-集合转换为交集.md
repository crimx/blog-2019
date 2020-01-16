---
layout: blog-post
draft: false
date: 2020-01-16T09:30:25.409Z
title: TypeScript 集合转换为交集
description: 本文深入聊聊 TypeScript 的一些高级特性，以实现集合转换为交集为主线。
quote:
  author: Oscar Wilde
  content: I am not young enough to know everything.
  source: ''
tags:
  - TypeScript
---
## Object Assign

开始之前我们先来看看 `lib` 中 `Object.assign` 的类型是如何定义的

```typescript
assign<T, U>(target: T, source: U): T & U;
assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;
assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
assign(target: object, ...sources: any[]): any;
```

意不意外，惊不惊喜。硬编码重载了三种情况，那么超过四个对象之后我们只能得到 `any`。

这是由于 TypeScript 的局限性导致的，当然现在 TypeScript 也没有正式解决这个问题，但我们其实已经可以通过 2.8 以后引入的一些特性来 hack 掉这个问题。

## Intersection From Union

```typescript
type MapTopParameter<U> = U extends any ? (arg: U) => void : never
type IntersectionFromUnion<U> =
  MapTopParameter<U> extends (arg: infer T) => void ? T : never

type A = { a: 1 }
type B = { b: 2 }
type C = { c: 2 }

// $ExpectType A & B & C
type Result = IntersectionFromUnion<A | B | C>
```

要理解这个 hack 需要明白 TypeScript 2.8 引入的两个特性：条件类型（Conditional Types）以及条件类型推导（Type inference in conditional types）。

## 条件类型

条件类型可以让我们对类型进行三元运算，根据不同情况返回不同类型

```typescript
T extends U ? X : Y
```

但与普通编程语言的三元运算不一样，TypeScript 中还有这么一个特性，叫分布式条件类型（Distributive Conditional Types）。

当 `T` 是一个集合（Union）的时候，三元运算是对集合中每个元素进行运算，而不是对 `T` 这个整体进行运算。可以类比为数组中的 `map`，对集合进行映射，这相当于往类型系统中加入了遍历功能，并且结合 `never` 也得到了 `filter` 的功能。

所以现在 TypeScript 类型系统中有了变量（泛型）、条件控制、循环控制，越来越像一门编程语言了……

利用这个特性，我们看回

```typescript
type MapTopParameter<U> = U extends any ? (arg: U) => void : never
```

这里是将集合 `U` 映射为另外一个以 `U` 元素为参数的函数集合。

```typescript
// $ExpectType ((arg: number) => void) | ((arg: 'blog.crimx.com') => void)
type Result = MapTopParameter<number | 'blog.crimx.com'>
```

这么做有什么用呢，我们接着看。

## 条件类型推导

条件类型推导其实是一种简单的模式匹配，可以类比为正则表达式。

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

这里可以理解为，我们给出了 `(...args: any[]) => infer R` 这个模板，然后让 `T` 套这个模板，收集 `R` 的部分，如这里是收集函数返回的类型。

再结合前面的分布式条件类型，如果 `T` 是一个集合，那么最后收集的则是各项返回值的集合。

```typescript
// $ExpectType number | 'blog.crimx.com'
type Result = ReturnType<((arg: string) => number) | (() => 'blog.crimx.com')>
```

有趣的地方来了，如果我们推导的是函数的参数呢？

```typescript
type Parameter<T> = T extends (arg: infer P) => any ? P : any
```

其实也是一样，最后我们会得到一个参数的集合。

```typescript
type A = { a: number }
type B = { b: 'blog.crimx.com' }

// $ExpectType A | B
type Result = Parameter<((arg: A) => void) | ((arg: B) => void)>
```

但是！如果我们能想办法阻止这个分布式条件类型，让 `T` 集合作为一个整体去判断， 这时候表达的是 `T` 集合中的每一个元素都可以作为 `(arg: infer P) => any` 的参数使用，也就是说 `P` 应该是 `T` 中每个元素的父类，故 P 最后会得到 `T` 所有元素的交集（Intersection）。

怎么才能达到这个效果呢？

## 无封装类型参数

让一个类型成为分布式条件类型其实有一个前提，这个类型必须是无封装的类型参数（naked type parameter），即这个类型推导完成后不能是依然包在其它类型中。

所以我们简单修改一下

```typescript
type Parameter<T> = [T] extends [(arg: infer P) => any] ? P : any

type A = { a: number }
type B = { b: 'saladict.app' }

// $ExpectType A & B
type Result = Parameter<((arg: A) => void) | ((arg: B) => void)>
```

成功得到交集了！

当然对于前面的实现我们无需这么做，因为 `MapTopParameter` 已经是一层封装。

```typescript
type MapTopParameter<U> = U extends any ? (arg: U) => void : never
type IntersectionFromUnion<U> =
  MapTopParameter<U> extends (arg: infer T) => void ? T : never
```

或者写在一起（略丑）

```typescript
export type IntersectionFromUnion<TUnion> = (TUnion extends any
  ? (arg: TUnion) => void
  : never) extends (arg: infer TArg) => void
    ? TArg
    : never
```

## 元组转集合

这是一个很多人不知道的小特性，将一个元组（tuple）转换为集合。

```typescript
type tuple = [boolean, 'blog.crimx.com', number]

// $ExpectType number | boolean | "blog.crimx.com"
type union = tuple[number]
```

## 现代版 Object Assign

最后结合 TypeScript 3.0 加入的 rest 参数，我们定义一个现代版 `Object.assign`

```typescript
function objectAssign<TTarget extends object, TSources extends any[]>(
  target: TTarget,
  ...sources: TSources
): IntersectionFromUnion<TTarget | TSources[number]> {
  return Object.assign(target, ...sources)
}

const a = objectAssign({ a: 1 }, { b: 2 }, { c: 3 })
// $ExpectType { a: number } & { b: number } & { c: number }
type A = typeof a
```

## 最后

通过本文例子的讲解希望能帮助大家深入了解 TypeScript 的一些高级特性，如果有什么感想或问题欢迎留言。

谢谢阅读！
