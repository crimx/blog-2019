---
title: Google Chrome 霸权主义
tags:
  - Translation
  - Google
  - Chrome
  - JavaScript
  - Node
quote:
  content: ''
  author: ''
  source: ''
date: 2014-07-17T12:00:00.000Z
layout: blog-post
description: ''
---

原文：[Google Chrome Hegemony](http://code.tutsplus.com/tutorials/google-chrome-hegemony--cms-21478)

[Google Chrome](https://www.google.com/intl/en/chrome/browser/) 是当今互联网中最大的玩家之一。它快速、可靠、功能丰富；特别对 web 开发者来说非常好用。Chrome 也允许安装第三方扩展；Google 团队做得很不错，这些扩展只需 HTML、CSS 和 JavaScript 即可搭建。本文将介绍几个能帮助我们开发的 Chrome 利器。

本文的源码在[[这里]](https://github.com/tutsplus/Google-Chrome-Hegemony/)。

## 开发响应式 Web 应用

现在响应式无处不在。随着移动设备的崛起，我们需要让应用运行在各种不同分辨率的平台上。新版本的 Chrome 提供了很棒的工具来帮助我们减轻工作量。这里我们先做一个简单的页面然后让它变成响应式。先是HTML代码：

```html
<body>
    <h1>Responsive Web Design</h1>
    <ul class="nav">
        <li><a href="#">About</a></li>
        <li><a href="#">Concept</a></li>
        <li><a href="#">Examples</a></li>
        <li><a href="#">Frameworks</a></li>
        <li><a href="#">Contacts</a></li>
    </ul>
    <section class="concept">
        <p>Responsive web design (RWD) is a web design approach ...
    </section>
    <section class="elements">
        </p>The fluid grid concept calls for page element sizing to be in relative units ...
    </section>
</body>
```

还有一些简单的 CSS 样式，浮动导航链接并让两个章节（section）彼此相邻。效果如图：

![1][1]

准备好 HTML 和 CSS 后，我们就可以开始做些试验了。先学习添加媒体查询（Media Queries）断点。重点是要根据内容选择媒体并观察内容在什么范围会变得难看。不要因为流行就仅仅设置 1024x768 之类的分辨率。

设置视图（Viewport）
--------

我们希望了解在视图多大的时候内容会断层。此时需要调整浏览器的窗口大小。在 Chrome 里，可以使用开发者工具面板直接调整大小。

注意当我们改变视图大小的时候，右上角会显示当前的大小。这个小小的提示框省去了手动检查的麻烦。在我们的例子中，导航栏下的两个章节在 500px 左右就会显得过扁了。所以这里我们放置第一个媒体查询：

```css
section {
    float: left;
    width: 50%;
}
@media all and (max-width: 550px) {
    section {
        float: none;
        width: 100%;
    }
}
```

如果在 550px 再低一点，我们会发现 540px 左右导航栏会让窗口产生水平滚动条。再添加一个媒体查询解决这个问题：

```css
.nav {
    list-style: none;
    margin: 10px auto;
    padding: 0;
    width: 510px;
}
.nav li {
    float: left;
    margin: 0 20px 0 0;
}
@media all and (max-width: 540px) {
    .nav {
        width: auto;
    }
    .nav li {
        float: none;
        margin: 0;
        padding: 0;
        text-align: center;
    }
}
```

这就是一个适应多种分辨率的网页。虽然我们的页面很简陋，只有两个断点，但即便对于庞大的网站，选择断点的方法也是一样的。

### 设备模拟

有时候我们会收到 bug 显示应用在一些特定的设备上出错。Chrome 可以模拟各种各样的设备帮助我们解决问题。它会自动设置正确的分辨率和 HTTP 头；让我们方便地接近真实用户的视角。检测设备的 JavaScript 代码也会正常工作因为 Chrome 改变了请求报头。

比方说我们需要模拟一部 iPhone5 设备。在开发者工具面板的顶栏有一个小小的抽屉（drawer）按钮，然后选择模拟（Emulation）标签。

我们只需选择设备，Chrome 会自动应用所有的设置包括屏幕、用户代理（User agent）以及传感器；甚至还模拟了触摸事件。

### 在元素面板（Elements Panel）进行修改

我们的页面已经是响应式了，但有时候我们需要再做些修改。可以使用 Chrome 查看 `document` 上应用的样式。比如，第一个章节的文字太大了，我们希望做些修改并改变字体的颜色。

查看具体的 CSS 规则时元素面板也很有用，但在这里我们不知道这些规则是在哪里定义的。这时在右侧的窗口就可以查看当前元素上经过计算后的样式，我们可以在这里去做修改。

### 开发者工具面板

有时候我们需要搜索特定的 CSS 样式，但是这个样式有太多定义了找起来很麻烦。在开发者工具面板中有一个很好用的过滤区域。比方说我们想查看 `<section>` 标签中应用 `concept` 类的规则。只需这么做：

![2][2]

## JavaScript 调试

Google Chrome 是一个通用的工具。它有上一节提到的工具来支援设计师，也同样有支持开发者的工具。

### 集成 JS 调试

Chrome 集成了优秀的 JavaScript 调试器、控制台和源码查看器。为了说明这些工具是怎么工作的，我们先为例子添加一小段逻辑代码。我们希望点击 `Examples` 链接后该标签会变成 `Awesome examples`。借助 jQuery 可以让我们更好地关注到例子上。

```javascript
$('.nav').on('click', function(e) {
    var clicked = e.currentTarget;
    if(clicked.innerHTML === 'Examples') {
        clicked.innerHTML = 'Awesome examples';
    } else {
        console.log('do nothing ...');
    }
});
```

你很可能已经看出问题了，但且让我们运行以上代码看看。

![3][3]

无论我们点击什么都会控制台都会打印 `do nothing...`。看来我们的 `if` 语句总是 `false`。先设置一个断点看看发生了什么。

调试器在断点暂停并显示当前的局部变量。可以看到，`clicked` 变量指向的是导航栏的元素而不是 `<a>` 元素。所以它的 `innerHTML` 属性一定不是 `Exmaples`。这就是每次都打印 `do nothing...` 的原因。要修复这个 bug，将 `.nav` 改成 `.nav a` 即可。

![4][4]

以上是调试的传统方法，只有在我们知道哪里设断点的情况下才有用。但如果我们在大型的代码库上工作，特别是要调试一连串文件的时候，问题就来了。我们开始到处放置 `console.log` 然后观察控制台。这个办法是可行，但很快就会产生大量的数据，这时就很难从中过滤出需要的信息。Chrome 对这个问题也提供了解决方案。我们可以在传给 `.log` 的文本前添加 `%c` ，然后利用第二个参数调整控制台输出的样式。如图：

![5][5]

我们还可以添加一些其它的东西。console 对象有两个不太常见的方法 —— `group` 和 `groupEnd`。可以用来为 `log` 分组。

### 使用 Deb.js

Deb.js 库结合了样式控制和输出分组。只需要在添加 `.deb()` 到需要检查的函数末尾之前把 Deb.js 包含进来即可。使用 `.debc()` 可以在控制台显示折叠的输出组。

有了这个库，我们可以知道传给该函数的参数，函数的堆栈跟踪返回值和执行时间。正如上文提到的，这些信息被很好地组织和嵌套在一起，可以更方便地跟踪应用流。

## 浏览器终端

Google 浏览器的一个杀手锏是它的扩展应用生态系统。它为我们提供了途径去编写可安装的程序在浏览器中运行并提供了丰富的 [API](https://developer.chrome.com/extensions/api_index) 给我们使用。最重要的是，我们不必再去学习一门新语言。只需要普通的 HTML、CSS 和 JavaScript 即可。看看这里[《Chrome 扩展开发入门》](http://code.tutsplus.com/tutorials/developing-google-chrome-extensions--net-33076)。

Yez!
----

在 Chrome 网上应用店（Web Store）中甚至有一个单独的区域叫 [Web development](https://chrome.google.com/webstore/category/ext/11-web-development)，里面有许多专门为我们开发者制作的有用工具。其中有一个工具叫 [Yez!](https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap)。它为开发者工具面板提供了类似终端的功能。可以执行 shell 命令和实时获得输出。

该应用本身不足以执行 shell 命令，因为它没有权限访问操作系统。所以这里需要 Node.js 作为代理。Yez! 通过 web sockets 连接正在运行的 Node.js 应用。通过 Node.js 包管理器安装 Yez!：

```bash
npm install -g yez
```

### Yez! 集成 Git

Yez! 很好的整合了 Git，它会显示当前目录的分支。我们可以执行终端命令并立即得到输出。

这个扩展原本是作为一个任务运行器开发的。所以它提供了任务定义的接口。实际上，这不过是一系列按顺序执行的 shell 命令。我们可以通过 shell 脚本实现同样的效果。

我们还可以实时查看终端的输出，所以这个扩展非常适合开发 Node.js 应用。通常我们需要重启 Node.js 程序，但在 Chrome 中一切都是可见的。

## 执行 HTTP 请求

作为 web 开发者，我们经常需要让我们的应用执行 HTTP 请求。也许我们开发了一个 REST API，或者有一个接受 POST 参数的 PHP 脚本。这里有一个命令行工具 [cURL](http://code.tutsplus.com/tutorials/techniques-for-mastering-curl--net-8470)。它应该是最常用的 web 查询工具了。

有了 cURL,我们不再需要转到终端去。这里可以用 [DHC (REST HTTP API Client)](https://chrome.google.com/webstore/detail/dhc-rest-http-api-client/aejoelaoggembcahagimdiliamlcdmfm)。这个应用可以让我们完全控制 HTTP 请求。我们可以改变请求方式、报头、或者 GET 和 POST 参数。它还可以显示请求的结果，连同报头一起显示，非常实用。

## 使用 Chrome Web 驱动进行测试

我们都知道[测试](http://code.tutsplus.com/tutorials/the-newbies-guide-to-test-driven-development--net-13835)的重要性。清楚了解我们的程序运行正确对我们来说极为重要。有时候测试的编写会很困难，特别是当我们要测试用户界面。幸运的是，这里有一个 Node.js 模块可以控制我们的浏览器（Chrome）并触发动作比如访问页面、点击链接或者填写表格。它就是 [DalekJS](http://dalekjs.com/)。安装很简单：

```bash
npm install -g dalek-cli
```

我们做个小试验看看它是怎么工作的。在一个新建的目录中，我们需要一个 `package.json` 文件包含如下内容：

```json
{
  "name": "project",
  "description": "description",
  "version": "0.0.1",
  "devDependencies": {
    "dalekjs": "0.0.8",
    "dalek-browser-chrome": "0.0.10"
  }
}
```

接着在这个目录执行：

```bash
npm install
```

我们会在 `node_modules` 文件夹中看到有 `dalekjs` 和 `dalek-browser-chrome`。回到原来的目录，新建文件 `test.js`，我们会在这里中编写我们的测试。这是一个小脚本用来测试 GitHub 的搜索功能：

```javascript
var url = 'https://github.com/';
module.exports = {
    'should perform search in GitHub': function (test) {
        test
        .open(url)
        .type('#js-command-bar-field', 'dalek')
        .submit('#top_search_form')
        .assert.text('.repolist h3 a', 'dalekjs/dalek', 'There is a link with label dalekjs')
        .click('[href="/dalekjs/dalek"]')
        .assert.text('.repository-description p', 'DalekJS Base framework', 'It is the right repository')
        .done()
    }
};
```

要运行测试，我们需要在控制台中发射：

```bash
dalek ./test.js -b chrome
```

DalekJS 会启动 Google Chrome 浏览器的一个实例，然后打开 GitHub 网站，你可以在搜索框中输入 `dalek` ，它会跳转到正确的仓库。最后，Node.js 会把打开的窗口关闭。控制台的输出看起来是这样的：

![6][6]

DalekJS 支持 PhantomJS、Firefox、InternetExplorer 和 Safari。是个很有用的工具，在Windows、Linux 和 Mac 上都可以工作。在官网 [dalekjs.com](http://dalekjs.com/) 上可以获得文档。

## 总结

我们在电脑前花最多时间的就是看浏览器了。很高兴知道 Google Chrome 不仅是浏览网页的程序，还是一个强大的 web 开发工具。

如今，这里有着大量的实用扩展和持续增长的社区。如果你没有打算用 Google Chrome 开发你的下一个 web 应用，我强烈建议你去试一下。

[1]: /img/post/google-chrome-hegemony/1.jpg
[2]: /img/post/google-chrome-hegemony/2.gif
[3]: /img/post/google-chrome-hegemony/3.gif
[4]: /img/post/google-chrome-hegemony/4.gif
[5]: /img/post/google-chrome-hegemony/5.gif
[6]: /img/post/google-chrome-hegemony/6.jpg

