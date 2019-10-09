---
layout: blog-post
draft: false
date: 2019-10-09T15:31:28.653Z
title: 利用 Webpack API 获取资源清单
description: 本文聊聊如何利用 Webpack API 获取打包后的资源清单，从而用到进一步的自动化流程中。
quote:
  author: Milton Berle
  content: 'If opportunity doesn''t knock, build a door.'
  source: ''
tags:
  - Webpack
---

## 为什么

如今几乎每个 Webpack 打包的项目都会用到 [HTML Webpack Plugin](https://github.com/jantimon/html-webpack-plugin)。这个插件可以生成 HTML 文件带上打好的包。这在我实现一个浏览器扩展脚手架时提供了灵感。每个扩展都会有一个清单文件，里面列举了这个扩展需要加载的各种资源。

```json
{
  "background": {
    "scripts": ["jquery.js", "my-background.js"],
  },

  "content_scripts": [
    {
      "matches": ["*://blog.crimx.com/*"],
      "js": ["common.js", "my-content.js"],
      "css": ["my-content.css"]
    }
  ],

  // ...
}
```

通常这些是手写上去的，但如果结合 Webpack 流程，我设想是能不能像 HTML Webpack Plugin 一样自动生成这些配置。如此便可发挥 Webpack 自动拆分块以及添加哈希的优势。

## Plugin

基本的 Webpack Plugin 十分简单，在 `constructor` 处理配置，暴露 `apply` 方法实现逻辑。

```javascript
class WexExtManifestPlugin {
  constructor (options) {
    this.options = options
  }

  apply (compiler) {
    
  }
}
```

## Tapable

在 Webpack 中，API 通过 hook 勾上 Tapable 来挂载回调。不同的 Tapable 子类用于不同种类的回调。我们这里使用 Promise 处理异步回调。

```javascript{7-12}
class WexExtManifestPlugin {
  constructor (options) {
    this.options = options
  }

  apply (compiler) {
    compiler.hooks.done.tapPromise(
      'WexExtManifestPlugin',
      async ({ compilation }) => {
      
      }
    )
  }
}
```

## Compilation

Compilation 是 Webpack 最重要的 API 之一，通过 entrypoints 我们可以获得每个包的 entry 和 name ，通过 `entry.getFiles()` 可以获取该入口下所有文件，通过 name 可以定位到相应包名，从配置中获取其它信息。


```javascript{10-14}
class WexExtManifestPlugin {
  constructor (options, neutrinoOpts) {
    this.options = options
  }

  apply (compiler) {
    compiler.hooks.done.tapPromise(
      'WexExtManifestPlugin',
      async ({ compilation }) => {
        compilation.entrypoints.forEach((entry, name) => {
          const files = entry
            .getFiles()
            .map(file => file.replace(/\.(css|js)\?.*$/, '.$1'))
        })
      }
    )
  }
}
```

完整的实现在[这里](https://github.com/crimx/neutrino-webextension/blob/master/lib/WexExtManifestPlugin.js)。通过获取资源清单，[脚手架](https://github.com/crimx/neutrino-webextension)可以利用 Webpack 实现复杂的优化；同时复用 Neutrino 的配置，扩展的资源配置统一到 Neutrino 入口中，不再需要手动维护。
