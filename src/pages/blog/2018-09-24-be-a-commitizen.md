---
title: 如何文明提交代码
tags:
  - Git
quote:
  content: Every good citizen adds to the strength of a nation.
  author: Gordon B. Hinckley
  source: ''
date: 2018-09-24T12:00:00.000Z
layout: blog-post
description: ''
---


程序员最烦的几件事：写测试，变量命名，还有填代码提交信息（commit message）。翻几个开源项目遍马上可以回味那作文凑字数的青春时光。

其实 commit message 的作用远不止如此，经过简单的配置便可无痛成为代码提交的文明公民。

## Commit Message 的作用

最起码的一点，项目的提交历史是其他人（包括未来的自己）了解项目的一个重要途径。好的提交历史可以方便其他人参与进来，也可以方便自己快速定位问题。

此外，提交信息还可以用来触发 CI 构建，自动生成 CHANGELOG ，版本自动语义化提升…… 只需要一点点配置就可以干这么多，真是懒人必备。


## 选择风格

跟 Code Style 一样，Commit Message 也有各种风格。如果没什么特殊癖好推荐用基于 Angular ，
后独立开来的 [Conventional Commits](https://www.conventionalcommits.org/) 风格。
它也基本是各个工具的默认配置，所以搭配起来不需要折腾。

## 才不要又记什么规则

虽然规则不多，但不一定能随时记住，特别是对新人，必须要有友好的方式提交。

commitizen 是一个很好的选择，通过命令行回答几个问题即可填完信息，减轻了记忆负担。
它是一个通用的工具，通过插件方式支持各种风格。我们选择 Conventional 需要安装
[cz-conventional-changelog](https://github.com/commitizen/cz-cli#adapters) 。

```
npm install --save-dev commitizen cz-conventional-changelog
```

然后配置 `package.json` 就可以通过 `npm run commit` 提交。

```json
{
  "scripts": {
    "commit": "git-cz"
  }
}
```

另外 VSCode 用户也可以用 [vscode-commitizen](https://github.com/KnisterPeter/vscode-commitizen) ，
通过 `ctrl+shift+p` 或 `command+shift+p` 提交。

## Lint 一 Lint 万无一失

没错，Commit Message 也有 Linter ，可对 Commit Message 进行检验，杜绝打字手残和浑水摸鱼。

这里用 commitlint 配合 husky 实现自动检测。

commitlint 也是通用的工具，需要同时安装风格配置。 husky 可以方便使用 git hooks ，在 commit 时触发 commitlint 。

```
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky
```

项目根新建 `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

配置 `package.json`

```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
}
```

## 自动更新

最后安装 [standard-version](https://github.com/conventional-changelog/standard-version) 实现自动生成 CHANGELOG 和版本自动语义化提升。

```
npm install --save-dev standard-version
```

配置 `package.json`

```json
{
  "scripts": {
    "release": "standard-version"
  }
}
```

第一次发布时可以用以下命令重置

```
npm run release -- --first-release
```

以后直接 `npm run release` 即可。

也可以手动指定版本：

```
# npm run script
npm run release -- --release-as minor
# Or
npm run release -- --release-as 1.1.0
```

## 小红花贴起来

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?maxAge=2592000)](http://commitizen.github.io/cz-cli/)

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg?maxAge=2592000)](https://conventionalcommits.org)

在 README 中加入小徽章可方便其他人了解风格。

```
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?maxAge=2592000)](http://commitizen.github.io/cz-cli/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg?maxAge=2592000)](https://conventionalcommits.org)
```

## 完整配置

安装

```
npm install --save-dev commitizen cz-conventional-changelog @commitlint/cli @commitlint/config-conventional husky standard-version
```

配置 `package.json`

```json
{
  "scripts": {
    "commit": "git-cz",
    "release": "standard-version"
  },
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
}
```

项目根新建 `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

【完】

