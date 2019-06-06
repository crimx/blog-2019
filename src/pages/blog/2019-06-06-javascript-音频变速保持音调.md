---
layout: blog-post
draft: false
date: 2019-06-06T08:31:35.025Z
title: JavaScript 音频变速保持音调
description: >-
  在上篇文章中我们提到如何结合 React
  为音频显示波形与区间循环播放，但有时候音频说话太快了，我们需要放慢下来听，所以本文我们来看看如何实现音频的变速，以及如何处理变速时声调出现的奇怪变化。
quote:
  author: Benoit Mandelbrot
  content: >-
    "Think of color, pitch, loudness, heaviness, and hotness. Each is the topic
    of a branch of physics."
  source: ''
tags:
  - React
  - Audio
  - Waveform
  - Wavesurfer
  - SoundTouch
  - Pitch Stretch
---
<iframe src="https://codesandbox.io/embed/waveform-iejmy?fontsize=14&view=preview" title="Waveform" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Playback​ Rate

在浏览器的 Web Audio API 中其实已经提供了原生的[接口](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate)来调整播放速度。但因为我们前面用了 Wavesurfer 显示波形，所以应该用它封装好的 `setPlaybackRate(rate)` 方法来调速。

这里有坑需要注意，经测试浏览器在过低的速度会抛异常，我们需要做好边界控制。一般限制在 `0.1` 到 `3` 之间是比较保险，且超出这个范围一般也听不清了。

## 数字编辑器

