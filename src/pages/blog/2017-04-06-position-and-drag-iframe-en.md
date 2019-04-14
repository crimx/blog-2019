---
title: Position and Drag iframe
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

# Position in iframes

I wrote a Chrome extension [Saladict](http://www.crimx.com/crx-saladict/), an inline translator, which involved such requirement: When user makes a text selection, something will pop up nearby the cursor.

It looks simple at first view. Just listen to a `mouseup` event and get `clientX` and `clientY` from it.

But there is a flaw in it - `mouseup` events inside iframes won't bubble up to the top frame.

The solution is actually quite simple. If you know how to connect the dots.

## iframe script injection

Using the `all_frames` property in `manifest.json`, a content script can run in all frames.

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

## Mouse Event Detection

Now you can listen to `mouseup` event in all iframes.

```javascript
// selection.js
document.addEventListener('mouseup', handleMouseUp)
```

## Upload Cursor Coordinates

`clientX` and `clientY` of the mouse events that are triggered in iframes are coordinates within iframe windows. Upload these coordinates as offsets to the upper frame, then plus the iframe position you will get the cursor position within the upper frame window.

On Chrome you can boldly use `postMessage`.

```javascript
// selection.js
function handleMouseUp (evt) {
  if (window.parent === window) {
    // Top frame
    doAwesomeThings(evt.clientX，evt.clientY)
  } else {
    // Pass the coordinates to upper frame
    window.parent.postMessage({
      msg: 'SALADICT_CLICK',
      mouseX: evt.clientX,
      mouseY: evt.clientY
    }, '*')
  }
}
```

## Add offsets

How does the upper frame know which iframe is sending coordinates? Well, the `message` event contains the content window of the iframe. Use it to match the iframe element.

```javascript
// selection.js
window.addEventListener('message', evt => {
  if (evt.data.msg !== 'SALADICT_CLICK') { return }

  let iframe = Array.from(document.querySelectorAll('iframe'))
    .filter(f => f.contentWindow === evt.source)
    [0]
  if (!iframe) { return }

  // calculate coordinates within current window
  let pos = iframe.getBoundingClientRect()
  let mouseX = evt.data.mouseX + pos.left
  let mouseY = evt.data.mouseY + pos.top

  if (window.parent === window) {
    // Top frame
    doAwesomeThings(mouseX, mouseY)
  } else {
    // Keep uploading
    window.parent.postMessage({
      msg: 'SALADICT_CLICK',
      mouseX,
      mouseY
    }, '*')
  }
})
```

# iframe Dragging

Another requirement for Saladict is to drag an iframe panel.

## Dragging 101

Before getting into iframe dragging. There are few basic ideas of implementing a draggable element.

One of the most common approaches is to listen to `mousedown`, `mousemove` and `mouseup` events, which handle drag start, dragging and drag end. And apply the offsets to the element's `left` and `top` style properties.

If this is your first time implementing this feature, you are likely to listen to `mousemove` events of the element itself.

You can indeed get the correct result in the way. The problem is, if the curser moves a bit too fast and leaves the element, the dragging will stop. That's why you should listen to global `mousemove` event instead.

## Dragging with iframe

The theory behind iframe dragging is the same. Only the mouse events triggered in iframes will not bubble up to the upper frame. You need to wrap it up yourselves.

## iframe Part

Drag start is triggered by a draggable element inside iframe. For better performance, dragging and drag end event listeners are attached in drag start and are detached in drag end.

Dragging event listener is required here because the `mousemove` event of the upper frame breaks inside the iframe. We need to let upper frame know what is happening inside iframe.

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

## Upper Frame Part

Use `handleFrameMousemove` to handle the offsets from iframe.

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
  // get the coordinates within the upper frame
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

  // Add the missing coordinates
  pageMouseX += offsetX
  pageMouseY += offsetY
}

function handlePageMousemove (evt) {
  frameTop += evt.clientX - pageMouseX
  frameLeft += evt.clientY - pageMouseY
  $iframe.style.top = frameTop + 'px'
  $iframe.style.left = frameLeft + 'px'

  pageMouseX = evt.clientX
  pageMouseY = evt.clientY
}
```

## Demo

You can drag the iframe square below:

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
        pageMouseX += offsetX
        pageMouseY += offsetY
      }
      function handlePageMousemove (evt) {
        frameTop += evt.clientX - pageMouseX
        frameLeft += evt.clientY - pageMouseY
        $iframe.style.top = frameTop + 'px'
        $iframe.style.left = frameLeft + 'px'
        pageMouseX = evt.clientX
        pageMouseY = evt.clientY
      }
    })()
  </script>
</div>

## Browser Compatibility

As you can see, nothing fancy here, just passing coordinates around. So for older browsers, just use the old ways to communicate. You can also manipulate the values directly if they are same-origin.

