---
layout: blog-post
draft: false
date: 2017-12-02T12:00:00.000Z
title: 获取选择文本所在的段落和句子
description: 本文聊聊如何获取选词的上下文。
quote:
  author: Theodore Roosevelt
  content: 'Do what you can, with what you have, where you are.'
  source: ''
tags:
  - JavaScript
  - Selection
---

最近收到一个 [issue](https://github.com/crimx/crx-saladict/issues/12) 期望能在划词的时候同时保存单词的上下文和来源网址。这个功能其实很久之前就想过，但感觉不好实现一直拖延没做。真做完发现其实并不复杂,但有些小坑。完整代码已作为单独项目发布 [get-selection-more](https://github.com/crimx/get-selection-more)，对原理感兴趣欢迎继续往下阅读。

## 获取选择文本

通过 `window.getSelection()` 即可获得一个 `Selection` 对象，再利用 `.toString()` 即可获得选择的文本。

### 火狐坑

在 Firefox 中，`input` 和 `textarea` 里的选词是不能通过 `window.getSelection` 获取的，只能通过 `document.activeElement`。

## 锚节点与焦节点

在 `Selection` 对象中还保存了两个重要信息，`anchorNode` 和 `focusNode`，分别代表选择产生那一刻的节点和选择结束时的节点，而 `anchorOffset` 和 `focusOffset` 则保存了选择在这两个节点里的偏移值。

这时你可能马上就想到第一个方案：这不就好办了么，有了首尾节点和偏移，就可以获取句子的头部和尾部，再把选择文本作为中间，整个句子不就出来了么。

当然不会这么简单哈😜。

### 跨元素坑

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

### 反向选坑

通过开始和结束节点来计算有个非常棘手的问题，如果用户是反方向选的词，那么开始节点会在结束节点的后方，我们需要反过来拼接。但如何知道是反方向呢？我们只能通过偏移值以及计算元素位置来判断，这就有点麻烦了。

可以看到，通过开始结束节点不好计算，我们再看看有什么可用的属性。

## Range

注意到 `Selection` 对象中还有一个 `getRangeAt` 方法。这个方法可以获取一个 `Range` 对象。`Range` 装的是文档片段，可以包含文本节点中的一部分。

我们通过 `Range.startContainer` 和 `Range.endContainer` 可以获得 range 开始和结束的节点，通过 `Range.startOffset` 和 `Range.endOffset` 获得 range 在节点的偏移值。

这里的前后节点不会受用户选词方向影响，所以我们无需再做判断。

## 获取段落

拿到选词范围后我们还是得遍历找到前后的段落。

于是接下便是解决遍历边界的问题了。遍历到什么地方为止呢？我的判断标准是：跳过 inline-level 元素，遇到 block-level 元素为止。而判断一个元素是 inline-level 还是 block-level 最准确的方式应该是用 `window.getComputedStyle()`。但我认为这么做太重了，也不需要严格的准确性，所以用了常见的 inline 标签来判断。

```typescript
function isInlineNode(node?: Node | null): node is Node {
  if (!node) {
    return false
  }

  switch (node.nodeType) {
    case Node.TEXT_NODE:
    case Node.COMMENT_NODE:
    case Node.CDATA_SECTION_NODE:
      return true
    case Node.ELEMENT_NODE: {
      switch ((node as HTMLElement).tagName) {
        case 'A':
        case 'ABBR':
        case 'B':
        case 'BDI':
        case 'BDO':
        case 'BR':
        case 'CITE':
        case 'CODE':
        case 'DATA':
        case 'DFN':
        case 'EM':
        case 'I':
        case 'KBD':
        case 'MARK':
        case 'Q':
        case 'RP':
        case 'RT':
        case 'RTC':
        case 'RUBY':
        case 'S':
        case 'SAMP':
        case 'SMALL':
        case 'SPAN':
        case 'STRONG':
        case 'SUB':
        case 'SUP':
        case 'TIME':
        case 'U':
        case 'VAR':
        case 'WBR':
          return true
      }
    }
  }
  return false
}
```

## 获得句子

获得选词所在句子我们需要在获取选词前后段落合并前通过正则匹配出句子在选词的前后部分。

### 点号坑

我们通过标点符号来判断一个句子结束的位置。这里需要注意 `a.b` 在编程的文章中十分常见，所以我们在这里不看作是句子的结束。

```javascript
// match head                 a.b is ok    chars that ends a sentence
const sentenceHeadTester = /((\.(?![ .]))|[^.?!。？！…\r\n])+$/

// match tail                                                       for "..."
const tailMatch = /^((\.(?![\s.?!。？！…]))|[^.?!。？！…])*([.?!。？！…]){0,3}/
```

### 回溯坑

如果通过正则匹配前半部分，这里有个严重的性能问题。因为正则只能左往右匹配，随着段落前半部分的长度增加，匹配不成功回溯的复杂度也在增加。遇上非常长的段落（如一些滥用标签的网站）性能损耗甚至肉眼可见。

故我们只好手动从右往左遍历一个个地匹配：

```typescript
function extractSentenceHead(leadingText: string): string {
  // split regexp to prevent backtracking
  if (leadingText) {
    const puncTester = /[.?!。？！…]/
    /** meaningful char after dot "." */
    const charTester = /[^\s.?!。？！…]/

    for (let i = leadingText.length - 1; i >= 0; i--) {
      const c = leadingText[i]
      if (puncTester.test(c)) {
        if (c === '.' && charTester.test(leadingText[i + 1])) {
          // a.b is allowed
          continue
        }
        return leadingText.slice(i + 1)
      }
    }
  }
  return leadingText
}
```

## 最后

获取前后部分之后只需简单拼接即可得到完整的上下文。

可以看到当中还是有不少小坑，所以不建议再造轮子， [get-selection-more](https://github.com/crimx/get-selection-more) 经过 Chrome 和 Firefox 测试，相对更靠谱些。

