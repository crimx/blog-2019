---
title: 265行代码实现第一人称引擎
tags:
  - Translation
  - JavaScript
  - Game
quote:
  content: A very small man can cast a very large shadow.
  author: Varys
  source: ''
date: 2014-06-11T12:00:00.000Z
layout: blog-post
description: ''
---

原文：[A first-person engine in 265 lines](http://www.playfuljs.com/a-first-person-engine-in-265-lines/)（2014-6-11）

今天，让我们进入一个可以伸手触摸的世界吧。在这篇文章里，我们将从零开始快速完成一次第一人称探索。本文没有涉及复杂的数学计算，只用到了光线投射技术。你可能已经见识过这种技术了，比如《上古卷轴2 : 匕首雨》、《毁灭公爵3D》还有 Notch Persson 最近在 ludum dare 上的参赛作品。Notch 认为它够好，我就认为它够好！ 【[Demo (arrow keys / touch)](http://www.playfuljs.com/demos/raycaster)】【[Source](https://github.com/hunterloftis/playfuljs/blob/master/content/demos/raycaster.html)】

![raycaster-result][raycaster-result]

用了光线投射就像开挂一样，作为一名懒得出油的程序员，我表示非常喜欢。你可以舒畅地浸入到3D环境中而不受“真3D”复杂性的束缚。举例来说，光线投射算法消耗线性时间，所以不用优化也可以加载一个巨大的世界，它执行的速度跟小型世界一样快。水平面被定义成简单的网格而不是多边形网面树，所以即使没有 3D 建模基础或数学博士学位也可以直接投入进去学习。

利用这些技巧很容易就可以做一些让人嗨爆的事情。15分钟之后，你会到处拍下你办公室的墙壁，然后检查你的 HR 文档看有没有规则禁止“工作场所枪战建模”。

## 玩家

我们从何处投射光线？这就是玩家对象（Palyer）的作用，只需要三个属性 x，y，direction。

```javascript
function Player(x, y, direction) {
  this.x = x;
  this.y = y;
  this.direction = direction;
}
```

## 地图

我们将地图存作简单的二维数组。数组中，0代表没墙，1代表有墙。你还可以做得更复杂些，比如给墙设任意高度，或者将多个墙高度数据——“楼层（stories）”打包进数组。但作为我们的第一次尝试，用0-1就足够了。

```javascript
function Map(size) {
  this.size = size;
  this.wallGrid = new Uint8Array(size * size);
}
```

## 投射一束光线

这里就是窍门：光线投射引擎不会一次性绘制出整个场景。相反，它把场景分成独立的列然后一条一条地渲染。每一列都代表从玩家特定角度投射出的一条光线。如果光线碰到墙壁，引擎会计算玩家到墙的距离然后在该列中画出一个矩形。矩形的高度取决于光线的长度——越远则越短。

![raycaster-idea][raycaster-idea]

绘画的光线越多，显示效果就会越平滑。


1.找到每条光线的角度

我们首先找出每条光线投射的角度。角度取决于三点：玩家面向的方向，摄像机的视野，还有正在绘画的列。

```javascript
var angle = this.fov * (column / this.resolution - 0.5);
var ray = map.cast(player, player.direction + angle, this.range);
```

2.通过网格跟踪每条光线

接下来，我们要检查每条光线经过的墙。这里的目标是最终得出一个数组，列出了光线离开玩家后经过的每面墙。

![raycaster-grid][raycaster-grid]

从玩家开始，我们找出最接近的横向（stepX）和纵向（stepY）网格坐标线。移到最近的地方然后检查是否有墙（inspect）。一直重复检查直到跟踪完每条线的所有长度。
   
   ```javascript
   function ray(origin) {
     var stepX = step(sin, cos, origin.x, origin.y);
     var stepY = step(cos, sin, origin.y, origin.x, true);
     var nextStep = stepX.length2 < stepY.length2
       ? inspect(stepX, 1, 0, origin.distance, stepX.y)
       : inspect(stepY, 0, 1, origin.distance, stepY.x);
   
     if (nextStep.distance > range) return [origin];
     return [origin].concat(ray(nextStep));
   }
   ```

寻找网格交点很简单：只需要对 x 向下取整（1,2,3...），然后乘以光线的斜率（rise/run）得出 y。

   ```javascript
   var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
   var dy = dx * (rise / run);
   ```

现在看出了这个算法的亮点没有？我们不用关心地图有多大！只需要关注网格上特定的点——与每帧的点数大致相同。样例中的地图是32×32，而32,000×32,000的地图一样跑得这么快！


3.绘制一列

跟踪完一条光线后，我们就要画出它在路径上经过的所有墙。

   ```javascript
   var z = distance * Math.cos(angle);
   var wallHeight = this.height * height / z;
   ```

我们通过墙高度的最大除以 z 来觉得它的高度。越远的墙，就画得越短。


额，这里用 cos 是怎么回事？如果直接使用原来的距离，就会产生一种超广角的效果（鱼眼镜头）。为什么？想象你正面向一面墙，墙的左右边缘离你的距离比墙中心要远。于是原本直的墙中心就会膨胀起来了！为了以我们真实所见的效果去渲染墙面，我们通过投射的每条光线一起构建了一个三角形，通过 cos 算出垂直距离。如图：

![raycaster-distance][raycaster-distance]

我向你保证，这里已经是本文最难的数学啦。


## 渲染出来

我们用摄像头对象 Camera 从玩家视角画出地图的每一帧。当我们从左往右扫过屏幕时它会负责渲染每一列。

在绘制墙壁之前，我们先渲染一个天空盒（skybox）——就是一张大的背景图，有星星和地平线，画完墙后我们还会在前景放个武器。

```javascript
Camera.prototype.render = function(player, map) {
  this.drawSky(player.direction, map.skybox, map.light);
  this.drawColumns(player, map);
  this.drawWeapon(player.weapon, player.paces);
};
```

摄像机最重要的属性是分辨率（resolution）、视野（fov）和射程（range）。

- 分辨率决定了每帧要画多少列，即要投射多少条光线。

- 视野决定了我们能看的宽度，即光线的角度。

- 射程决定了我们能看多远，即光线长度的最大值

## 组合起来

使用控制对象 Controls 监听方向键（和触摸事件）。使用游戏循环对象 GameLoop 调用 requestAnimationFrame 请求渲染帧。这里的 gameloop 只有三行

```javascript
oop.start(function frame(seconds) {
  map.update(seconds);
  player.update(controls.states, map, seconds);
  camera.render(player, map);
});
```

## 细节

###雨滴

雨滴是用大量随机放置的短墙模拟的。

```javascript
var rainDrops = Math.pow(Math.random(), 3) * s;
var rain = (rainDrops > 0) && this.project(0.1, angle, step.distance);

ctx.fillStyle = '#ffffff';
ctx.globalAlpha = 0.15;
while (--rainDrops > 0) ctx.fillRect(left, Math.random() * rain.top, 1, rain.height);
```

这里没有画出墙完全的宽度，而是画了一个像素点的宽度。


### 照明和闪电

照明其实就是明暗处理。所有的墙都是以完全亮度画出来，然后覆盖一个带有一定不透明度的黑色矩形。不透明度决定于距离与墙的方向（N/S/E/W）。

```javascript
ctx.fillStyle = '#000000';
ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
ctx.fillRect(left, wall.top, width, wall.height);
```

要模拟闪电，map.light 随机达到2然后再快速地淡出。


### 碰撞检测

要防止玩家穿墙，我们只要用他要到的位置跟地图比较。分开检查 x 和 y 玩家就可以靠着墙滑行。

```javascript
Player.prototype.walk = function(distance, map) {
  var dx = Math.cos(this.direction) * distance;
  var dy = Math.sin(this.direction) * distance;
  if (map.get(this.x + dx, this.y) <= 0) this.x += dx;
  if (map.get(this.x, this.y + dy) <= 0) this.y += dy;
};
```

### 墙壁贴图

没有贴图（texture）的墙面看起来会比较无趣。但我们怎么把贴图的某个部分对应到特定的列上？这其实很简单：取交叉点坐标的小数部分。

```javascript
step.offset = offset - Math.floor(offset);
var textureX = Math.floor(texture.width * step.offset);
```

举例来说，一面墙上的交点为（10,8.2），于是取小数部分0.2。这意味着交点离墙左边缘20%远（8），离墙右边缘80%远（9）。所以我们用 0.2 * texture.width 得出贴图的 x 坐标。


## 试一试

在[恐怖废墟](http://www.playfuljs.com/demos/raycaster)中逛一逛。

还有人扩展了[社区版](http://www.playfuljs.com/demos/raycaster-community)。

- [ctolsen](https://github.com/ctolsen)添加了 [WASD 方向键](https://github.com/hunterloftis/playfuljs/pull/3)。

[Fredrik Wallgren](https://github.com/walle) 实现了 [Java 移植](https://github.com/walle/raycaster)。

## 接下来做什么？

因为光线投射器是如此地快速、简单，你可以快速地实现许多想法。你可以做个地牢探索者（Dungeon Crawler）、第一人称射手、或者侠盗飞车式沙盒。靠！常数级的时间消耗真让我想做一个老式的大型多人在线角色扮演游戏，包含大量的、程序自动生成的世界。这里有一些带你起步的难题：

- 浸入式体验。样例在求你为它加上全屏、鼠标定位、下雨背景和闪电时同时出现雷响。

- 室内级别。用对称渐变取代天空盒。或者，你觉得自己很屌的话，尝试用瓷片渲染地板和天花板。（可以这么想：所有墙面画出来之后，画面剩下的空隙就是地板和天花板了）

- 照明对象。我们已经有了一个相当健壮的照明模型。为何不将光源放到地图上，通过它们计算墙的照明？光源占了80%大气层。

- 良好的触摸事件。我已经搞定了一些基本的触摸操作，手机和平板的小伙伴们可以尝试一样 demo。但这里还有巨大的提升空间。

- 摄像机特效。比如放大缩小、模糊、醉汉模式等等。有了光线投射器这些都显得特别简单。先从控制台中修改 camera.fov 开始。

同往常一样，如果你造了什么炫爆的东西或者有什么相关的研究要分享，发 [email](mailto:hunter@hunterloftis.com) 给我或 [tweet](http://twitter.com/hunterloftis) 我，我会分享给大家的。


## 讨论

Hacker News 上的[讨论](https://news.ycombinator.com/item?id=7842037)。

- [Raycasting in Comanche](http://simulationcorner.net/index.php?page=comanche) -高度地图光线投射超棒的例子。

## 感谢

本来打算写两个钟的文章结果写了三周。没有以下小伙伴的帮助我是不可能写完这篇文章的：

- [Jim Snodgrass](http://twitter.com/snodgrass23): editing & feedback
- [Jeremy Morrell](http://twitter.com/jeremymorrell): editing & feedback
- [Jeff Peterson](http://twitter.com/arsinh): editing & feedback
- [Chris Gomez](http://akagomez.com/): weapons & feedback
- [Amanda Lenz](https://www.etsy.com/shop/HeleneDorothy): laptop bags and support
- [Nicholas S](http://shadowh3.deviantart.com/art/Wall-Texture-73682375): wall texture
- [Dan Duriscoe](http://apod.nasa.gov/apod/ap070508.html): Death Valley skybox 


[raycaster-result]:   /img/post/first-person-engine/raycaster-result.gif
[raycaster-idea]:     /img/post/first-person-engine/raycaster-idea.png
[raycaster-grid]:     /img/post/first-person-engine/raycaster-grid.png
[raycaster-distance]: /img/post/first-person-engine/raycaster-distance.png

