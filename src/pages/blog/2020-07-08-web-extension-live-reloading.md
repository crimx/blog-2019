---
layout: blog-post
draft: false
date: 2020-07-08T18:58:12.402Z
title: Web Extension Live Reloading
description: When developing Chrome extensions or Firefox addons it can be daunting having to keep clicking reload manually. Here is a step-by-step guide on how to implement extension live reloading in the browser.
quote:
  content: >-
    "Every day starts, my eyes open and I reload the program of misery. I open my eyes, remember who I am, what I'm like, and I just go, 'Ugh'."
  author: Louis C. K.
  source: ''
tags:
  - Extension
---

## TL;DR

Use [neutrino-webextension](https://github.com/crimx/neutrino-webextension/) which works out of the box.

Read on if you are interested in the theory behind the scene.

## Reload API

There is a [`browser.management`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/management) API which is used by many extension-livereload extensions. But looks like it does not work when `manifest.json` changes.

Instead we use another API [`browser.runtime.reload()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/reload) which reloads the extension itself.

## Reload Timing

How do we know when to reload? It should happens after file changes. If using bundler there usually be hooks for performing jobs after bundling. Otherwise take a look at [fs.watch](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener) or [node-watch](https://www.npmjs.com/package/node-watch). 

## Reload Signal

How does the extension know when to reload itself? It is not ideal using WebSocket or extension messaging API which involves native setups. Instead we try to leverage the browser extension API itself.

The idea is that the extension monitors web requests for a special url. Whenever the browser requests this url the extension gets notified and performs reloading logic.

## Project Structure

This is an example project structure for the sake of this post.

```bash
project/
├── livereload
│   ├── background.js
│   ├── livereload.html
│   └── livereload.js
├── src
│   ├── background
│   │   └── index.js
│   └── popup
│       ├── index.html
│       └── index.js
└── manifest.json
```

## Web Request Redirecting

First we need to be able to redirect web requests.

```json:title=manifest.json
{
  "background": {
    "persistent": true,
    "scripts": [
      "livereload/background.js",
      "src/background/index.js"
    ]
  },
  "permissions": [
    "*://neutrino-webextension.reloads/*",
    "webRequest",
    "webRequestBlocking"
  ],
  "web_accessible_resources": [
    "livereload/*"
  ]
}
```

`http://neutrino-webextension.reloads` is the special url that we are going to monitor.

```js:title=livereload/background.js
const b = typeof browser === 'undefined' ? chrome : browser

b.webRequest.onBeforeRequest.addListener(
  () => ({ redirectUrl: b.runtime.getURL('livereload/livereload.html') }),
  {
    urls: ['*://neutrino-webextension.reloads/*'],
    types: ['main_frame']
  },
  ['blocking']
)
```

It will redirect the request to `livereload/livereload.html`.

## Dummy Page

We first send a message to background, then close the page immediately.

```html:title=livereload/livereload.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Reload</title>
</head>
<body>
  <script src="./livereload.js"></script>
</body>
</html>
```

Script has to be in separate file.

```js:title=livereload/livereload.js
const b = typeof browser === 'undefined' ? chrome : browser

b.runtime.sendMessage('_neutrino-webextension.reloads_')

if (window.history.length <= 1) {
  window.close()
} else {
  history.back()
}
```

## Reload Extension

In background we listen to the messages and perform reloading.

```js{12-16}:title=livereload/background.js
const b = typeof browser === 'undefined' ? chrome : browser

b.webRequest.onBeforeRequest.addListener(
  () => ({ redirectUrl: b.runtime.getURL('livereload/livereload.html') }),
  {
    urls: ['*://neutrino-webextension.reloads/*'],
    types: ['main_frame']
  },
  ['blocking']
)

b.runtime.onMessage.addListener(message => {
  if (message === '_neutrino-webextension.reloads_') {
    b.runtime.reload()
  }
})
```

## Browsing History

So far so good! Except there is one tiny issue. The redirection will leave browsing histories in the browser. Let's remove it!

```json{10}:title=manifest.json
{
  "background": {
    "persistent": true,
    "scripts": [
      "livereload/background.js",
      "src/background/index.js"
    ]
  },
  "permissions": [
    "browsingData",
    "*://neutrino-webextension.reloads/*",
    "webRequest",
    "webRequestBlocking"
  ],
  "web_accessible_resources": [
    "livereload/*"
  ]
}
```

Remove before reloading.

```js{14-36}:title=livereload/background.js
const b = typeof browser === 'undefined' ? chrome : browser

b.webRequest.onBeforeRequest.addListener(
  () => ({ redirectUrl: b.runtime.getURL('livereload/livereload.html') }),
  {
    urls: ['*://neutrino-webextension.reloads/*'],
    types: ['main_frame']
  },
  ['blocking']
)

b.runtime.onMessage.addListener(message => {
  if (message === '_neutrino-webextension.reloads_') {
    b.browsingData.remove(
      {
        hostnames: [
          'neutrino-webextension.reloads'
        ],
        originTypes: {
          unprotectedWeb: true,
          protectedWeb: true
        },
        since: Date.now() - 2000
      },
      { history: true }
    )

    b.browsingData.remove(
      {
        originTypes: {
          extension: true
        },
        since: Date.now() - 2000
      },
      { history: true }
    )
    
    b.runtime.reload()
  }
})
```

This will remove the history of the special url and the `livereload.html`.

## Open Browser

To open the brower with the special url:

```bash
npm install --save-dev open
```

After file changes, call

```js
open('http://neutrino-webextension.reloads')

// specify browser
open('http://neutrino-webextension.reloads', { app: 'firefox' })

// with arguemnts
open(
  'http://neutrino-webextension.reloads',
  {
    app: ['google-chrome', '--profile-directory=Profile 1']
  }
)
```

The extension should recognise the request and reload itself.

## Conclusion

Even though it works, this is still a lot of work to setup if implementing manually. It is recommended use a preset like [neutrino-webextension](https://github.com/crimx/neutrino-webextension/) which is battery included.