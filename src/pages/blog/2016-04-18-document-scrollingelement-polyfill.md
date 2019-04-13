---
title: 闲读源码：ScrollingElement Polyfill
tags:
  - 闲读源码
  - JavaScript
  - Browser
  - Polyfill
  - 闲读规范
quote:
  content: ''
  author: ''
  source: ''
date: 2016-04-18T12:00:00.000Z
layout: blog-post
description: ''
---


今天看了[这篇文章](https://imququ.com/post/document-scrollingelement-in-chrome.html)，讲到 WebKit `document.body.scrollTop` 的问题。还有这里 [Dev.Opera Blog : Fixing the scrollTop bug](https://dev.opera.com/articles/fixing-the-scrolltop-bug/)。

`scrollTop`, `scrollLeft`, `scrollWidth`, `scrollHeight` 都是跟滚动相关的属性。设置 `scrollTop` 和 `scrollLeft` 还可以产生滚动。当这些属于用在根元素的时候，滚动是发生在 viewport 的。

但是 WebKit/Blink 不走寻常路，它会一直让 `body` 来代替 viewport 滚动。所以根元素会一直返回 0，对它设值也不会有反应。


文章里面提到了几种处理方式，其中一种方式就是利用一个比较新的属性 `document.scrollingElement`，它会返回合适的滚动元素，就不用纠结是哪个。

[document.scrollingElement polyfill](https://github.com/mathiasbynens/document.scrollingElement/blob/master/scrollingelement.js) 是它的一个 fallback，看起来很有趣，就细读了一遍。

## 规范

要理解源码必须先看它要干什么，[CSSOM View](https://drafts.csswg.org/cssom-view/#dom-document-scrollingelement) specification 提到：

> The scrollingElement attribute, on getting, must run these steps:
> 
> 1. If the Document is in quirks mode, follow these substeps:
> 
>    1. If the HTML body element exists, and it is not potentially scrollable, return the HTML body element and abort these steps.
>    2. Return null and abort these steps.
> 
> 2. If there is a root element, return the root element and abort these steps.
> 
> 3. Return null.

> > Note: For non-conforming user agents that always use the quirks mode behavior for scrollTop and scrollLeft, the scrollingElement attribute is expected to also always return the HTML body element (or null if it does not exist). This API exists so that Web developers can use it to get the right element to use for scrolling APIs, without making assumptions about a particular user agent’s behavior or having to invoke a scroll to see which element scrolls the viewport.

这个 polyfill 干的事情就是在 Standards Mode 情况下如果正确实现规范的话就返回根元素，其它情况下返回 `body`（不一定是 `document` 的哦，后面会提到）。

## 入口

整体来看，没有实现 `scrollingElement` 的才会调用 polyfill：

```javascript
if (!('scrollingElement' in document)) (function() {
  // ...
}());
```

然后从这里开始：

```javascript
if (Object.defineProperty) {
  // Support modern browsers that lack a native implementation.
  Object.defineProperty(document, 'scrollingElement', {
    'get': scrollingElement
  });
} else if (document.__defineGetter__) {
  // Support Firefox ≤ 3.6.9, Safari ≤ 4.1.3.
  document.__defineGetter__('scrollingElement', scrollingElement);
} else {
  // IE ≤ 4 lacks `attachEvent`, so it only gets this one assignment. IE ≤ 7
  // gets it too, but the value is updated later (see `propertychange`).
  document.scrollingElement = scrollingElement();
  document.attachEvent && document.attachEvent('onpropertychange', function() {
    // This is for IE ≤ 7 only.
    // A `propertychange` event fires when `<body>` is parsed because
    // `document.activeElement` then changes.
    if (window.event.propertyName == 'activeElement') {
      document.scrollingElement = scrollingElement();
    }
  });
}
```

规范里 `scrollingElement` 是一个变量。通过 `defineProperty` 就可以让一个变量在获取的时候（也就是 `get` 的时候）调用函数，动态计算值。


[这里](https://github.com/mathiasbynens/document.scrollingElement/blob/master/scrollingelement.js#L78)就是主入口：

```javascript
var scrollingElement = function() {
  if (isCompliant()) {
    return document.documentElement;
  }
  var body = document.body;
  // Note: `document.body` could be a `frameset` element, or `null`.
  // `tagName` is uppercase in HTML, but lowercase in XML.
  var isFrameset = body && !/body/i.test(body.tagName);
  body = isFrameset ? getNextBodyElement(body) : body;
  // If `body` is itself scrollable, it is not the `scrollingElement`.
  return body && isScrollable(body) ? null : body;
};
```

正确实现规范的话就是返回根元素 `document.documentElement`，比如 HTML 里的 `<html>`，否则返回 `body`。

## isCompliant

这里就是先判断浏览器有没有正确实现了规范。看看怎么判断的：

```javascript
// Note: standards mode / quirks mode can be toggled at runtime via
// `document.write`.
var isCompliantCached;
var isCompliant = function() {
  var isStandardsMode = /^CSS1/.test(document.compatMode);
  if (!isStandardsMode) {
    // In quirks mode, the result is equivalent to the non-compliant
    // standards mode behavior.
    return false;
  }
  if (isCompliantCached === void 0) {
    // When called for the first time, check whether the browser is
    // standard-compliant, and cache the result.
    var iframe = document.createElement('iframe');
    iframe.style.height = '1px';
    (document.body || document.documentElement || document).appendChild(iframe);
    var doc = iframe.contentWindow.document;
    doc.write('<!DOCTYPE html><div style="height:9999em">x</div>');
    doc.close();
    isCompliantCached = doc.documentElement.scrollHeight > doc.body.scrollHeight;
    iframe.parentNode.removeChild(iframe);
  }
  return isCompliantCached;
};
```

:white_check_mark: `document.compatMode` 是用来判断浏览器是 Standards Mode 还是 Quirks Mode，分别取值为 `CSS1Compat` 和 `BackCompat`。

作者也说了 `document.write` 可以在运行时修改模式，所以每次都要判断一遍。

然后就用一个 iframe 来测试了，哇蛮重的。好处只能说是通用了。

Standards Mode 下根元素的 `scrollHeight` 比 `body` 高就可以说明正确的实现了规范。

因为这么重所以测试了一遍之后就把结果存起来了，以后就直接用。

:white_check_mark: 从这里也对 `document.body` 有了[新的认识](https://developer.mozilla.org/en-US/docs/Web/API/Document/body)：

> Returns the `<body>` or `<frameset>` node of the current document, or null if no such element exists.

`<frameset>` 这种过时的东西没什么兴趣深入了解，直接看看怎么获取 `body` 的：

## Body

```javascript
function isBodyElement(element) {
  // The `instanceof` check gives the correct result for e.g. `body` in a
  // non-HTML namespace.
  if (window.HTMLBodyElement) {
    return element instanceof HTMLBodyElement;
  }
  // Fall back to a `tagName` check for old browsers.
  return /body/i.test(element.tagName);
}

function getNextBodyElement(frameset) {
  // We use this function to be correct per spec in case `document.body` is
  // a `frameset` but there exists a later `body`. Since `document.body` is
  // a `frameset`, we know the root is an `html`, and there was no `body`
  // before the `frameset`, so we just need to look at siblings after the
  // `frameset`.
  var current = frameset;
  while (current = current.nextSibling) {
    if (current.nodeType == 1 && isBodyElement(current)) {
      return current;
    }
  }
  // No `body` found.
  return null;
}
```

通过 `nextSibling` 循环排查跳过一个个 `frameset`。`nodeType == 1` 表示 `Node.ELEMENT_NODE`，这个节点是个元素。

:white_check_mark: 通过 `element instanceof window.HTMLBodyElement` 可以正确判断 `body` 元素。

## isScrollable

找到了 `body` 接下来就看 `isScrollable` 干了什么：

```javascript
function isScrollable(body) {
  // A `body` element is scrollable if `body` and `html` both have
  // non-`visible` overflow and are both being rendered.
  var bodyStyle = computeStyle(body);
  var htmlStyle = computeStyle(document.documentElement);
  return bodyStyle.overflow != 'visible' && htmlStyle.overflow != 'visible' &&
    isRendered(bodyStyle) && isRendered(htmlStyle);
}
```

基本就是看看它的 CSS 属性，如果 `overflow` 不是 `visible` 且这个元素被渲染了的话，就属于可滚动的。

这里就有了一个疑问，`overflow` 是 `hidden` 也算可滚动的吗？看了一下 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)，发现这么一段话：

> **Note**: When programmatically setting scrollTop on the relevant HTML element, even when overflow has the hidden value an element may still need to scroll.

:white_check_mark: 所以 `overflow` 是 `hidden` 也是可滚动的。

### window.getComputedStyle

然后就是这个 `computeStyle`：

```javascript
function computeStyle(element) {
  if (window.getComputedStyle) {
    // Support Firefox < 4 which throws on a single parameter.
    return getComputedStyle(element, null);
  }
  // Support Internet Explorer < 9.
  return element.currentStyle;
}
```

:white_check_mark: `window.getComputedStyle()` 与 `HTMLElement.style` 不一样在于前者可以动态得到元素所有的 CSS 属性，包括默认的值，而后者只能得到 *inline* CSS 属性。但前者是只读的，后者可以设值。

### isRendered

然后再看 `isRendered` 怎么判断：

```javascript
function isRendered(style) {
  return style.display != 'none' && !(style.visibility == 'collapse' &&
    /^table-(.+-group|row|column)$/.test(style.display));
}
```

看来这位作者不太用严格等号和不等号。`display`这个好理解，`none`的元素不会被渲染出来。后面的就有点绕，要理解这个判断需要明白 `visibility` 的[三个取值](https://developer.mozilla.org/en-US/docs/Web/CSS/visibility)：

> * **visible**
>   Default value, the box is visible.

> * **hidden**
>   The box is invisible (fully transparent, nothing is drawn), but still affects layout.  Descendants of the element will be visible if they have visibility:visible (this doesn't work in IE up to version 7).
> 
> * **collapse**
>   For table rows, columns, column groups, and row groups the row(s) or column(s) are hidden and the space they would have occupied is removed (as if display: none were applied to the column/row of the table). However, the size of other rows and columns is still calculated as though the cells in the collapsed row(s) or column(s) are present. This was designed for fast removal of a row/column from a table without having to recalculate widths and heights for every portion of the table. For XUL elements, the computed size of the element is always zero, regardless of other styles that would normally affect the size, although margins still take effect. For other elements, collapse is treated the same as hidden.

前两个比较常见，`hidden` 依然是占位置的所以属于渲染。

:white_check_mark: `collapse` 是专门为表格行列元素快速隐藏做优化的，对它们来说效果等同于 `display: none`，所以会影响滚动高度。

于是后半段代码相当于找出下面几种元素，然后看是不是 `collapse` 的：

```css
display: table-column;
display: table-column-group;
display: table-footer-group;
display: table-header-group;
display: table-row;
display: table-row-group;
```

# 总结

可以看到这个 polyfill 代码虽然不算太长，但也干了很多事情，算是比较重的。但考虑到还在用老浏览器的人，能用就很给面子了是吧哈哈。从中也学了许多新知识，都打钩了注意到了吗 :smile: 。

