---
title: CSS 属性值计算
tags:
  - CSS
  - Box Model
  - Visual Formatting Model
  - 闲读规范
quote:
  content: There is nothing permanent except change.
  author: Heraclitus
  source: ''
date: 2017-07-03T12:00:00.000Z
layout: blog-post
description: ''
---

属性值的计算可谓是 CSS 101 。然而入门资料从来都是良莠不齐的，当初从畅销书上得来的一些误解，如今整理笔记的时候才发现。这里就结合规范梳理一遍。

一个属性的值在计算时会经过 4 个阶段

1. Specified values
2. Computed values
3. Used values
4. Actual values

## Specified values

这里有 3 种可能，满足一种就可以

- 计算 cascade 有结果
- 否则，若这个值可以继承，继承父元素的 computed value（根元素除外）
- 还是没有，则用默认值

### 计算 cascade

这里就是重点，经历 4 个步骤：

1. 匹配 Media Type 的筛选
2. 按来源排序（低到高）
   1. user agent declarations
   2. user normal declarations
   3. author normal declarations
   4. author important declarations
   5. user important declarations
3. 同个来源的按权值（specificity）排序，收集选择器里的属性个数比较
   - "style" 属性（attribute）里的属性 * 1000
   - ID 属性 * 100
   - 其它属性、类、伪类 * 10
   - 元素名、伪元素 * 1
4. 如果前面得出并列结果，则按位置排序
   - 越靠后越高
   - import 进来的样式看做在本样式表前面

可以看到来源总共有三个，user agent、user 和 author。User important 最高是因为用户的自定义样式一般是为了覆盖 user agent 作为默认样式，但有时候用户也想覆盖 author 即网站本身的样式，于是让 user important 最高。

注意 `<style>` 与 `<link>` 引入的 CSS 同属 author declarations 也就是说两者的等级是**一样的**，按先后顺序覆盖。

HTML 里若有非 CSS 的样式属性（presentational attributes），比如 font 之类，UA 可能将其翻译为 CSS 属性，放在 author style sheet 开端，并赋予权值 0。

## Computed values

在排版前就可以确定的值。在元素定义的 Computed Value 区域可以查到，如

- URI 计算绝对路径
- 'em' 和 'ex' 计算成 px 或绝对长度。

比如

```css
body { font-size: 10px; }
h1 { font-size: 120%; }
```

h1 先计算 cascade 按继承得到了 10px ，再在本阶段计算得 12px。

## Used values

排版之后才能确定的值，如百分比宽度，必须排版才能知道父容器宽度。

## Actual values

实际用于渲染的值，由于设备环境等因素，一些值可能不能用，需要作出变化。

