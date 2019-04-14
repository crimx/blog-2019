---
title: 定位与拖动 iframe
tags:
  - Recommended
  - iframe
  - JavaScript
  - postMessage
  - Drag
  - Extension
quote:
  content: >-
    Drag your thoughts away from your troubles... by the ears, by the heels, or
    any other way you can manage it.
  author: Mark Twain
  source: ''
date: 2017-04-06T12:00:00.000Z
layout: blog-post
description: ''
---

# 定位 iframe

在写一个划词翻译扩展 [Saladict](http://www.crimx.com/crx-saladict/) 时，有一个需求：用户选择一段文本之后，会在鼠标附近显示一些元素。

这个初看很简单，监听一个 `mouseup` 事件，获取 `clientX` 和 `clientY` 就行。这也是 Saladict 前几版用的方法。

但这个方法有个缺陷：iframe 里的鼠标事件不会传到父窗口上。

解决方法也很简单，就难在把它们都联系起来。

## iframe 里插入脚本

在 `manifest.json` 里，`content_scripts` 有个选项 `all_frames`，可以让脚本插入到所有的 frame 里。

```json
{
  "content_scripts": [
    {
      "js": ["selection.js"],
      "matches": ["<all_urls>"],
      "all_frames": true
    }
  ]
}
```

## 检测点击

现在可以检测 iframe 里的点击事件

```javascript
// selection.js
document.addEventListener('mouseup', handleMouseUp)
```

## 上传坐标

当点击发生在 iframe 里时，获取的坐标是相对于 iframe 窗口的，所以把这个坐标交给上层，再加上 iframe 本身的坐标，就可以算出点击相对上层的坐标。

Chrome 里可以放心使用 `postMessage`

```javascript
// selection.js
function handleMouseUp (evt) {
  if (window.parent === window) {
    // 到了顶层
    doAwesomeThings(evt.clientX，evt.clientY)
  } else {
    // 把坐标传上去
    window.parent.postMessage({
      msg: 'SALADICT_CLICK',
      mouseX: evt.clientX,
      mouseY: evt.clientY
    }, '*')
  }
}
```

## 计算偏移

上层怎么知道是哪个 iframe 传来坐标？很简单，`message` 事件里携带了 iframe 的 `window`，对比一下就可以。

```javascript
// selection.js
window.addEventListener('message', evt => {
  if (evt.data.msg !== 'SALADICT_CLICK') { return }

  let iframe = Array.from(document.querySelectorAll('iframe'))
    .filter(f => f.contentWindow === evt.source)
    [0]
  if (!iframe) { return }

  // 计算偏移
  let pos = iframe.getBoundingClientRect()
  let mouseX = evt.data.mouseX + pos.left
  let mouseY = evt.data.mouseY + pos.top

  if (window.parent === window) {
    // 顶层
    doAwesomeThings(mouseX, mouseY)
  } else {
    // 继续上传
    window.parent.postMessage({
      msg: 'SALADICT_CLICK',
      mouseX,
      mouseY
    }, '*')
  }
})
```

# 拖动 iframe

Saladict 另外一个需求就是拖动一个 iframe 查词面板。

## 实现拖动的常识

实现拖动的一种常用方式就是检测 `mousedown`, `mousemove` 和 `mouseup`。分别对应开始、拖动、结束。然后计算偏移值应用到 `left` 和 `top` 上。

第一次实现很容易犯的一个错误就是监听元素本身的 `mousemove`。当然这个也可以正确计算出偏移，问题在于如果鼠标移动稍快超出了元素，拖动就卡掉了。所以应该监听全局的 `mousemove` 获取偏移值。

## iframe 特色的拖动

iframe 的拖动同理，只是因为发生在 iframe 里的事件不能传到上层，需要手动打包一下。

## iframe 部分

拖动由 iframe 里的某个元素触发，为了节省资源，在触发的时候才监听拖动和结束，并在结束的时候解绑。

在 iframe 里监听 `mousemove` 就是为了把偏移值传回上层，因为上层的 `mousemove` 事件到这里中断了。

```javascript
// iframe.js
var baseMouseX, baseMouseY

$dragArea.addEventListener('mousedown', handleDragStart)

function handleDragStart (evt) {
  baseMouseX = evt.clientX
  baseMouseY = evt.clientY

  window.parent.postMessage({
    msg: 'SALADICT_DRAG_START',
    mouseX: baseMouseX,
    mouseY: baseMouseY
  }, '*')

  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('mousemove', handleMousemove)
}

function handleMousemove (evt) {
  window.parent.postMessage({
    msg: 'SALADICT_DRAG_MOUSEMOVE',
    offsetX: evt.clientX - baseMouseX,
    offsetY: evt.clientY - baseMouseY
  }, '*')
}

function handleDragEnd () {
  window.parent.postMessage({
    msg: 'SALADICT_DRAG_END'
  }, '*')

  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handleMousemove)
}
```

## 上层部分

主要增加了`handleFrameMousemove` 补上中断的偏移。

```javascript
// parent.js
var pageMouseX, pageMouseY

var frameTop = 0
var frameLeft = 0
$iframe.style.top = frameTop + 'px'
$iframe.style.left = frameLeft + 'px'

window.addEventListener('message', evt => {
  const data = evt.data

  switch (data.msg) {
    case 'SALADICT_DRAG_START':
      handleDragStart(data.mouseX, data.mouseY)
      break
    case 'SALADICT_DRAG_MOUSEMOVE':
      handleFrameMousemove(data.offsetX, data.offsetY)
      break
    case 'SALADICT_DRAG_END':
      handleDragEnd()
      break
  }
})

function handleDragStart (mouseX, mouseY) {
  // 得出鼠标在上层的位置
  pageMouseX = frameLeft + mouseX
  pageMouseY = frameTop + mouseY

  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('mousemove', handlePageMousemove)
}

function handleDragEnd () {
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handlePageMousemove)
}

function handleFrameMousemove (offsetX, offsetY) {
  frameTop += offsetY
  frameLeft += offsetX
  $iframe.style.top = frameTop + 'px'
  $iframe.style.left = frameLeft + 'px'

  // 更新鼠标在上层的位置，补上偏移
  pageMouseX += offsetX
  pageMouseY += offsetY
}

function handlePageMousemove (evt) {
  frameTop += evt.clientX - pageMouseX
  frameLeft += evt.clientY - pageMouseY
  $iframe.style.top = frameTop + 'px'
  $iframe.style.left = frameLeft + 'px'

  // 新位置直接可以更新
  pageMouseX = evt.clientX
  pageMouseY = evt.clientY
}
```

## 例子

这里实现了一个例子，下面的正方形 iframe 是可以拖动的：

<div class="drag-container">
  <style type="text/css">
    .drag-container {
      position: relative;
      height: 200px;
    }
    .drag-iframe {
      position: absolute;
      width: 200px !important;
      height: 200px !important;
    }
  </style>
  <iframe class="drag-iframe" src="/img/post/drag-iframe.html" frameborder="0"></iframe>
  <script type="text/javascript">
    ;(function () {
      var pageMouseX, pageMouseY
      var $iframe = document.querySelector('.drag-iframe')
      var frameTop = 0
      var frameLeft = 0
      $iframe.style.top = frameTop + 'px'
      $iframe.style.left = frameLeft + 'px'
      window.addEventListener('message', evt => {
        const data = evt.data
        switch (data.msg) {
          case 'SALADICT_DRAG_START':
            handleDragStart(data.mouseX, data.mouseY)
            break
          case 'SALADICT_DRAG_MOUSEMOVE':
            handleFrameMousemove(data.offsetX, data.offsetY)
            break
          case 'SALADICT_DRAG_END':
            handleDragEnd()
            break
        }
      })
      function handleDragStart (mouseX, mouseY) {
        // 得出鼠标在上层的位置
        pageMouseX = frameLeft + mouseX
        pageMouseY = frameTop + mouseY
        document.addEventListener('mouseup', handleDragEnd)
        document.addEventListener('mousemove', handlePageMousemove)
      }
      function handleDragEnd () {
        document.removeEventListener('mouseup', handleDragEnd)
        document.removeEventListener('mousemove', handlePageMousemove)
      }
      function handleFrameMousemove (offsetX, offsetY) {
        frameTop += offsetY
        frameLeft += offsetX
        $iframe.style.top = frameTop + 'px'
        $iframe.style.left = frameLeft + 'px'
        // 更新鼠标在上层的位置，补上偏移
        pageMouseX += offsetX
        pageMouseY += offsetY
      }
      function handlePageMousemove (evt) {
        frameTop += evt.clientX - pageMouseX
        frameLeft += evt.clientY - pageMouseY
        $iframe.style.top = frameTop + 'px'
        $iframe.style.left = frameLeft + 'px'
        // 新位置直接可以更新
        pageMouseX = evt.clientX
        pageMouseY = evt.clientY
      }
    })()
  </script>
</div>

## 兼容性

可以看到，这里主要就是传鼠标的坐标偏移值。所以需要兼容老浏览器的话，用繁琐的旧方式与 iframe 交流就行。如果是同域的话也可以直接从 iframe 里获取偏移。

