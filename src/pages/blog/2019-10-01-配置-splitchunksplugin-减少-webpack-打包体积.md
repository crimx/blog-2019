---
layout: blog-post
draft: false
date: 2019-09-30T16:00:33.832Z
title: 配置 SplitChunksPlugin 减少 Webpack 打包体积
description: 本文聊聊如何根据项目对 SplitChunksPlugin 进行细调从而减少 Webpack 打包体积。
quote:
  author: Craig Ferguson
  content: “I try and live my life in bite-size chunks.”
  source: ''
tags:
  - Webpack
---
## 为什么要手动优化

在优化之前我们必须先问一个问题，需不需要手动优化？过早的优化是魔鬼，许多情况下 Webpack 的自动分块已经可以满足。

手动优化一般是在项目组件变得庞大之后，我们希望根据业务对部分依赖作特殊的处理，从而大幅度减少打包体积。

## CommonsChunkPlugin 的局限

在过去 Webpack 提供了 CommonsChunkPlugin 来配置拆分和组合块（chunks），如今这个插件已被淘汰，取而代之的是更具拓展性的 SplitChunksPlugin 。

两者有什么不同？从名字我们就可以看出些线索。

CommonsChunkPlugin 顾名思义，其目的是提出公用的块放在一起，而 SplitChunksPlugin 则更倾向于如何把块切分出去。

在 CommonsChunkPlugin 中，如果需要手动优化，提取多个公共块需要通过多次 `new CommonsChunkPlugin` 来分别配置。这里就有一个问题，如果一个模块存在多个公共块中该如何处理？

答案是每个公共块都会存一份。因为这里每个配置都是独立的，很难再进一步统筹优化。

## SplitChunksPlugin 一站式配置

SplitChunksPlugin 通过引入 `cacheGroups` 来解决这个问题。在 SplitChunksPlugin 中，手动切分多个公共块不再需要多次 `new SplitChunksPlugin`，而是统一在 `cacheGroups` 域下配置。

```javascript
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'vendor',
          chunks: 'all',
        }
      }
    }
  }
};
```

`cacheGroups` 默认会继承 `optimization` 的部分配置，而通过 `priority` 和 `reuseExistingChunk` 我们解决了复用的问题。

## 模块可视化

细调之前先安装 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) 直观地查看模块与块。

![webpack-bundle-analyzer](https://cloud.githubusercontent.com/assets/302213/20628702/93f72404-b338-11e6-92d4-9a365550a701.gif)

## 沙拉查词的优化

首先这是沙拉查词优化前的样子，使用了默认的 `optimization` 配置，打包后 `5.63MB`（包含一个 PDF 浏览器）。

![split-chunks-plugin-1](/img/split-chunks-plugin-1.png)

第一眼可以非常明显地观察到一个巨型包 `@ant-design/icons/lib`，这是 antd 3.9 引入的坑爹改变，目前没有很好的解决方式，所以这里我们手动给 antd 全家桶割一个块。

因为只有三个地方用到，我们不希望其它入口加载时也引入这个块，所以要声明这次分割影响到的块，`cacheGroups` 中提供了 `test` 来匹配。

同时因为这三个地方都是沙拉查词中独立的页面，一般需要用户手动访问才会加载，故这里索性将 `node_modules` 中三者公共的模块都切出来。

```javascript
neutrino.config
  .optimization
    .merge({
      splitChunks: {
        cacheGroups: {
          antd: {
            test: /[\\/]node_modules[\\/]/,
            name: 'antd',
            chunks: ({ name }) => /^(notebook|options|history)$/.test(name),
            reuseExistingChunk: true
          }
        }
      },
    })
```

这里我配置了 `reuseExistingChunk` 是期望如果 `node_modules` 中有的模块在其它地方已经分割了，那么尽可能复用，因为如前面所述这三个页面只有用户需要时才访问，所以没有关系。

效果如图，打包后 `3.74MB`（包含一个 PDF 浏览器）。减少了 `1.89MB` 的体积！

![split-chunks-plugin-2](/img/split-chunks-plugin-2.png)

接下来可以看到还有几个大块，这个主要来自于沙拉查词的查词面板，包括 React 系的模块以及各个词典的模块。它们有一个特点是必然在一起出现，所以我们给它们割一个块。

```javascript
neutrino.config
  .optimization
    .merge({
      splitChunks: {
        cacheGroups: {
          dictpanel: {
            test: /([\\/]src[\\/]content[\\/])|([\\/]components[\\/]dictionaries[\\/])|([\\/]node_modules[\\/]react)/,
            name: 'dictpanel',
            chunks: ({ name }) => !/^(selection|audio-control|background)$/.test(name)
          },
          antd: {
            test: /[\\/]node_modules[\\/]/,
            name: 'antd',
            chunks: ({ name }) => /^(notebook|options|history)$/.test(name),
            reuseExistingChunk: true
          }
        }
      },
    })
```

其中 `src/content/` 下放的是词典面板的组件，`components/dictionaries/` 下是各个词典的模块，最后匹配了所有 react 开头的模块。

同时我们隔离了用不到词典面板的几个入口，避免因为用到其中的一两个模块而引入整个分割出来的块。

效果如图，打包后 `3.44MB`（包含一个 PDF 浏览器）。相比原来减少了 `2.19MB` 的体积！

![split-chunks-plugin-3](/img/split-chunks-plugin-3.png)

这里我觉得已经差不多了，再往下压意义不大。可见通过简单的配置我们减少了 `2.19MB` 体积，还是比较划算的。

## 最后

当然 SplitChunksPlugin 能做的远不止这些，遇到问题可以多翻[文档](https://webpack.js.org/plugins/split-chunks-plugin/)找灵感。

祝大家国庆节快乐！
