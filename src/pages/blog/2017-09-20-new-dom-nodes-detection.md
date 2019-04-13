---
title: 检测 DOM 结点插入
tags:
  - 闲读源码
quote:
  content: Doesn't expecting the unexpected make the unexpected expected?
  author: Bob Dylan
  source: ''
date: 2017-09-20T12:00:00.000Z
layout: blog-post
description: ''
---

闲逛 Github 时碰见一个叫 SentinelJS 的库，声称能检测 DOM 结点的插入，顿时引起了好奇。因为以前无聊时也想过一下，没什么头绪，便不了了之。当时第一反应是该不会用轮询吧（比这粗暴的实现也不是没见过）。但看到 682 bytes (minified + gzipped) 大小时感觉一定又是用了什么奇淫怪巧，个人对这种东西很感兴趣（见另一篇[《巧妙监测元素尺寸变化》](//blog.crimx.com/2017/07/15/element-onresize/)），便顺便看了看源码，很短，但一看到 `animation` 时便拍大腿了！通过检测 animationstart 事件来检测插入，机智！

代码很短，就是维护了一个事件队列。核心在 [`onFn`](https://github.com/muicss/sentineljs/blob/master/src/sentinel.js#L37) 和 [`offFn`](https://github.com/muicss/sentineljs/blob/master/src/sentinel.js#L87) 上。后者同理，便主要看 `onFn` 的实现。

```javascript
/**
 * Add watcher.
 * @param {array} cssSelectors - List of CSS selector strings
 * @param {Function} callback - The callback function
 */
function onFn(cssSelectors, callback, extraAnimations) {
  if (!callback) return;

  // initialize animationstart event listener
  if (!isInitialized) init();

  // listify argument
  cssSelectors = Array.isArray(cssSelectors) ? cssSelectors : [cssSelectors];

  // add css rules and cache callbacks
  cssSelectors.map(function(selector) {
    var animId = selectorToAnimationMap[selector];

    if (!animId) {
      // add new CSS listener
      var css, i;

      animId = 'sentinel-' + Math.random().toString(16).slice(2);

      // add keyframe rule
      css = '@keyframes ' + animId +
        '{from{transform:none;}to{transform:none;}}';
      i = styleSheet.cssRules.length;
      styleSheet.insertRule(css, i);
      styleSheet.cssRules[i]._id = selector;

      // add selector animation rule
      css = selector + '{animation-duration:0.0001s;animation-name:' + animId;
      if (extraAnimations) css += ',' + extraAnimations;
      css += ';}';
      i += 1;
      styleSheet.insertRule(css, i);
      styleSheet.cssRules[i]._id = selector;

      // add to map
      selectorToAnimationMap[selector] = animId;
    }

    // add to callbacks
    var x = animationCallbacks[animId] = animationCallbacks[animId] || [];
    x.push(callback);
  });
}
```

先生成一个随机的带前缀的 `animId` 来区分每个事件。

```javascript
animId = 'sentinel-' + Math.random().toString(16).slice(2);
```

`styleSheet` 为一个事先挂载的 `<style>` 元素，所有的 animation 样式都会插入到这里。

插入 `@keyframes` 之后在这条规则上面以选择器做了一个私有的标记 `_id`，为了在移除事件的时候找到这条规则。

```javascript
// add keyframe rule
      css = '@keyframes ' + animId +
        '{from{transform:none;}to{transform:none;}}';
      i = styleSheet.cssRules.length;
      styleSheet.insertRule(css, i);
      styleSheet.cssRules[i]._id = selector;
```

接下来再插入一个持续 `0.0001s` 的动画，监听搞定。

接下来初始化的时候在 `document` 上[监听](https://github.com/muicss/sentineljs/blob/master/src/sentinel.js#L18) `animationstart` 事件：

```javascript
doc.addEventListener(event, animationStartHandler, true);
```

通过事件的 `animationName` 来匹配 `animId`，成功则取消其它监听这个事件的回调。

```javascript
/**
 * Animation start handler
 * @param {Event} ev - The DOM event
 */
function animationStartHandler(ev) {
  var callbacks = animationCallbacks[ev.animationName] || [],
      l = callbacks.length;

  // exit if a callback hasn't been registered
  if (!l) return;

  // stop other callbacks from firing
  ev.stopImmediatePropagation();

  // iterate through callbacks
  for (var i=0; i < l; i++) callbacks[i](ev.target);
}
```

这个 `stopImmediatePropagation` 学到了！结合 window 上用 capture 方式监听事件，就可以保证点击植入的特定元素不会受其它事件影响。马上用在了这个 [rarbg-monitor](https://chrome.google.com/webstore/detail/rarbg-monitor/kkgcfdmlnfpdjmnheeojdlgpmhaeekga) 扩展上，在 rarbg 资源页面上放一个跳转豆瓣相应页面的按钮，优先级比它的一个全局广告要高。

-EOF-

