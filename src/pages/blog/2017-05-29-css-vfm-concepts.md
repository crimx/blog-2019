---
title: CSS VFM 中易混淆的名词概念
tags:
  - CSS
  - Box Model
  - Visual Formatting Model
  - 闲读规范
quote:
  content: 'When your values are clear to you, making decisions becomes easier.'
  author: Roy E. Disney
  source: ''
date: 2017-05-29T12:00:00.000Z
layout: blog-post
description: ''
---

:warning:第一遍看 CSS2.1 VFM（Visual Formatting Model）是看别人整理的[笔记](http://book.mixu.net/css/)，辅助理解很不错，但是在名词概念上作者跳过了一些或者打乱了顺序，所以现在看回文档时发现当初有一些理解不太正确。于是在这篇文章将这些概念系统整理了一遍。

## Element 与 Box

- 第一个概念是 Element （元素）与 Box （盒子）。用 Element 的时候是指 document tree （文档树）的节点，Box 则是指元素根据 VFM 和 Box Model 生成的盒子。一个元素可能生成零个或多个盒子。

- Box Model 描述了一个矩形的盒子。每个盒子都有 content area，可能有 padding, border, margin areas。

![box-model][box-model]

## Block-level Element

- display 值为 'block/list-item/table' 的元素叫 *block-level element*。

- 每个 block-level element 都会生成一个 principal *block-level box* （list-item 还会生成其它盒子）。

- 除了 table box 和 replaced element，block-level box 都是 *block container box*。

  Block container box 要么只包含 block-level boxes （宣布了 BFC），要么只包含 inline-level boxes （宣布了 IFC）。（BFC: Block Formatting Context, IFC: Inline Formatting Context）

  （Block-level box 指的是这个盒子本身，它参与的是 BFC；而 block container box 说的是这个盒子内部，宣布了 BFC 或 IFC）。

  反过来 block container box 则不一定是 block-level box，还可以是 non-replaced inline block 和 non-replaced table cell（即这些盒子参与 IFC ，内部也可以宣布 BFC 或 IFC）。

- 同时是 block-level box 和 block container box 的盒子也叫做 *block box*。

## Inline-level element

- display 值为 'inline/inline-table/inline-block' 的元素叫 *inline-level element*。

- Inline-level element 会生成 *inline-level box*。

- display 为 'inline' 的 non-replaced element 生成的盒子也叫 *inline box*，指其内部参与的与其自身所在的是同个 IFC。

  （同样，Inline-level box 说的是盒子本身，inline box 说的是盒子内部）。

- 不是 inline box 的 inline-level box （如 replaced inline-level element, inline-block element, inline-table element）叫做 *atomic inline-level box*，它们以不透明的方式参与到 IFC 中，内部不参与自身所在的 IFC。

- Inline-level boxes 打横排成一行行的 *line boxes*。

## Flow

- *Out-of-flow* 的元素指 absolutely positioned elements, floated elements 和 root element。

- *In-flow* 指不是 out-of-flow 的元素。

[box-model]:  /img/post/box-model.png

