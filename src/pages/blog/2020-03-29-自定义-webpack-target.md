---
layout: blog-post
draft: false
date: 2020-03-29T17:04:45.772Z
title: 自定义 Webpack Target
description: 本文聊聊如何为特殊的环境自定义 Webpack Target 以生成合适的代码。
quote:
  content: My life is like a speeding bullet that just hasn't hit the target yet.
  author: Kid Cudi
  source: ''
tags:
  - Webpack
  - WebExtension
---
## 问题

由于浏览器扩展有特殊的权限限制，许多前端的开发工具都无法直接派上用场，如之前我解决了[热更新](https://github.com/crimx/webextensions-emulator/)和[分块自动填写到清单](https://github.com/crimx/neutrino-webextension)的问题。现在我们继续突破下个影响性能的问题：动态加载分块。

Webpack 支持 `import()` 自动分块并异步加载，这对于大型应用来说是非常有用的功能。虽然浏览器扩展的源文件都在本地，但对于大型应用来说静态加载依然会浪费了不少内存。那么为什么浏览器扩展不支持异步加载呢？这就需要理解 Webpack 是怎么处理的。

（如果只关心如何在浏览器扩展中使用，本文的内容已封装为 [webpack-target-webextension](https://github.com/crimx/webpack-target-webextension) 库。）

## JSONP

当我们指定（或默认） Webpack Target 为 `web` 的时候，Webpack runtime 会以 JSONP 方式来加载异步块。那么什么是 JSONP？

JSONP 常用于跨域动态获取数据。如 `a.com` 向 `b.com` 请求数据，

- 首先生成一个回调函数名，如 `myCallback`；
- 创建全局函数 `myCallback` 实现加载数据的逻辑；
- 以 `myCallback` 作为参数构造请求链接，如 `https://b.com/data?callback=myCallback`；
- 通过支持跨域的 `<script>` 标签发起请求，`<script src="https://b.com/data?callback=myCallback"></script>`；
- 服务器将数据包裹到回调中返回， `myCallback(...)`；
- 浏览器加载脚本，`myCallback` 的逻辑被执行。

## 沙箱

这种方式为什么在浏览器扩展中会失效呢？我们都知道一些浏览器扩展可以对用户的网页进行修改，如美化或者去广告。这些修改是通过一种叫 content script 类型的脚本实现。每个 content script 可以在作者指定的时机被植入到页面上。虽然 content script 可以修改 DOM，但是 content script 本身是运行在隔离的沙箱环境中的。这个环境可以让 content script 访问部分浏览器扩展 API。

所以当 Webpack 以 JSONP 方式加载异步块的时候，`<script>` 中的回调会在用户的脚本环境中执行，而扩展环境中的接收回调只能默默等待到超时。

## 不如来真的

主流浏览器早早就支持了原生的 `import()` ，那么有没有可能，我们不让 Webpack 生成 JSONP 而直接使用原生的 `import()`？ CRIMX 说 yes！

在 Webpack 中，模块加载的逻辑通过 `target` 设置来调整。Webpack 4 中预设了几种常见的 target：

| Option | Description |
| ------ | ----------- |
| async-node | 用于类 Node.js 环境 |
| electron-main | 用于 Electron 主进程 |
| electron-renderer | 用于 Electron 渲染进程 |
| electron-preload | 用于 Electron 渲染进程 |
| node | 用于类 Node.js 环境 |
| node-webkit | 用于 NWebKit 环境 |
| web | 用于类浏览器环境 |
| webworker | 用于 WebWorker |

很可惜这几种都不支持原生 `import()`，也不适用浏览器扩展。在 Webpack 5 的预览中明确提到了对 es2015 的支持，同时提供了新的 `module` 设置。但是离 Webpack 5 正式发布以及生态跟上可能还有一段时间。

最后 `target` 还支持传入函数以自行实现逻辑。尽管 Webpack 的源码不是很好读，最后还是决定挑战一下，自定义实现一个针对浏览器扩展的 `target`。

## 其实很简单

首先通过[文档](https://v4.webpack.js.org/configuration/target/)找到判断上面预设环境的位置。通过参考 [web](https://github.com/webpack/webpack/blob/webpack-4/lib/WebpackOptionsApply.js#L74) 的配置可以找到 JSONP 的实现在 [JsonpMainTemplatePlugin.js](https://github.com/webpack/webpack/blob/webpack-4/lib/web/JsonpMainTemplatePlugin.js) 中。

其中异步块的加载分了三种方式，正常的，预加载的以及预读取的，对应 `<script>` 和 `<link>` 的 `preload` 和 `prefetch`。全部改成 `import()` 即可。

其中注意计算块的路径，由于在 content script 中相对路径会根据当前页面计算，而我们需要根据扩展根来算路径。所以函数 `jsonpScriptSrc` 改为

```javascript
if (needChunkOnDemandLoadingCode(chunk)) {
  extraCode.push(
    '',
    '// script path function',
    'function webextScriptSrc(chunkId) {',
    Template.indent([
      `var publicPath = ${mainTemplate.requireFn}.p`,
      `var scriptSrcPath = publicPath + ${getScriptSrcPath(
        hash,
        chunk,
        'chunkId'
      )};`,
      `if (!publicPath || !publicPath.includes('://')) {
        return (typeof chrome === 'undefined' ? browser : chrome).runtime.getURL(
          scriptSrcPath
        );
      } else {
        return scriptSrcPath;
      }`
    ]),
    '}'
  )
}
```

从而利用 `runtime.getURL` 来计算扩展资源路径。

## 小坑

可以通过 `publicPath` 来控制根路径。

注意去除 `@babel/plugin-syntax-dynamic-import` 等插件以免 `import()` 被转换掉。

Webpack 一些设置的[默认值](https://v4.webpack.js.org/configuration/resolve/#resolvemainfields)依赖 `target` 来判断，所以需要手动设置：

```js
module.exports = {
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    aliasFields: ['browser']
  },
  output: {
    globalObject: 'window'
  }
}
```

完整修改见[这里](https://github.com/crimx/webpack-target-webextension)。
