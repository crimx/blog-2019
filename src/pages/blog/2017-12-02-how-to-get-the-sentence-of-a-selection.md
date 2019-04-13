---
title: 获取选择文本所在的句子
tags:
  - JavaScript
  - Selection
  - Sentence
quote:
  content: 'Do what you can, with what you have, where you are.'
  author: Theodore Roosevelt
  source: ''
date: 2017-12-02T12:00:00.000Z
layout: blog-post
description: ''
---

最近收到一个 [issue](https://github.com/crimx/crx-saladict/issues/12) 期望能在划词的时候同时保存单词的上下文和来源网址。这个功能其实很久之前就想过，但感觉不好实现一直拖延没做。真做完发现其实并不复杂，完整代码在[这里](https://github.com/crimx/crx-saladict/blob/7a9f7048eb267be308a234000b4bf11f65cfdc01/src/helpers/selection.js#L33-L95)，或者继续往下阅读分析。

## 原理分析

### 获取选择文本

通过 `window.getSelection()` 即可获得一个 `Selection` 对象，再利用 `.toString()` 即可获得选择的文本。

### 锚节点与焦节点

在 `Selection` 对象中还保存了两个重要信息，`anchorNode` 和 `focusNode`，分别代表选择产生那一刻的节点和选择结束时的节点，而 `anchorOffset` 和 `focusOffset` 则保存了选择在这两个节点里的偏移值。

这时你可能马上就想到第一个方案：这不就好办了么，有了首尾节点和偏移，就可以获取句子的头部和尾部，再把选择文本作为中间，整个句子不就出来了么。

当然不会这么简单哈:stuck_out_tongue:。

### 强调一下

一般情况下，`anchorNode` 和 `focusNode` 都是 `Text` 节点（而且因为这里处理的是文本，所以其它情况也会直接忽略），可以考虑这种情况：

```html
<strong>Saladict</strong> is awesome!
```

如果选择的是“awesome”，那么 `anchorNode` 和 `focusNode` 都是 ` is awesome!`，所以取不到前面的 “Saladict”。

另外还有嵌套的情况，也是同样的问题。

```html
Saladict is <strong><a href="#">awesome</a></strong>!
```

所以我们还需要遍历兄弟和父节点来获取完整的句子。

### 遍历到哪？

于是接下就是解决遍历边界的问题了。遍历到什么地方为止呢？我的判断标准是：跳过 inline-level 元素，遇到 block-level 元素为止。而判断一个元素是 inline-level 还是 block-level 最准确的方式应该是用 `window.getComputedStyle()`。但我认为这么做太重了，也不需要严格的准确性，所以用了常见的 inline 标签来判断。

```javascript
const INLINE_TAGS = new Set([
  // Inline text semantics
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
])
```

### 原理总结

句子由三块组成，选择文本作为中间，然后遍历兄弟和父节点获取首尾补上。

## 实现

### 选择文本

先获取文本，如果没有则退出

```javascript
const selection = window.getSelection()
const selectedText = selection.toString()
if (!selectedText.trim()) { return '' }
```

### 获取首部

对于 `anchorNode` 只考虑 `Text` 节点，通过 `anchorOffset` 获取选择在 `anchorNode` 的前半段内容。

然后开始补全在 `anchorNode` 之前的兄弟节点，最后补全在 `anchorNode` 父元素之前的兄弟元素。注意后面是元素，这样可以减少遍历的次数，而且考虑到一些被隐藏的内容不需要获取，用 `innerText` 而不是 `textContent` 属性。

```javascript
let sentenceHead = ''
const anchorNode = selection.anchorNode
if (anchorNode.nodeType === Node.TEXT_NODE) {
  let leadingText = anchorNode.textContent.slice(0, selection.anchorOffset)
  for (let node = anchorNode.previousSibling; node; node = node.previousSibling) {
    if (node.nodeType === Node.TEXT_NODE) {
      leadingText = node.textContent + leadingText
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      leadingText = node.innerText + leadingText
    }
  }

  for (
    let element = anchorNode.parentElement;
    element && INLINE_TAGS.has(element.tagName.toLowerCase()) && element !== document.body;
    element = element.parentElement
  ) {
    for (let el = element.previousElementSibling; el; el = el.previousElementSibling) {
      leadingText = el.innerText + leadingText
    }
  }

  sentenceHead = (leadingText.match(sentenceHeadTester) || [''])[0]
}
```

最后从提取句子首部用的正则是这个

```javascript
// match head                 a.b is ok    chars that ends a sentence
const sentenceHeadTester = /((\.(?![ .]))|[^.?!。？！…\r\n])+$/
```

前面的 `((\.(?![ .]))` 主要是为了跳过 `a.b` 这样的特别是在技术文章中常见的写法。

### 获取尾部

跟首部同理，换成往后遍历。最后的正则保留了标点符号

```javascript
// match tail                                                    for "..."
const sentenceTailTester = /^((\.(?![ .]))|[^.?!。？！…\r\n])+(.)\3{0,2}/
```

## 压缩换行

拼凑完句子之后压缩多个换行为一个空白行，以及删除每行开头结尾的空白符

```javascript
return (sentenceHead + selectedText + sentenceTail)
  .replace(/(^\s+)|(\s+$)/gm, '\n') // allow one empty line & trim each line
  .replace(/(^\s+)|(\s+$)/g, '') // remove heading or tailing \n
```

## 完整代码

```javascript
const INLINE_TAGS = new Set([
  // Inline text semantics
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
])

/**
* @returns {string}
*/
export function getSelectionSentence () {
  const selection = window.getSelection()
  const selectedText = selection.toString()
  if (!selectedText.trim()) { return '' }

  var sentenceHead = ''
  var sentenceTail = ''

  const anchorNode = selection.anchorNode
  if (anchorNode.nodeType === Node.TEXT_NODE) {
    let leadingText = anchorNode.textContent.slice(0, selection.anchorOffset)
    for (let node = anchorNode.previousSibling; node; node = node.previousSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        leadingText = node.textContent + leadingText
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        leadingText = node.innerText + leadingText
      }
    }

    for (
      let element = anchorNode.parentElement;
      element && INLINE_TAGS.has(element.tagName.toLowerCase()) && element !== document.body;
      element = element.parentElement
    ) {
      for (let el = element.previousElementSibling; el; el = el.previousElementSibling) {
        leadingText = el.innerText + leadingText
      }
    }

    sentenceHead = (leadingText.match(sentenceHeadTester) || [''])[0]
  }

  const focusNode = selection.focusNode
  if (selection.focusNode.nodeType === Node.TEXT_NODE) {
    let tailingText = selection.focusNode.textContent.slice(selection.focusOffset)
    for (let node = focusNode.nextSibling; node; node = node.nextSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        tailingText += node.textContent
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        tailingText += node.innerText
      }
    }

    for (
      let element = focusNode.parentElement;
      element && INLINE_TAGS.has(element.tagName.toLowerCase()) && element !== document.body;
      element = element.parentElement
    ) {
      for (let el = element.nextElementSibling; el; el = el.nextElementSibling) {
        tailingText += el.innerText
      }
    }

    sentenceTail = (tailingText.match(sentenceTailTester) || [''])[0]
  }

  return (sentenceHead + selectedText + sentenceTail)
    .replace(/(^\s+)|(\s+$)/gm, '\n') // allow one empty line & trim each line
    .replace(/(^\s+)|(\s+$)/g, '') // remove heading or tailing \n
}
```

【完】

