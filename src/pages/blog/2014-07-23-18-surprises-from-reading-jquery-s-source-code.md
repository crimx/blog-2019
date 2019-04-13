---
title: 阅读 jQuery 源码的18个惊喜
tags:
  - Translation
  - JavaScript
  - jQuery
quote:
  content: Anyone who has never made a mistake has never tried anything new.
  author: Einstein
  source: ''
date: 2014-07-23T12:00:00.000Z
layout: blog-post
description: ''
---

原文：[18 Surprises From Reading jQuery's Source Code](http://quickleft.com/blog/18-surprises-from-reading-jquery-s-source-code)（2014-7-23）

我热爱 jQuery，且尽管我认为自己算是一名高级 JavaScript 开发者，我从来没有试过由头到尾把 jQuery 的源码看一遍，直到现在。这里分享一些我一路下来学到的东西：

注意：我使用 `$.fn.method()` 语法来表示调用一组匹配元素的方法。比如当我说 `$.fn.addClass`，则表示 `$('div').addClass('blue')` 或者 `$('a.active').addClass('in-use')` 此类的用法。`$.fn` 是 jQuery 包装元素的原型。

1. **Sizzle 的权重：**[Sizzle](http://sizzlejs.com/) 是 jQuery 用于在 DOM 找元素的的选择器引擎，基于 CSS 选择器。正是它将 `$('div.active')` 转换成可操作的元素数组。我知道 Sizzle 占了 jQuery 相当大的部分，但它的庞大还是吓到了我。按行数来说它很无疑是 jQuery 中唯一最庞大的特性。我估计它占了总代码库的 22%，而第二大的特性—— `$.ajax` 只占了 8%。

2. **$.grep：**[这个方法](http://api.jquery.com/jquery.grep/)与 Underscore 的 `_.filter` 类似。接受两个参数，一个元素数组和一个函数，对每个元素依次执行函数，返回执行结果为 true 的元素数组。

3. **冒泡禁令：**jQuery 明文禁止 `load` 事件冒泡。从内部看，jQuery 在所有的 `load` 事件中传入特殊的 `noBubble: true` 标记，所以 `image.load` 事件才不会冒泡到 `window` 上错误地触发 `window.load` 事件。

4. **默认动画速度：**jQuery 通过快速连续地改变样式属性来实现元素动画效果。每一次小改变被称作一个 `tick`。默认动画速度是每13毫秒运行一次 `tick`，要改变速度你可以重写 `jQuery.fx.interval` 成你想要的整数。

5. **fn.addClass 可以接受函数：**我们通常向 `$.fn.addClass` 提供一个包含类名的字符串来创建元素。但它也可以接受一个函数。这个函数必须返回一个字符串，多个类名间要以空格隔开。这里还有个彩蛋，这个函数接受已匹配元素的索引作为参数，你可以用这个特性来构造智能变化的类名。

6. **fn.removeClass 也一样：**与上文的一样，它也可以接受一个函数。这个函数也会自动接收元素的索引。

7. **:empty 伪选择器：**可以方便地用来匹配没有孩子的元素。

8. **:lt 与 :gt 伪选择器：**它们会根据元素在匹配集合中的索引来匹配元素。比如 `$('div:gt(2)')` 会返回所有的 `div`，除了前三个（从0开始）。如果你传入一个负数，它会倒过来从尾开始数。

9. **$(document).ready() 的承诺：** jQuery 貌似是用回了自己的东西。在内部，可信赖的 `$(document).ready()` 使用了一个 jQuery 延迟来确定 DOM 在什么时候完全加载。

10. **$.type：** 大家肯定能熟练使用 `typeof` 来确定数据类型，但你知不知道 jQuery 提供了一个 `.type()` 方法？jQuery 版比原生版更加智能。比如 `typeof (new Number(3))` 返回 `object`，而 `$.type(new Number(3))` 则返回 `number`。更新：正如 ShirtlessKirk 在评论中指出，`$.type` 返回其对象的 `.valueOf()` 属性。所以更准确的说法应该是 `$.type` 告诉你一个对象的返回值的类型。

11. **$.fn.queue：**你可以通过 `$(‘div’).queue()` 查看一个元素的效果队列，很方便地了解元素还剩余多少效果。更有用的是，你可以直接操作队列去添加效果。从 jQuery 文档摘录的：

```javascript
$( document.body ).click(function() {
$( "div" )
    .show( "slow" )
    .animate({ left: "+=200" }, 2000 )
    .queue(function() {
        $( this ).addClass( "newcolor" ).dequeue();
    })
    .animate({ left: "-=200" }, 500 )
    .queue(function() {
        $( this ).removeClass( "newcolor" ).dequeue();
    })
    .slideUp();
});
```

12. **禁用元素不会触发 click 事件：**jQuery 默认不会为禁用的元素执行 `click` 事件，有了这个优化，你无需自己用代码再检查一遍。

13. **$.fn.on 可以接受对象：**你知道 `$.fn.on` 可以接受一个对象来一次过连接多个事件吗？jQuery 文档的例子：

```javascript
$( "div.test" ).on({
click: function() {
    $( this ).toggleClass( "active" );
}, mouseenter: function() {
    $( this ).addClass( "inside" );
}, mouseleave: function() {
    $( this ).removeClass( "inside" );
}
});
```

14. **$.camelCase：**这个有用的方法可以将连字符式的字符串转换成驼峰式的字符串。

15. **$.active：**调用 `$.active` 返回 XHR (XML Http Request) 查询的个数。利用它可以手动制定 AJAX 请求的并发上限。

16. **$.fn.parentsUntil / $.fn.nextUntil / $.fn.prevUntil：**我比较熟悉 `.parents()`、`.next()` 和 `.prev()`，却不知道原来还有其它的方法。它们会匹配所有的 双亲/下一个/前一个 元素直到（until）遇到符合终止条件的元素。

17. **$.fn.clone 参数：**当你用 `.clone()` 克隆一个元素，你可以用 `true` 作为第一个参数来克隆该元素的数据属性（data attributes）和事件。

18. **更多的 $.fn.clone 参数：**除了上面的方法外，你还可以再传多一个 `true` 参数来克隆该元素所有孩子的数据属性和事件。这叫做“深克隆”。第二个参数的默认值与第一个一样（第一个默认false）。所以当第一个参数是 `true` 而你想让第二个参数也是 `true` 时，完全可以忽略第二个参数。


