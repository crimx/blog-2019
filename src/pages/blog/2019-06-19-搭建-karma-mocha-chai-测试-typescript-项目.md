---
layout: blog-post
draft: false
date: 2019-06-18T17:19:22.232Z
title: 搭建 Karma+Mocha+Chai 测试 TypeScript 项目
description: >-
  测试是软件开发中重要的一环，有了测试项目开发起来大脑负担减少，心里踏实，许多没想到的边界条件也能一一揪出。Karma+Mocha+Chai
  是经过时间考验的经典测试组合，具有较高的灵活性，非常值得研究学习。本文将从零开始搭建，同时配合 TypeScript 进行测试。
quote:
  author: Burt Rutan
  content: '“Testing leads to failure, and failure leads to understanding.”'
  source: ''
tags:
  - Testing
  - Karma
---
## 为什么不用 Jest

[Jest](https://jestjs.io/) 是一个非常简单易用的测试框架，它内置了测试中各种常用功能，API 简洁清晰，只需少量配置即可快速编写测试。但同时 Jest 内部造了很多轮子，比如模块路径解析就曾踩到坑；其使用 JSDOM 模拟浏览器环境来支持并行测试，大大加快了速度，但也带来了 JSDOM 的局限性与坑；最大的问题是不能方便地在真实浏览器中测试，这个缺陷[多年](https://github.com/facebook/jest/issues/139)一直没有得到官方重视，未来支持的可能性很小。

所以，如果只需要简单地测试框架组件以及一些纯逻辑的功能，使用 Jest 无疑是最方便的；但如果涉及到 DOM 相关的一些测试，就不必费时间在 Jest 上折腾 puppeteer 了，直接上 Karma 全家桶反而更容易。

## 为什么要自行搭建

许多框架 CLI 和脚手架都可以自动配置好测试框架，为什么我们还要自行搭建？除去研究学习的原因，整个搭建起来其实也没有想象中的困难，每个工具各司其职给了我们很大的自由去挑选合适的组合。预设的方案一般很难符合每个项目的需要，像 Neutrino 脚手架就意识到这一点，Neutrino 9 虽然依然号称“零配置”，但其角色已从项目零配置转移到工具零配置上。了解工具的基本原理，即便是配置脚手架来也会更得心应手。

## 出场角色介绍

首先我们来了解一下将要出场的几个工具是干什么的：

* [Karma](https://karma-runner.github.io)：负责统筹整个测试流程，获取测试，在多个真实设备上运行，对结果进行分析处理。
* [Mocha](https://mochajs.org/)：测试框架，提供 API 编写测试。
* [Chai](https://www.chaijs.com/)：BDD / TDD 风格断言库，提供了语义化的方式编写断言。
* [Istanbul](https://istanbul.js.org/)：跟踪代码运行路径，计算测试覆盖率。
* [Coveralls](https://coveralls.io/)：测试覆盖率分析服务。
* [Travis CI ](https://travis-ci.org/)：持续集成服务，每次提交 commit 即可触发测试。

## 配置 Karma

```bash
npm install -D karma
```

要使用 Karma 只需要配置一个文件即可，理论上放哪里都行，方便起见我们在项目根目录新建 `karma.config.js`。

```javascript
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    }
  })
}
```

* `singleRun`：在本地我们通常希望测试跑完之后 Karma 依然继续检测文件变化重跑，但在 CI 上则必须完成结束测试，否测 CI 会一直等待 Karma 直到超时。
* `mime`： Karma 不认识 TypeScript 文件，我们得告诉它。

### 添加浏览器

```bash
npm install -D karma-chrome-launcher karma-firefox-launcher
```

根据你的需求添加即可。

```javascript{5}
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,

    browsers: process.env.CI ? ['Chrome', 'Firefox'] : ['Chrome'],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    }
  })
}
```

### 添加 Mocha 和 Chai

```bash
npm install -D mocha chai karam karma-mocha karma-chai @types/chai @types/mocha
```

植入全局变量就不必反复 `import`。

```javascript{7}
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,

    browsers: process.env.CI ? ['Chrome', 'Firefox'] : ['Chrome'],

    frameworks: ['mocha', 'chai'],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    }
  })
}
```

### 让 TypeScript 知道 Chai 全局

我们的测试也将使用 TypeScript 编写，@types/Mocha 会自动添加全局类型，但 Chai 默认不会，所以我们为测试的 ts 新建一个配置 `test/tscofig.json`

```json
{
  "extends": "../tsconfig",
  "compilerOptions": {
    "typeRoots": [
      "../node_modules/@types",
      "./typings"
    ]
  },
  "include": [
    "./**/*.spec.tsx"
  ]
}
```

然后新建 `test/typings/global/index.d.ts`

```typescript
import * as Chai from 'chai'

declare global {
  interface Window {
    expect: Chai.ExpectStatic
  }
  var expect: Chai.ExpectStatic
}
```

### 使用 Karma Webpack

```bash
npm install -D webpack karma-webpack ts-loader @types/webpack-env
```

我们将使用 karma-webpack 对 TypeScript 进行打包。

```javascript
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,
    
    browsers: process.env.CI ? ['Chrome', 'Firefox'] : ['Chrome'],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },
    webpack: {
      mode: 'development',
      entry: './src/index.ts',
      output: {
        filename: '[name].js'
      },
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                configFile: 'test/tsconfig.json'
              }
            },
            exclude: [path.join(__dirname, 'node_modules')]
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
      }
    }
  })
}
```

注意我们这里给 ts-loader 指向了测试的 tsconfig.json。

#### 为什么不用 Babel Typescript

也许你听说过 [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)，它确实也可以转换 Typescript，但也仅仅是转换，由于无法进行 type-check，生成的代码还是有些不一样。如果没有特殊的需求，用回原生的编译器显然坑更少。

#### 为什么不用 Rollup 打包

如果你的项目是基于 Rollup 的，重用 Rollup 的配置来加载测试似乎是个更好的选择。但也要注意 Rollup 的生态跟 Webpack 相比还是有些差距，许多 Rollup 相关的插件都疏于维护，我之前就一直没法让 rollup-plugin-istanbul 正确定位到 TypeScript 的源码。

#### 添加测试入口

使用 Webpack 之后我们就不需要 Karma 来匹配文件，而是交给 Webpack 处理，只留一个入口给 Karma 即可。

```javascript{11,13-15}
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,
    
    browsers: process.env.CI ? ['Chrome', 'Firefox'] : ['Chrome'],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    
    files: ['test/index.ts'],
    
    preprocessors: {
      'test/index.ts': ['webpack']
    },
    
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },
    webpack: {
      mode: 'development',
      entry: './src/index.ts',
      output: {
        filename: '[name].js'
      },
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                configFile: 'test/tsconfig.json'
              }
            },
            exclude: [path.join(__dirname, 'node_modules')]
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
      }
    }
  })
}
```

同时新建 `test/index.js` 将所有测试以及所有需要计算覆盖率的源码都 `require` 进来。

```typescript
const tests = require.context('./', true, /\.spec\.tsx?$/)

tests.keys().forEach(tests)

const sources = require.context('../src/', true, /\.tsx?$/)

sources.keys().forEach(sources)
```

### 添加超萌的喵喵汇报器

```bash
npm install -D karma-nyan-reporter
```

接下来我们配置最后一步，汇报测试结果。这里不得不提这个萌萌的 [karma-nyan-reporter](https://github.com/dgarlitt/karma-nyan-reporter)

![karma-nyan-reporter](https://raw.githubusercontent.com/dgarlitt/image-repo/master/karma-nyan-reporter/v0.2.2/karma-nyan-reporter-error-output.png)

如果不希望出现动画，只开启 `renderOnRunCompleteOnly` 即可。

```javascript{17，49-51}
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,
    
    browsers: process.env.CI ? ['Chrome', 'Firefox'] : ['Chrome'],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    
    files: ['test/index.ts'],
    
    preprocessors: {
      'test/index.ts': ['webpack']
    },
    
    reporters: ['nyan'],
    
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },
    webpack: {
      mode: 'development',
      entry: './src/index.ts',
      output: {
        filename: '[name].js'
      },
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                configFile: 'test/tsconfig.json'
              }
            },
            exclude: [path.join(__dirname, 'node_modules')]
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
      }
    },
    
    nyanReporter: {
      renderOnRunCompleteOnly: process.env.CI
    }
  })
}
```

### 添加 Istanbul 汇报覆盖率

```bash
npm install -D istanbul-instrumenter-loader karma-coverage-istanbul-reporter
```

整合 Istanbul 主要分两步，先在 Webpack 中配置 instrumenter 以植入计数，最后配置汇报器汇报结果。

```javascript{17,42-50,58-72}
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,
    
    browsers: process.env.CI ? ['Chrome', 'Firefox'] : ['Chrome'],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    
    files: ['test/index.ts'],
    
    preprocessors: {
      'test/index.ts': ['webpack']
    },
    
    reporters: ['nyan'， 'coverage-istanbul'],
    
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },
    webpack: {
      mode: 'development',
      entry: './src/index.ts',
      output: {
        filename: '[name].js'
      },
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                configFile: 'test/tsconfig.json'
              }
            },
            exclude: [path.join(__dirname, 'node_modules')]
          },
          {
            test: /\.tsx?$/,
            include: [path.join(__dirname, 'src')],
            enforce: 'post',
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            }
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
      }
    },
    
    coverageIstanbulReporter: process.env.CI
      ? {
          reports: ['lcovonly', 'text-summary'],
          dir: path.join(__dirname, 'coverage'),
          combineBrowserReports: true,
          fixWebpackSourcePaths: true
        }
      : {
          reports: ['html', 'lcovonly', 'text-summary'],
          dir: path.join(__dirname, 'coverage/%browser%/'),
          fixWebpackSourcePaths: true,
          'report-config': {
            html: { outdir: 'html' }
          }
        },
    
    nyanReporter: {
      renderOnRunCompleteOnly: process.env.CI
    }
  })
}
```

注意这里我们配置汇报器输出的类型，

* `text-summary` 主要方便我们在命令行中看到统计。
* `html` 可以 `coverage/` 目录下浏览各个源代码的覆盖情况。
* `lcovonly` 主要为了给其它工具使用，比如接下来要配置的 Coveralls。

如果你的源码中有针对浏览器特性或坑的代码，那么每个浏览器测试出来的覆盖率可能会不一样，通过 `combineBrowserReports` 即可合并覆盖率。

如果需要分开查看，给 `dir` 路径提供 `/%browser%/` 会自动分开生成各个浏览器的结果。

#### 让 Istanbul 忽略部分源码

出于各种原因，有时候我们希望让 Istanbul 忽略一部分难以测试的源码。可以在代码中加入特殊的注释如 `/* istanbul ignore next */` 来实现，其[文档](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md)列举了完整的例子。

但无论如何，最好一并附上忽略的原因，以免给阅读源码的人（包括未来的自己）造成困扰。

### 上传覆盖率到 Coveralls

```bash
npm install -D karma-coveralls
```

接下来我们可以将覆盖率上传到各种服务中进行分析，这里我们以 Coveralls 为例。

注意我们配置了只在 CI 上上传，因为我们前面配置了 Karma 在本地会常开着不停跑测试。

```javascript{17-19,76-79}
module.exports = config => {
  config.set({
    singleRun: !!process.env.CI,
    
    browsers: process.env.CI ? ['Chrome', 'Firefox'] : ['Chrome'],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    
    files: ['test/index.ts'],
    
    preprocessors: {
      'test/index.ts': ['webpack']
    },
    
    reporters: process.env.CI
      ? ['nyan', 'coverage-istanbul', 'coveralls']
      : ['nyan', 'coverage-istanbul'],
    
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },
    webpack: {
      mode: 'development',
      entry: './src/index.ts',
      output: {
        filename: '[name].js'
      },
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                configFile: 'test/tsconfig.json'
              }
            },
            exclude: [path.join(__dirname, 'node_modules')]
          },
          {
            test: /\.tsx?$/,
            include: [path.join(__dirname, 'src')],
            enforce: 'post',
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            }
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
      }
    },
    
    coverageIstanbulReporter: process.env.CI
      ? {
          reports: ['lcovonly', 'text-summary'],
          dir: path.join(__dirname, 'coverage'),
          combineBrowserReports: true,
          fixWebpackSourcePaths: true
        }
      : {
          reports: ['html', 'lcovonly', 'text-summary'],
          dir: path.join(__dirname, 'coverage/%browser%/'),
          fixWebpackSourcePaths: true,
          'report-config': {
            html: { outdir: 'html' }
          }
        },

    coverageReporter: {
      type: 'lcovonly',
      dir: 'coverage/'
    },

    nyanReporter: {
      renderOnRunCompleteOnly: process.env.CI
    }
  })
}
```

上 [Coveralls 网站](https://coveralls.io/)开启需要测试的仓库，会得到一个 `TOKEN`。

在 Travis 上同样开启这个仓库，在该项目设置中 Environment Variables 下添加环境变量 `COVERALLS_REPO_TOKEN`，值为上面的 Token。

## 在 Travis CI 上启用浏览器

Travis CI 是命令行环境，默认跑不了 GUI 程序，我们需要做些配置。

新建 `.travis.yml`

```yml
language: node_js
node_js:
  - 10.6.0
before_install:
  - "export DISPLAY=:99.0"
  - "sh -e /etc/init.d/xvfb start"
addons:
  firefox: latest
  chrome: stable
script:
  - yarn build
  - yarn test
```

其中浏览器可以根据插件的文档选择不同版本。

* Chrome: <https://docs.travis-ci.com/user/chrome>
* Firefox: <https://docs.travis-ci.com/user/firefox>

## 添加 Badges 到 README

最后我们把结果放到 README 上以展示这个项目的可靠性。

比如我的一个项目 [get-selection-more](https://github.com/crimx/get-selection-more) [![npm-version](https://img.shields.io/npm/v/get-selection-more.svg)](https://www.npmjs.com/package/get-selection-more) [![Build Status](https://travis-ci.org/crimx/get-selection-more.svg?branch=master)](https://travis-ci.org/crimx/get-selection-more) [![Coverage Status](https://coveralls.io/repos/github/crimx/get-selection-more/badge.svg?branch=master)](https://coveralls.io/github/crimx/get-selection-more?branch=master)

```markdown
[![npm-version](https://img.shields.io/npm/v/get-selection-more.svg)](https://www.npmjs.com/package/get-selection-more)
[![Build Status](https://travis-ci.org/crimx/get-selection-more.svg?branch=master)](https://travis-ci.org/crimx/get-selection-more)
[![Coverage Status](https://coveralls.io/repos/github/crimx/get-selection-more/badge.svg?branch=master)](https://coveralls.io/github/crimx/get-selection-more?branch=master)
```

将 `crimx/get-selection-more` 换成你的项目名称即可。

## 最后

这就是搭建 Karma 全家桶的基本流程，现在只需在 `test` 下新建 `**/*.spec.ts` 即可开始编写测试。由于每个工具各司其职，要更换或者添加新功能都非常容易。希望本文能帮助大家减少编写测试的困难，舒服地进行开发，产出更多可靠的项目。
