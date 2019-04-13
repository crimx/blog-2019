---
title: Get All Images in DOM (including background)
tags:
  - Recommended
  - Image
  - JavaScript
  - DOM
quote:
  content: >-
    “If I could store lightnings in jars, I'd sell them to sick fireflies to
    light their way. Only they have nothing to pay for it with but life.” 
  author: 'Will Advise, Nothing is here...'
  source: ''
date: 2017-03-09T12:00:00.000Z
layout: blog-post
description: ''
---

Quite useful if you are writing an browser extension or something.

To get all the images in DOM there are actually three places we are going to look at: `<img>` element, `background-image` CSS property and, `<iframe>`. Yes, every iframe hides a magical kingdom.

# img

If you only want to get images in `<img>`, two options for you to choose:

You can either search the DOM for `img` tag:

```javascript
function getImgs (doc) {
  return Array.from(doc.getElementsByTagName('img'))
    .map(img => ({
      src: img.currentSrc, // img.src if you want the origin
      width: img.naturalWidth,
      height: img.naturalHeight
    }))
}

getImgs(document)
```

Or just use [document.images](https://developer.mozilla.org/en-US/docs/Web/API/Document/images):

```javascript
function getImgs (doc) {
  return Array.from(doc.images)
    .map(img => ({
      src: img.currentSrc, // img.src if you want the origin
      width: img.naturalWidth,
      height: img.naturalHeight
    }))
}

getImgs(document)
```

# background-image

For `background-image`, we need to check every node in DOM:

```javascript
function getBgImgs (doc) {
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i
  return Array.from(
    Array.from(doc.querySelectorAll('*'))
      .reduce((collection, node) => {
        let prop = window.getComputedStyle(node, null)
          .getPropertyValue('background-image')
        // match `url(...)`
        let match = srcChecker.exec(prop)
        if (match) {
          collection.add(match[1])
        }
        return collection
      }, new Set())
  )
}

getBgImgs(document)
```

We can't simply get the width and height of a background image. If you need them, you have to load it.

Since the images you get in DOM are most likely already in the browser cache, the loading process should be fairly quick.

```javascript
function loadImg (src, timeout = 500) {
  var imgPromise = new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => {
      resolve({
        src: src,
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = reject
    img.src = src
  })
  var timer = new Promise((resolve, reject) => {
    setTimeout(reject, timeout)
  })
  return Promise.race([imgPromise, timer])
}

function loadImgAll (imgList, timeout = 500) {
  return new Promise((resolve, reject) => {
    Promise.all(
      imgList
        .map(src => loadImg(src, timeout))
        .map(p => p.catch(e => false))
    ).then(results => resolve(results.filter(r => r)))
  })
}

loadImgAll(getBgImgs(document)).then(imgs => console.log(imgs))
```

# iframe

Just recursively search in all iframes

```javascript
function searchIframes (doc) {
  var imgList = []
  doc.querySelectorAll('iframe')
    .forEach(iframe => {
      try {
        iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        imgList = imgList.concat(getImgs(iframeDoc) || []) // or getBgImgs(iframeDoc)
        imgList = imgList.concat(searchIframes(iframeDoc) || [])
      } catch (e) {
        // simply ignore errors (e.g. cross-origin)
      }
    })
  return imgList
}

searchIframes(document)
```

# Together

Can be used out of the box. It was made when I was writing a [Chrome Extension](https://github.com/crimx/crx-weitweet).

```javascript
function getImgAll (doc) {
  return new Promise((resolve, reject) => {
    loadImgAll(Array.from(searchDOM(doc)))
      .then(resolve, reject)
  })

  function searchDOM (doc) {
    const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i
    return Array.from(doc.querySelectorAll('*'))
      .reduce((collection, node) => {
        // bg src
        let prop = window.getComputedStyle(node, null)
          .getPropertyValue('background-image')
        // match `url(...)`
        let match = srcChecker.exec(prop)
        if (match) {
          collection.add(match[1])
        }

        if (/^img$/i.test(node.tagName)) {
          // src from img tag
          collection.add(node.src)
        } else if (/^frame$/i.test(node.tagName)) {
          // iframe
          try {
            searchDOM(node.contentDocument || node.contentWindow.document)
              .forEach(img => {
                if (img) { collection.add(img) }
              })
          } catch (e) {}
        }
        return collection
      }, new Set())
  }

  function loadImg (src, timeout = 500) {
    var imgPromise = new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => {
        resolve({
          src: src,
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.onerror = reject
      img.src = src
    })
    var timer = new Promise((resolve, reject) => {
      setTimeout(reject, timeout)
    })
    return Promise.race([imgPromise, timer])
  }

  function loadImgAll (imgList, timeout = 500) {
    return new Promise((resolve, reject) => {
      Promise.all(
        imgList
          .map(src => loadImg(src, timeout))
          .map(p => p.catch(e => false))
      ).then(results => resolve(results.filter(r => r)))
    })
  }
}

getImgAll(document).then(list => console.log(list))
```

[EOF]

