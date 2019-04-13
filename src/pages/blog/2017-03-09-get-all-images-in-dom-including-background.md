---
title: 获取 DOM 里所有图片（包括背景和iframe）
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

在写浏览器扩展什么的时候可能会用上。

获取 DOM 里的图片主要是在这几个地方里面找: `<img>` 元素, `background-image` CSS 属性和 `<iframe>`。

# img

如果只想获取 `<img>` 的图片，有两种方式:

直接获取所有 `img` 标签:

```javascript
function getImgs (doc) {
  return Array.from(doc.getElementsByTagName('img'))
    .map(img => ({
      src: img.currentSrc, // 用 img.src 如果要本来的 src
      width: img.naturalWidth,
      height: img.naturalHeight
    }))
}

getImgs(document)
```

还可以用 [document.images](https://developer.mozilla.org/en-US/docs/Web/API/Document/images):

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

获得背景图片需要查看所有 DOM 节点的 `background-image` 属性:

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

背景图片不能直接得到尺寸信息，如果需要的话要加载一遍。因为搜集的图片很有可能已经在浏览器缓存里，所以加载过程应该很快。

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

只需要递归遍历 iframe 的 document

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
        // 直接忽略错误的 iframe (e.g. cross-origin)
      }
    })
  return imgList
}

searchIframes(document)
```

# 整合一起

直接使用就行。

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

如果是开发 Chrome 插件则不受跨域影响，可以直接使用 [probe-image-size](https://github.com/nodeca/probe-image-size)，它支持 timeout 参数，就不需要自己写 timer 了。我在写一个 [Chrome 扩展](https://github.com/crimx/crx-weitweet)时用上了，很方便。

