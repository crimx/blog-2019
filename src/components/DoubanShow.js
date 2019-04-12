import React from 'react'

const itemWidth = 100
const itemHeight = (itemWidth * 100) / 65
const itemPadding = 3

const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <style>
    html, body {
      margin: 0;
      padding: 0;
    }

    .douban-show-scroller {
      position: relative;
      overflow-y: hidden;
    }

    ${
  typeof document !== 'undefined' &&
      'ontouchstart' in document.documentElement
    ? ''
    : `.douban-show-scroller:after {
        content:'';
        position: absolute;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        transform: translateY(${itemHeight + itemPadding * 2}px);
        background: #fff;
        transition: opacity .3s;
      }

      .douban-show-scroller:hover:after {
        opacity: 0;
        transform: translateY(100%);
        transition: opacity .3s, transform 0s .3s;
      }`
}

    .douban-show-container {
      overflow-x: scroll;
      overflow-y: hidden;
      padding: 0 ${itemPadding}px;
    }

    .douban-show-container .title {
      padding: 13px 13px 6px;
    }

    .douban-show-container table {
      table-layout: fixed;
      width: ${20 * (itemWidth + itemPadding * 2)}px;
      height: ${itemHeight + itemPadding * 2}px;
    }

    .douban-show-container table td {
      width: ${itemWidth}px;
      height: ${itemHeight}px;
      padding: 0;
      border: none;
    }

    .douban-show-container table td a {
      display: block;
      height: 100%;
      padding: ${itemPadding}px;
    }

    .douban-show-container img {
      max-width: 100%;
      max-height: 100%;
    }
  </style>
</head>
<body>
  <div class="douban-show-scroller">
    <div class="douban-show-container">
      <script
        type="text/javascript"
        src="//www.douban.com/service/badge/jaward/?selection=favorite&amp;picsize=medium&amp;hideself=on&amp;show=collection&amp;n=40&amp;hidelogo=on&amp;cat=book&amp;columns=40"
      ></script>
    </div>
  </div>
  <div class="douban-show-scroller">
    <div class="douban-show-container">
      <script
        type="text/javascript"
        src="//www.douban.com/service/badge/jaward/?selection=favorite&amp;picsize=medium&amp;hideself=on&amp;show=collection&amp;n=40&amp;hidelogo=on&amp;cat=movie&amp;columns=40"
      ></script>
    </div>
  </div>
</body>
</html>
`

const DoubanShow = React.memo(() => (
  <iframe
    srcDoc={srcDoc}
    style={{
      overflow: 'hidden',
      width: '100%',
      height: 2 * (itemHeight + itemPadding * 2) + 50,
      border: 'none'
    }}
  />
))

export default DoubanShow
