---
title: Manacher 马拉车算法
tags:
  - Manacher
  - 算法
  - Algorithms
  - 回文
  - Palindrome
  - 字符串
  - String
  - Recommended
quote:
  content: 'A Man, A Plan, A Canal-Panama!'
  author: Leigh Mercer
  source: ''
date: 2017-07-06T12:00:00.000Z
layout: blog-post
description: ''
---

马拉车算法可以在线性时间复杂度内求出一个字符串的最长回文字串。其核心思想跟 KMP 相似，即反复利用已掌握的情况。

视频推荐看这个，觉得是最清晰易懂的：

<iframe width="560" height="315" src="https://www.youtube.com/embed/nbTSfrEfo6M" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 整体思路

这个算法的主要思路是维护一个跟原串 str 一样长的数组 lens。lens[i] 表示以 str[i] 为中点的回串其中一边的长度。这里有的人把中点算进去，有的人记录两边的长度，其实都一样，我这里是只记录一边的长度，不包括中点。比如 `"CDCDE"`

```
str:  [C, D, C, D, E]
lens: [0, 1, 1, 0, 0]
```

那么 lens 里最大的自然就对应最长回串的中点了。所以这个算法的核心就是如何快速计算 lens。

## 预处理

回文有奇偶长度两种情况，通过补充间隔符可以将这两种情况化简为奇数长度。

比如 `ABA` 补充为 `#A#B#A#` 中点还是 B，`ABBA` 补充为 `#A#B#B#A#` 中点为 `#`，最后可以去掉。

算法用 JavaScript 写，我将原串转为数组，间隔符就用 `null`。

最后在两侧补上哨兵点方便遍历中止。我用了 `NaN`。所以看起来是这样

```javascript
var arr = [NaN, null]
for (let i = 0; i < str.length; i += 1) {
  arr.push(str[i])
  arr.push(null)
}
arr.push(NaN)
```

## 计算长度数组

### 朴素计算方法

以一个中心计算回串，最直接的方法当然是左右遍历对比了，比如以 i 为中心：

```javascript
lens[i] = 0
while (arr[i + lens[i] + 1] === arr[i - lens[i] - 1]) {
  lens[i] += 1
}
```

这个就是计算长度基本方式。n 个点，每个点最多计算 n/2 遍，所以是 n 平方复杂度。

### 手背手心都是肉

看回上面的算法，可以发现，lens[i] 是从 0 开始的，这个很正常，一开始当然是 0 ，回串嘛，从中心开始两侧都要一一比较相等才行。

但再进一步看，0 代表从头开始，即对于每个中心点，我们都是从什么都不知道开始，什么情况都没有掌握。

事实是这样吗？

既然有了这个算法，事实当然不是。这时就很容易联系到回串的特性，对称。

先来一个简单的例子 `OABAXABAO`。两个 B 是 X 的对称点，左边 B 对应的 lens[j] 长度显然是 1，当我们计算右边 B 的 lens[i] 时候，是不是可以把 lens[j] 的值直接复制过来。因为它们是镜面对称的，所以都是一样，不过是反过来而已。

### 最右中心

我们维护一个已知最右的回串，设其中心点 iCenter 以及其最右点 iRight。显然两者有这么的关系 `iRight = iCenter + lens[iCenter]`。

这个回串是最右的，也就是说 iRight 是最大的。有更右的就不断更新。

为什么要维护最右回串？

当我们一个个遍历中点 i 时，因 iCenter 已知，故必然是已经遍历过了，所以 i 肯定是在 iCenter 的右边，这就保证了两种情况：

1. i <= iRight，在最右回串的范围内，可以应用上面的镜面复制；
2. i > iRight，超出了最右，在未知区域，只能用朴素方式计算。

这就是这个算法的核心思想了，最后引入两个边界情况：

### 右贴界

像简单例子的 `OABAXABAO` 可以明确知道 X 和 O 不相等，所以复制过来就行。但如果是 `OABAXABA...` 就不知道下一个是不是 X 了。我们只能知道下一个肯定不是 O，因为最右串 X 的范围到 A 就截止了。

所以右边 B 对应的 lens[i] 得到了 1 之后，在这基础上继续用朴素方式比较两侧。

意思是“我现在可以确定右 B 两侧 1 个长度内是对称的，其它未知，继续比较下去看如何”。

如果右 B 比较下去有戏的话，那么右 B 就是新的最右串了，更新 iCenter 和 iRight 值。

右贴界的条件是 `i + lens[i] === iRight`。

### 左越界

对于串 `XABAXABA...`。两个 B 还是 X 的对称点，但是左边的 B 对应的 lens[j] 长度是 2，右边 B 的 lens[i] 可以看到是 1。

为什么？

理解上面提到的镜面对称就很简单了，X 为中心的回串是 `ABAXABA`，也就是左边到了 A 就截止了，左 X 是超出的，所以不对称。因为如果最右的下一个位也是 X 的话，最右回串就应该是 `XABAXABAX` 了是不是。

所以，当左边的 B 超出了中心 X 的范围时，我们只复制在最右回串范围内的部分。

即对于左边的 B，我们知道范围内的是 `ABA` ，为 1，复制给右边 B 对应的 lens[i]，再按右贴界处理。

设左 B 的索引为 iMirror，因为左右 B 对称，故 `iMiiror = iCenter - (i - iCenter) = 2 * iCenter - i`。

左 B 到 iCenter 左边界的距离我们用镜面对称过来就是右 B 到 iCenter 右边界的距离 `iRight - i`。

于是左越界的条件就是 `lens[iMiiror] > iRight - i`。

### 整合

可以看到，我们复制镜面值要考虑三种情况，范围内、右贴界、左越界，其中左越界又包含了右贴界。于是简洁起见，我们全部当右贴界处理，因为如果在范围内比较下去自然不相等，相当于去掉了 if 判断。

然后整合范围内和左越界，范围内指 `lens[iMiiror] <= iRight - i`，直接复制 `lens[iMiiror]`；左越界指 `lens[iMiiror] > iRight - i`，取 `iRight - 1`。故整合为 `min(iRight - i, lens[iMirror])`。

## 完整算法

所以完整算法如下

```javascript
function manacher (str) {
  str = String(str)

  var arr = [NaN, null]
  for (let i = 0; i < str.length; i += 1) {
    arr.push(str[i])
    arr.push(null)
  }
  arr.push(NaN)

  var iCenterMax = 1
  var lens = []
  var iCenter = 0
  var iRight = 0
  for (let i = 1; i < arr.length - 1; i += 1) {
    if (arr.length - 1 - i <= lens[iCenterMax]) {
      break
    }

    lens[i] = 0

    if (i < iRight) {
      let iMirror = 2 * iCenter - i
      lens[i] = Math.min(iRight - i, lens[iMirror])
    }

    while (arr[i + lens[i] + 1] === arr[i - lens[i] - 1]) {
      lens[i] += 1
    }

    if (i + lens[i] > iRight) {
      iCenter = i
      iRight = i + lens[i]
    }

    if (lens[i] > lens[iCenterMax]) {
      iCenterMax = i
    }
  }

  return arr.slice(iCenterMax - lens[iCenterMax], iCenterMax + lens[iCenterMax] + 1)
    .filter(item => item !== null)
    .join('')
}
```