为了让用户直观地调整速率，这里可以使用一个 React 组件 [`react-number-editor`](https://github.com/tleunen/react-number-editor)。它支持拖曳、快捷键与手动设置数字。

![react-number-editor](https://camo.githubusercontent.com/f59fb638a4a08e2567b11ecd737c53d6076d212a/687474703a2f2f692e696d6775722e636f6d2f5649774d5363622e676966)

## Pitch Stretch

就这么简单地实现了变速之后（你可以在文章开头的 CodeSandBox 例子中关闭最右的按钮 "Pitch Stretch" 把玩），你可能会发现，变速的同时声调也会发现奇怪的变化。放慢时声调变得很沉很恐怖，加快时声调变得很尖很搞笑。这是为什么呢？

其实我是在没搞清原因的情况下实现了这个功能，但正好这周的 Wait But Why 谈到了 [Everything You Should Know About Sound](https://waitbutwhy.com/2016/03/sound.html)。其中一张图我认为非常适合解释了。

![Wave Pitch](/img/wave-2.gif)

可以看到，当我们把声音加快的时候，其实是把波长（Wavelength）压短了，于是产生了更高的音高（Pitch）。要想保持原来的音高，我们必须要把波长拉长，但因为整个的时间缩短了，所以中间必须要舍弃一些信息。反过来也一样，放慢的时候波长伸长了，我们要压短回正常，整个时长就不够了，需要凑一些额外的信息。

应该增加或丢弃哪些部分根据使用场景的不同没有标准答案，所以就有各种拉伸（Pitch Stretch）的算法。

目前找到的有

- <https://github.com/cutterbl/SoundTouchJS>
- <https://github.com/danigb/timestretch>
- <https://github.com/sebpiq/paulstretch.js>
- <https://github.com/echo66/OLA-TS.js>
- <https://github.com/echo66/PhaseVocoderJS>
- <https://github.com/Infinity/Kali>
- <https://github.com/0xfe/vexwarp>
- <https://github.com/mikolalysenko/pitch-shift>
- <https://github.com/GTCMT/pitchshiftjs>

其中大部分都已经停止了维护，但还是能用的状态。因为 Wavesurfer 官方提供了 SoundTouch 的[例子](http://wavesurfer-js.org/example/stretcher/)，所以我用的也是这个。但注意这个方式在 Firefox 下是有问题的，我目前是在 Firefox 下取消加载。如果你希望支持 Firefox ，echo66 的 PhaseVocoderJS 是个稳定的实现，输出质量也不错，但其项目组织有点散，我还没有精力捣腾。

## SoundTouch

在 React 组件中跟前面 Wavesurfer 一样，我们也对 SoundTouch 进行懒加载。其中我们需要做的是同步 SoundTouch 和 Wavesurfer，有两个地方需要同步：

1. 两者在同个位置播放。
2. 两者使用一样的 Playback Rate。

### 同步位置

因为 SoundTouch 基本没有文档，所以我也根据源码大概推导出整个的流程，并做了一些修改。先看初始化：

```javascript
import { SoundTouch, SimpleFilter, getWebAudioNode } from 'soundtouchjs'

export default class Waveform extends React.PureComponent {
  shouldSTSync = false

  initSoundTouch = () => {
    const buffer = this.wavesurfer.backend.buffer
    const bufferLength = buffer.length
    const lChannel = buffer.getChannelData(0)
    const rChannel =
      buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : lChannel
    let seekingDiff = 0
    const source = {
      extract: (target, numFrames, position) => {
        if (this.shouldSTSync) {
          // get the new diff
          seekingDiff =
            ~~(this.wavesurfer.backend.getPlayedPercents() * bufferLength) - position
          this.shouldSTSync = false
        }

        position += seekingDiff

        for (let i = 0; i < numFrames; i++) {
          target[i * 2] = lChannel[i + position]
          target[i * 2 + 1] = rChannel[i + position]
        }

        return Math.min(numFrames, bufferLength - position)
      }
    }

    this.soundTouch = new SoundTouch(this.wavesurfer.backend.ac.sampleRate)
    this.soundTouchNode = getWebAudioNode(
      this.wavesurfer.backend.ac,
      new SimpleFilter(source, this.soundTouch)
    )
    this.wavesurfer.backend.setFilter(this.soundTouchNode)
  }
}
```

这里 `source.extract` 方法是我们同步播放位置的地方。这个方法会在播放时不停被调用，所以我们会做一些优化缓存，在用户改变指示器位置时（seeking）我们再计算一遍位置偏差。需要计算时设置 `this.shouldSTSync = true` 即可。

同时对于单声道的音频我们把声道复制到另一边以免出现只有一边声音的问题。

上文的 Wavesurfer 初始化方法中，在用户改变指示器时同步

```javascript{24}
initWavesurfer = () => {
  const wavesurfer = WaveSurfer.create({
    container: '#waveform-container',
    waveColor: '#f9690e',
    progressColor: '#B71C0C',
    plugins: [RegionsPlugin.create()]
  })

  this.wavesurfer = wavesurfer

  wavesurfer.enableDragSelection({})

  wavesurfer.on('region-created', region => {
    this.removeRegion()
    this.region = region
  })
  wavesurfer.on('region-update-end', this.play)
  wavesurfer.on('region-out', this.onPlayEnd)

  wavesurfer.on('seek', () => {
    if (!this.isInRegion()) {
      this.removeRegion()
    }
    this.shouldSTSync = true
  })

  wavesurfer.on('ready', this.play)

  wavesurfer.on('finish', this.onPlayEnd)
}
```

### 同步播放速率

同步播放速率很简单，在设置 Wavesurfer 播放速率时同时设置 SoundTouch 的即可。

```javascript
this.wavesurfer.setPlaybackRate(speed)
this.soundTouch.tempo = speed
```

其中 `tempo` 是个 setter 故直接赋值即可。

## 按需加载

正如上面提到，播放时 `extract` 会被不停调用，性能相比默认情况当然会有些损失。我们前面已把初始化封装起来，接下来只需在速率变化时按需加载即可（速率默认为 1 无需加载）。

```javascript{10-12}
updateSpeed = speed => {
  this.setState({ speed })

  if (speed < 0.1 || speed > 3) {
    return
  }

  if (this.wavesurfer) {
    this.wavesurfer.setPlaybackRate(speed)
    if (speed !== 1 && this.state.pitchStretch && !this.soundTouch) {
      this.initSoundTouch(this.wavesurfer)
    }
    if (this.soundTouch) {
      this.soundTouch.tempo = speed
    }
  }

  this.shouldSTSync = true
}
```

同样，更新复原方法释放对象

```javascript
reset = () => {
  this.removeRegion()
  this.updateSpeed(1)
  if (this.wavesurfer) {
    this.wavesurfer.pause()
    this.wavesurfer.empty()
    this.wavesurfer.backend.disconnectFilters()
  }
  if (this.soundTouch) {
    this.soundTouch.clear()
    this.soundTouch.tempo = 1
  }
  if (this.soundTouchNode) {
    this.soundTouchNode.disconnect()
  }
  this.soundTouch = null
  this.soundTouchNode = null
  this.shouldSTSync = false
}
```

现在播放音频，调整速率，可以听到声调保持正常了，但放慢的时候可能会有卡带的感觉，这是 SoundTouch 算法的缺陷。这点 echo66 的 PhaseVocoderJS 做得很棒，有精力一定看看如何整合进来。
