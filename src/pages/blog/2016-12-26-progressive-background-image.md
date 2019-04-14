---
title: Progressive background-image With Ease
tags:
  - CSS
  - Image
  - Progressive Image
  - GraphicsMagick
  - Recommended
quote:
  content: ''
  author: ''
  source: ''
date: 2016-12-26T12:00:00.000Z
layout: blog-post
description: ''
---

Everyone likes smooth loading. Lately I tried to make the `background-image` of the menu to load progressively(also to the cover if you view the blog on mobile).

If you take a look at how [Medium](https://medium.com/) does progressive image loading(or check out [this article](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)), you'll notice that they use JavaScript and canvas to blur and store thumbnails. It seems a bit overkill to me. And when you need to do it on a `background-image` with `background-position`, things become even more complicated.

So I needed to figure out a simpler solution. Here's what I came up with:

## Blur by default

As the article above mentioned: 

> By default, when a browser renders a small image scaled up, it applies a light blur effect to smooth the artefacts of the image. The effect can also be [turned off](https://developers.google.com/web/updates/2015/01/pixelated) for images like QR codes.

But the default blur effect still feels blocky.

<p>
  <img src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDIBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIABMAHgMBIgACEQEDEQH/xABoAAADAQEAAAAAAAAAAAAAAAAAAwYECBAAAgEDBAIBBQAAAAAAAAAAAQMCAAQSBQYRITGBFBMiM1FxAQADAQEAAAAAAAAAAAAAAAACAwQAAREAAgMBAAAAAAAAAAAAAAAAAAECESES/9oADAMBAAIRAxEAPwCWVtNVrBU7/V0Kg7kQC0sblx6A5p13tjTQuDbPVl4kgSzjKPX7AIpNzq+P01TvVXYUcoSxl0f6a26buvUbRQUp1uBkTxKfAo30DaLrbWyLOVtJivgXqpQwkzMDIiqnTdiaSu2iltikwgPt4kJVBWO6vjsVdsuNIWwHgyWsy6PkERA7qst992j1QkE2jAYgywnLjKkSUr0amqw58FOj59UUVUTjY+PVbrf8dFFdMf/Z" alt="thumbnail" style="width: 100%;">
</p>

To make it smoother, I applied blur effect to the thumbnails while generating them, using [GraphicsMagick for node](https://github.com/aheckmann/gm):

```javascript
const gm = require('gm')

gm(coverPath)
  .resize(30) // or .resize(null, 30) for portrait
  .blur(5)
  .noProfile()
  .write(thumbnailPath, function (err) {
    if (err) { console.warn(err) }
    // ...
  })

// or to base64
gm(coverPath)
  .resize(30) // or .resize(null, 30) for portrait
  .blur(5)
  .noProfile()
  .toBuffer(function (err, buffer) {
    if (err) { console.warn(err) }
    var base64 = 'data:image/' + ext + ';base64,' + buffer.toString('base64')
    // ...
  })
```

<p>
  <img src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDIBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIABMAHgMBIgACEQEDEQH/xABiAAADAQEAAAAAAAAAAAAAAAAABAYDCBAAAQQCAgMBAAAAAAAAAAAAAQACAwQGERIhBTFBFAEAAwEAAAAAAAAAAAAAAAAAAAIDBBEAAgMBAAAAAAAAAAAAAAAAAAECESES/9oADAMBAAIRAxEAPwCXixaOsGutW2tDvWgmZsVrODH1rGwT30lbHlNBrHTNlDfRTVDI54WhgMet/U76FtF3jeHVnV+jHIHN0dlVlLDKEcPB8TdD12oHx+Vfm4SmWFh+gKrgzuu+MEcCVGSlelU1WHPwWrUIWkzmrSdJ+FzhGNEoQgD/2Q==" alt="thumbnail" style="width: 100%;">
</p>

This looks acceptable to me. No need for a canvas or blur function. Already felt relieved! :smile:

## Layers

This method divides a component into four layers: container, thumbnail, mask and content.

- Container holds the full-size background image.
- Thumbnail holds the blur thumbnail, as `background-image`.
- Mask is a translucent black element, to darken the background.
- Everything else lives in the content layer.

Use `z-index` to separate the layers.

## Image onload

When full-size image is loaded, hide the thumbnail. You can use this technic(with jQuery/Zepto):

```javascript
var $container = $('.container')
// Matchs the "url(...)"
var bigBgSrc = $container.css('background-image').match(/url\((.+?)\)/i)

if (bigBgSrc) {
  // Removes quotations
  bigBgSrc = bigBgSrc[1].replace(/'|"/g, '')

  $('<img>')
    .on('load', function () {
      $container.find('.thumbnail')
        .addClass('thumbnail--hide') // Hides thumbnail
    })
    .prop('src', bigBgSrc)
}
```

A live example:

<p>
  <iframe height='437' scrolling='no' title='Progressive background-image Loading' src='//codepen.io/straybugs/embed/preview/gLJyXW/?height=437&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; height: 437px;'>See the Pen <a href='http://codepen.io/straybugs/pen/gLJyXW/'>Progressive background-image Loading</a> by CrimX (<a href='http://codepen.io/straybugs'>@straybugs</a>) on <a href='http://codepen.io'>CodePen</a>.</iframe>
</p>

## No-js

No-js support is extremely easy. Just hide the thumbnail.

```css
html.no-js .thumbnail {
  display: none !important;
}
```

For my blog I also made a [Sass Mixin/Extend](https://github.com/crimx/blog/blob/master/themes/crimx/source/_scss/libs/_progressive-background-image.scss) with this method.

