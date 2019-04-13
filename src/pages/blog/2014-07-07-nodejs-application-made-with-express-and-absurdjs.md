---
title: 使用 Express 与 AbsurdJS 构建 Node.js 应用
tags:
  - Translation
  - JavaScript
  - Node
  - Express
quote:
  content: ''
  author: ''
  source: ''
date: 2014-07-07T12:00:00.000Z
layout: blog-post
description: ''
---

原文：[Node.js application made with Express and AbsurdJS](http://krasimirtsonev.com/blog/article/Nodejs-application-made-with-Express-and-AbsurdJS)（2014-7-7）

当今有许多新技术吸引着越来越多的开发者，[Node.js](http://nodejs.org/) 便是其中之一。主要因为它是 JavaScript 驱动的，许多人都很感兴趣。在本教程中，我将会教你结合 [Express](http://expressjs.com/) 去使用 [AbsurdJS](http://absurdjs.com/)。Express 是流行的 Node.js 框架，而 AbsurdJS 则比较新鲜，希望你看完后会发现它很有用。

本文中出现的源码都可以从[这里](http://krasimirtsonev.com/blog/articles/AbsurdJSExpress/source.zip)下载。

## 简介

正如我提到的，Express 很流行。因为它是最早的 Node.js 框架之一。它把所有琐碎的事情都包办了，比如路由选择、参数解析、模板、向浏览器发送响应。它的库基于 [Connect](http://www.senchalabs.org/connect/) 提供的中间件架构对原生的 Node.js 进行了较好的封装。

AbsurdJS 一开始是一个 CSS 预处理器。目的是为 CSS 开发者带来更好的灵活性。它接受纯 JavaScript 代码并转换为 CSS。大家对它的反馈都比较积极，我也在努力继续完善它。现在它不仅能预处理 CSS，还可以处理 HTML。它接受 JSON 和 YAML 并成功导出作客户端使用。

## 步骤

为了使最后做出的项目能跑起来，我们需要安装 Node.js。只需打开 <http://nodejs.org> 并点击大大的绿色“INSTALL”按钮。下载并安装完成后你就可以调用 Node.js 脚本，用npm（Node 的包管理器）安装依赖包。

为你的项目新建一个文件夹，里面再新建一个空的“package.json”文件。包管理器会以这个文件为起点去安装我们需要的包。我们只需两个包，所以 json 文件应该是这个样子：

```javascript
{
    "name": "AbsurdJSAndExpress",
    "description": "AbsurdJS + Express app",
    "version": "0.0.1",
    "dependencies": {
        "express": "3.4.4",
        "absurd": "*"
    }
}
```

当然，这里还有许多其它的参数可以配置，但为了方便举例我们就先按上面的配置吧。打开终端，定位包含到 Package.json 的目录，执行：

```bash
npm install
```

会在当前目录生成 node_modules 文件夹，并自动下载 Express 和 AbsurdJS。

## 运行服务器

有了 Express 你只需要简单几行代码就可以运行一个 http 服务器。

```javascript
var express = require('express'),
    app = express();
 
app.listen(3303);
console.log('Listening on port 3303');
```

保存以上代码为 app.js 并运行：

```bash
node app.js
```

这时控制台应该显示 “Listening on port 3303”。浏览器打开 http://localhost:3303/ 会看到：

```bash
Cannot GET /
```

不用担心，这很正常，因为我们还没有添加路由。

## 添加路由

Express 提供了友好的 API 去定义 URL 路由。我们在这里简单地添加一个，把下面的代码贴到 app.js 中。

```javascript
app.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.send("application");
});
```

这里做了几件事。.get 方法的第一个参数定义了路径；第二个参数是个方法，用来处理请求，它接受三个参数 – request、response、next。这里的好处是我们可以传入多个函数，它们会一个接一个的被调用。我们需要做的只是执行 next()，否者 next 方法不会被调用。比如：

```javascript
app.get(
    '/', 
    function(req, res, next) {
        console.log("do some other stuff here");
        next();
    },
    function(req, res, next) {
        res.send("application");
    }
);
```

路由定义中通用的做法是添加一些可重用的任务作为中间件。比如说，我们有两种 Content-Type, HTML 和 CSS。用下面的方法就显得更加灵活。

```javascript
var setContentType = function(type) {
    return function(req, res, next) {
        res.setHeader('Content-Type', 'text/' + type);
        next();
    }
}
app.get('/', setContentType("html"), function(req, res, next) {
    res.send("application");
});
```

如果我们需要提供 CSS，只要用 setContentType(“css”) 即可。

## 提供 HTML

很多 Express 的教程和文章都会介绍一些模板引擎。通常是 Jade、Hogan 或者 Mustache。然而，如果用 AbsurdJS 我们不需要模板引擎。我们可以用纯 JavaScript 编写 HTML。更具体的说，是用 JavaScript 对象。我们先从实现着陆页开始。新建文件夹 pages，在里面新建 landing.js 文件。我们在用 Node.js 所以文件里应该包含：

```javascript
module.exports = function(api) {
    // ...
}
```

注意返回的函数接受 AbsurdJS API 的引用。这正是我们所要的。现在再加点 HTML：

```javascript
module.exports = function(api) {
    api.add({
        _:"<!DOCTYPE html>",
        html: {
            head: {
                'meta[http-equiv="Content-Type" content="text/html; charset=utf-8"]': {},
                'link[rel="stylesheet" type="text/css" href="styles.css"]': {}
            },
            body: {}
        }
    });
}
```

“_” 属性添加的字符串在编译成HTML时不会被转换；其它的属性各定义了一个标签。还可以用其它方法去定义标签属性，但我认为用上面的方式更好。这个想法是从 Sublime 的 [Emmet](http://emmet.io/) 插件中获得的。编译完成后会生成：

```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <link rel="stylesheet" type="text/css" href="styles.css"/>
    </head>
    <body/>
</html>
```

本次教程只有一个页面，而在现实中你可能会在多个页面中使用相同的HTML。此时更合理的做法是将这部分代码移到外部的文件中，在需要的时候引用进来。当然，这里还可以使用可重复模板。创建文件 /pages/partials/layout.js ：

```javascript
module.exports = function(title) {
    return {
        _:"<!DOCTYPE html>",
        html: {
            head: {
                'meta[http-equiv="Content-Type" content="text/html; charset=utf-8"]': {},
                'link[rel="stylesheet" type="text/css" href="styles.css"]': {},
                title: title
            },
            body: {}
        }
    };
};
```

这里其实就是一个返回对象的函数。所以，之前的 landing.js 可以修改为：

```javascript
module.exports = function(api) {
    var layout = require("./partials/layout.js")("Home page");
    api.add(layout);
}
```

可以看到，layout 模板接受 title 变量。这样就可以动态地生成一部分内容。

接下来是向 body 标签添加内容。非常简单，因为所有内容都是纯 JavaScript 对象。

```javascript
module.exports = function(api) {
    var layout = require("./partials/layout.js")("Home page");
    layout.html.body = {
        h1: "Page content"
    }
    api.add(layout);
}
```

生成的结果：

```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <link rel="stylesheet" type="text/css" href="styles.css"/>
        <title>Home page</title>
    </head>
    <body>
        <h1>Page content</h1>
    </body>
</html>
```

本文的代码看起来都很短、不完整，是因为全写的话文章就太长了。接下来我只会介绍一下建立无序列表的思想，因为这里比较有意思。剩余的部分跟 layout 类似，就不再敖述。

下面就是生成无序列表的片段。`<ul></ul>`标签：

```javascript
module.exports = function(data) {
    var html = { ul: [] };
    for(var i=0; item=data[i]; i++) {
        html.ul.push({ li: item });
    }
    return html;
}
```

这里只用了一个 ul 属性定义一个对象。ul 其实就是一个数组，装满列表中的项。

```javascript
var list = require("./partials/list.js");
var link = require("./partials/link.js");
list([
    link("http://krasimir.github.io/absurd", "Official library site"),
    link("https://github.com/krasimir/absurd", "Official repository")
]);
```

link 也是片段，类似这样子：

```javascript
module.exports = function(href, label) {
    return { 
        a: { _attrs: { href: href }, _: label }
    }
}
```

组合起来后就会生成：

```html
<ul>
    <li>
        <a href="http://krasimir.github.io/absurd">
            Official library site
        </a>
    </li>
    <li>
        <a href="https://github.com/krasimir/absurd">
            Official repository
        </a>
    </li>
</ul>
```

现在，想象我们有一堆可以使用的片段。如果它们编写得足够灵活，只需创建一次就可以在项目之间传递了。AbsurdJS 是如此强大，只要我们拥有一堆足够好的预定义集合，就可以快速、更具描述性地编写 HTNL 标记。

最后，当 HTML 已经完成后，我们只需编译并发送给用户。于是，对 app.js 做小小的变动使得我们的应用响应正确的标记：

```javascript
var absurd = require("absurd");
var homePage = function(req, res, next) {
    absurd().morph("html").import(__dirname + "/pages/landing.js").compile(function(err, html) {
        res.send(html);
    });
}
app.get('/', setContentType("html"), homePage);
```

## 提供 CSS

与 HTML 类型，先在 app.js 为 style.css 添加路由。

```javascript
var styles = function(req, res, next) {
    absurd().import(__dirname + "/styles/styles.js").compile(function(err, css) {
        res.send(css);
    });
}
app.get('/styles.css', setContentType("css"), styles);
```

使用 JavaScript 定义 CSS。任何东西都可以放在分好的 Node.js 模块中。让我们创建 /styles/styles.js 并加入代码：

```javascript
module.exports = function(api) {
    api.add({
        body: {
            width: "100%",
            height: "100%",
            margin: 0,
            padding: 0,
            fontSize: "16px",
            fontFamily: "Arial",
            lineHeight: "30px"
        }
    })
}
```

一个简单的 `<body>` 样式控制。注意带有破折号的属性被改写成驼峰式大小写风格。否则不能创建有效对象，会得警告。

现在假设要控制 `<h1>` 和 `<h2>` 标签的样式。它们都是标题，颜色和字体相同；但是大小不一样。通过下面的方法，AbsurdJS会智能地输出正确的样式。

```javascript
var title = function() {
    return {
        color: "#2C6125",
        fontWeight: "normal",
        fontSize: "40px",
        fontFamily: "Georgia",
        padding: "20px 10px"
    }
} 
api.add({
    h1: title(),
    h2: [
        title(), 
        { fontSize: "30px" }
    ]
});
```

输出结果：

```css
h1, h2 {
    color: #2C6125;
    font-weight: normal;
    font-family: Georgia;
    padding: 20px 10px;
}
h1 {
    font-size: 40px;
}
h2 {
    font-size: 30px;
}
```

预处理器会收集只定义了一次的相同样式，并为不同的样式创建新的定义。

## 结论

如果打算使用 Node.js，Express 会是最好的起点之一。它虽然不是超级强大，但依然很好用。它具备了开发 web 应用所需的基本要素。然后去扩展它，使用 AbsurdJS 会为开发带来不少趣味性，因为整个应用都是用纯 JavaScript 编写的。

## 资源

- Express 官网 – <http://expressjs.com/>
- Express GitHub 仓库 - <https://github.com/visionmedia/express>
- AbsurdJS 官网与在线编译器 – <http://absurdjs.com>
- AbsurdJS GitHub 仓库 – <https://github.com/krasimir/absurd>

