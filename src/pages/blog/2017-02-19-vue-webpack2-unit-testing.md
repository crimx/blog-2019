---
title: 倒腾 Vue Webpack2 单元测试
tags:
  - Vue
  - Webpack
  - Testing
  - JavaScript
quote:
  content: >-
    The most powerful designs are always the result of a continuous process of
    simplification and refinement.
  author: Kevin Mullet
  source: ''
date: 2017-02-19T12:00:00.000Z
layout: blog-post
description: ''
---

`vue-cli` 提供的官方模板确实好用。但一直用下来手贱毛病又犯了，像穿了别人的内衣，总感觉不舒服。

所以有机会就瞎倒腾了一遍，总算把各个流程摸了一把。这里分享一下配置带覆盖率的单元测试。

## 文件结构

基本的文件结构。

```
├─src
│  ├─assets
│  ├─components
│  ├─app.vue
│  └─main.js
├─test
│   └─unit
│       ├─coverage
│       ├─specs
│       ├─index.js
│       └─karma.conf.js
├─.babelirc
├─webpack.conf.js
└─package.json
```

## 依赖

根据需要增删

```bash
yarn add -D \
cross-env \
# webpack
webpack \
webpack-merge \
vue-loader \
# babel
babel-core \
babel-loader \
babel-plugin-transform-runtime \
babel-preset-es2015 \
babel-register \
babel-plugin-istanbul \
# karma
karma \
karma-coverage \
karma-phantomjs-launcher \
karma-sourcemap-loader \
karma-spec-reporter \
karma-webpack \
mocha \
karma-mocha \
sinon-chai \
karma-sinon-chai \
chai \
sinon \

```

## 入口

先从 `package.json` 开始。跟官方的一致。设置 `BABEL_ENV` 可以在测试的时候才让 Babel 引入 `istanbul` 计算覆盖率。

```json
{
  "scripts": {
    "unit": "cross-env BABEL_ENV=test karma start test/unit/karma.conf.js --single-run",
    "test": "npm run unit",
  }
}
```

## 配置 Babel

在 `.babelirc` 中：

```json
{
  "presets": ["es2015"],
  "plugins": ["transform-runtime"],
  "comments": false,
  "env": {
    "test": {
      "plugins": [ "istanbul" ]
    }
  }
}
```

按需设置，写 Chrome Extension 的话用 `es2016` 就行。

Babel 的 istanbul 插件是个很聪明的做法。

## Loader 配置

从 Vue Loader 的文档可以看到，不需要额外配置，它非常贴心自动识别 Babel Loader。

如果还测试 js 文件那么给源文件夹下的 js 文件配置 Babel Loader 就行。以 `src` 为例：

```javascript
{
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, '../src')
        ],
        exclude: /node_modules/
      }
    ]
  }
}
```

## Karma 配置

为 webpack 设置环境

```javascript
// karma.conf.js
const merge = require('webpack-merge')
let webpackConfig = merge(require('../../webpack.conf'), {
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': '"testing"'
    })
  ]
})

// no need for app entry during tests
delete webpackConfig.entry
```

接着输出 karma 配置，基本沿用官方的配置。注意不同的浏览器需要安装不同的 karma 插件。

```javascript
// karma.conf.js
module.exports = function (config) {
  config.set({
    // to run in additional browsers:
    // 1. install corresponding karma launcher
    //    http://karma-runner.github.io/0.13/config/browsers.html
    // 2. add it to the `browsers` array below.
    browsers: ['Chrome'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec', 'coverage'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
```

## 引入所有组件

在 `test/unit/index.js` 里，这是官方的配置：

```javascript
// require all test files (files that ends with .spec.js)
const testsContext = require.context('./specs', true, /\.spec$/)
testsContext.keys().forEach(testsContext)

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
const srcContext = require.context('src', true, /^\.\/(?!main(\.js)?$)/)
srcContext.keys().forEach(srcContext)
```

因为之前配置 loader 时 `src` 文件夹下的 js 才会被收集计算覆盖率，所以可以放心 require 。

第二段 require 是为了所有源码一起算覆盖率。可以看到官方配置只排除了 `src` 目录里的 `main.js`，如果是多入口可以用 `/^(?!.*\/main(\.js)?$)/i` 排除所有的 `main.js` 文件。

## 开始测试

这基本上就是所有的配置了。其它的设置应该都是围绕插件本身，就不赘述。

## Babeless 配置

如果不需要 Babel 可以用 `istanbul-instrumenter-loader` 收集覆盖率。

js 文件的配置同 Babel。 Vue 文件需要在 `options.loaders` 选项里为 `js` 补上：

```javascript
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      'js': 'istanbul-instrumenter-loader'
    }
  }
}
```

【完】

