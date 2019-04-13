---
title: 选中鼠标附近的文字
tags:
  - JavaScript
  - Recommended
quote:
  content: >-
    Your mind will answer most questions if you learn to relax and wait for the
    answer.
  author: William S. Burroughs
  source: ''
date: 2018-06-22T12:00:00.000Z
layout: blog-post
description: ''
---


最近终于抽空给 Saladict 实现了鼠标悬浮取词功能，使用了较为简洁的实现方式，这里分享一下原理以及坑的处理。


## 初尝试

这个需求其实很早就被人提 issue 了，当时做了一番搜索，最后尝试了 `document.caretPositionFromPoint` / `document.caretRangeFromPoint` ，效果不太理想。

如果看 mdn 给的[例子](https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot/caretPositionFromPoint)，就会发现，它是遍历每个元素添加事件的。这么做的原因是当使用这个方法的时候，如果鼠标指向元素空白的地方，它会就近取位置。所以例子通过给粒度更细的元素绑定来避免这个问题。然而实际上这么做还是不足够的，一个段落末行也许只有几个字符，这时空出接近一行，也会有上面的问题。

所以当时就搁置了这个功能。


## 灵感

直到最近，看到一个同类的开源划词翻译扩展 [FairyDict](https://github.com/revir/FairyDict) 实现了取词功能，遍观摩了一番[源码](https://github.com/revir/FairyDict/blob/30e12d426b9eb190142003732cdfb0d2aa64eb66/content/inject.coffee#L110-L141)。

它的原理是深度优先递归遍历这个元素以及其子元素，通过不断试探选中区域，并与鼠标座标对比来定位确切位置。

有没有发现问题，这个遍历过程不正是上面 `document.caretPositionFromPoint` 干的事么，那么我们只需要最后量一下鼠标是否在取词范围中即可。


## 原理

现在总结一下原理：

1. 通过 `document.caretPositionFromPoint` 获得鼠标所指最接近的元素以及文本位置 offset。
2. 找出 offset 最接近的单词。
3. 通过 [`Range`](https://developer.mozilla.org/en-US/docs/Web/API/Range) 获得部分文本（单词）的尺寸和座标。
4. 验证鼠标此时在单词区域范围中。
5. 选中这个单词。`Selection` 支持直接添加 `Range` 。


## 实现

按原理来实现就很简单了。[本文](https://blog.crimx.com/select-cursor-word)上按 <kbd>alt</kbd> 可体验取词效果。

```javascript
/**
 * @param {MouseEvent} e
 * @returns {void}
 */
function selectCursorWord (e) {
  const x = e.clientX
  const y = e.clientY

  let offsetNode
  let offset

  const sel = window.getSelection()
  sel.removeAllRanges()

  if (document['caretPositionFromPoint']) {
    const pos = document['caretPositionFromPoint'](x, y)
    if (!pos) { return }
    offsetNode = pos.offsetNode
    offset = pos.offset
  } else if (document['caretRangeFromPoint']) {
    const pos = document['caretRangeFromPoint'](x, y)
    if (!pos) { return }
    offsetNode = pos.startContainer
    offset = pos.startOffset
  } else {
    return
  }

  if (offsetNode.nodeType === Node.TEXT_NODE) {
    const textNode = offsetNode
    const content = textNode.data
    const head = (content.slice(0, offset).match(/[-_a-z]+$/i) || [''])[0]
    const tail = (content.slice(offset).match(/^([-_a-z]+|[\u4e00-\u9fa5])/i) || [''])[0]
    if (head.length <= 0 && tail.length <= 0) {
      return
    }

    const range = document.createRange()
    range.setStart(textNode, offset - head.length)
    range.setEnd(textNode, offset + tail.length)
    const rangeRect = range.getBoundingClientRect()

    if (rangeRect.left <= x &&
        rangeRect.right >= x &&
        rangeRect.top <= y &&
        rangeRect.bottom >= y
    ) {
      sel.addRange(range)
    }

    range.detach()
  }
}
```

## 交互

最后，如果要提供功能开关或者设置不同按键的话，简单的处理可以参考 FairyDict 让事件处理空转。但对于 `mousemove` 这类比较频繁的事件，在关闭的时候取消事件监听可能更好一些。这里 Saladict 借助 RxJS 来处理复杂的逻辑，可参考[源码](https://github.com/crimx/ext-saladict/blob/ca0d8a1e58ef56277f2f0b3df4a291d4f2a0debc/src/selection/index.ts#L185-L232)。

<script type="text/javascript">
  document.addEventListener('mousemove', e => {
    if (e.altKey) {
      selectCursorWord(e)
    }
  }, true)

  function selectCursorWord (e) {
    const x = e.clientX
    const y = e.clientY

    let offsetNode
    let offset

    const sel = window.getSelection()
    sel.removeAllRanges()

    if (document['caretPositionFromPoint']) {
      const pos = document['caretPositionFromPoint'](x, y)
      if (!pos) { return }
      offsetNode = pos.offsetNode
      offset = pos.offset
    } else if (document['caretRangeFromPoint']) {
      const pos = document['caretRangeFromPoint'](x, y)
      if (!pos) { return }
      offsetNode = pos.startContainer
      offset = pos.startOffset
    } else {
      return
    }

    if (offsetNode.nodeType === Node.TEXT_NODE) {
      const textNode = offsetNode
      const content = textNode.data
      const head = (content.slice(0, offset).match(/[-_a-z]+$/i) || [''])[0]
      const tail = (content.slice(offset).match(/^([-_a-z]+|[\u4e00-\u9fa5])/i) || [''])[0]
      if (head.length <= 0 && tail.length <= 0) {
        return
      }

      const range = document.createRange()
      range.setStart(textNode, offset - head.length)
      range.setEnd(textNode, offset + tail.length)
      const rangeRect = range.getBoundingClientRect()

      if (rangeRect.left <= x &&
          rangeRect.right >= x &&
          rangeRect.top <= y &&
          rangeRect.bottom >= y
      ) {
        sel.addRange(range)
      }

      range.detach()
    }
  }
</script>

