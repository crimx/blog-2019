---
title: Git 分支模式笔记
tags:
  - Git
quote:
  content: ''
  author: ''
  source: ''
date: 2014-08-11T12:00:00.000Z
layout: blog-post
description: ''
---

正想了解 Git 开发流程方面的资料，就碰上了这篇 2010 年的[好文](http://nvie.com/posts/a-successful-git-branching-model/)。没有时间翻译，就做一下笔记。

-------------

## 主要内容

![git-module][git-module]

可以看到，该模型分支的组成主要有 5 种类型：

* master
* develop
* release
* feature
* hotfix

开发主要在 develop 上做，稳定版本释放由 develop 派生 release 分支。发布一段时间确定可以后，就合并回 develop 和 master 并打 tag。

若以后 master 出现问题需要修改，就派生 hotfix 分支修复，最后合并回 master 和 develop。

feature 派生自 develop，主要是尝试新特性。成功的话合并回 develop。

下面是各个分支的细节：

## 主要分支（The main branches）

![main_branches][main_branches]

主要分支是 master 和 develop 分支。

约定 origin/master  上的 HEAD 总是代表“生产就绪（production-ready）状态”。  
约定 origin/develop 上的 HEAD 总是代表“下一个 release 的最新开发进展”。

具体怎么从 develop 合并到 master 在 [release 分支](#release-branches)中会讲到。

## 辅助分支（Supporting branches）

辅助分支是 feature、release 和 hotfix 分支。

### feature 分支

![feature-branches][feature-branches]

可能派生自：develop  
必须合并到：develop  
分支命名惯例：除了 `master`, `develop`, `release-*` 或 `hotfix-*` 的其它名字

feature 分支一般不会出现在 origin 中。如果尝试失败的话甚至不会合并到 develop 分支中。

1、创建 feature 分支，从 develop 分支中派发：

```bash
$ git checkout -b myfeature develop
Switched to a new branch "myfeature"
```

2、成功的 feature 分支最终合并回 develop 分支：

```bash
$ git checkout develop
Switched to a new branch "develop"

$ git merge --no-ff myfeature
Updating ea1b82a..05e9557
(Summary of changes)

$ git branch -d myfeature
Deleted branch myfeature (was 05e9557)

$ git push origin develop
```

`--no-ff` 会阻止 Git 进行 fast-farward（下图右），并在 develop 分支上产生新的结点标识 feature 分支的合并。这么做以后更容易回头查看变更。

![merge-with-without-ff][merge-with-without-ff]

### release 分支

可能派生自：develop  
必须合并到：develop 与 master  
分支命名惯例：`release-*`

当为本次发布的功能（几乎）都完成了之后，就可以派生 release 分支等待正式发布。可以在 release 分支上做些小修复。其它的修改最好提到下次的发布上。

1、创建分支，第一时间就要修改版本号：

```bash
$ git checkout -b release-1.2 develop
Switched to a new branch "release-1.2"

$ ./bump-version.sh 1.2
Files modified successfully, version bumped to 1.2.

$ git commit -a -m "Bumped version number to 1.2"
[release-1.2 74d9424] Bumped version number to 1.2
1 files changed, 1 insertions(+), 1 deletions(-)
```

`bump-version.sh` 是虚构的一个脚本用来在项目相关文件上修改版本号。

2、真正发布后，合并到 master 分支上并打 tag

```bash
$ git checkout master
Switched to branch 'master'

$ git merge --no-ff release-1.2
Merge made by recursive.
(Summary of changes)

$ git tag -a 1.2
```

3、如果 release 分支上修改了 bug，则也要合并会 develop 分支，注意版本号文件可能会冲突：

```bash
$ git checkout develop
Switched to branch 'develop'

$ git merge --no-ff release-1.2
Merge made by recursive.
(Summary of changes)
```

4、删除 release 分支

```bash
$ git branch -d release-1.2
Deleted branch release-1.2 (was ff452fe).
```

### hotfix 分支

![hotfix-branches][hotfix-branches]

可能派生自：master  
必须合并到：develop 与 master  
分支命名惯例：`hotfix-*`

hotfix 与 release 一样也会产生新的 tag，只不过 hotfix 分支是被动出现的。

1、创建分支，记得提升版本号

```bash
$ git checkout -b hotfix-1.2.1 master
Switched to a new branch "hotfix-1.2.1"

$ ./bump-version.sh 1.2.1
Files modified successfully, version bumped to 1.2.1.

$ git commit -a -m "Bumped version number to 1.2.1"
[hotfix-1.2.1 41e61bb] Bumped version number to 1.2.1
1 files changed, 1 insertions(+), 1 deletions(-)
```

2、提交修复

```bash
$ git commit -m "Fixed severe production problem"
[hotfix-1.2.1 abbe5d6] Fixed severe production problem
5 files changed, 32 insertions(+), 17 deletions(-)
```

3、确定可以后合并回 master 分支，记得打 tag

```bash
$ git checkout master
Switched to branch 'master'

$ git merge --no-ff hotfix-1.2.1
Merge made by recursive.
(Summary of changes)

$ git tag -a 1.2.1
```

4、再合并回 develop 分支

```bash
$ git checkout develop
Switched to branch 'develop'

$ git merge --no-ff hotfix-1.2.1
Merge made by recursive
(Summary of changes)
```

5、删除 hotfix 分支

```bash
$ git branch -d hotfix-1.2.1
Deleted branch hotfix-1.2.1 (was abbe5d6).
```

[git-module]:            /img/post/git/branch-module/git-module.png
[main_branches]:         /img/post/git/branch-module/main_branches.png
[feature-branches]:      /img/post/git/branch-module/feature-branches.png
[merge-with-without-ff]: /img/post/git/branch-module/merge-with-without-ff.png
[hotfix-branches]:       /img/post/git/branch-module/hotfix-branches.png

