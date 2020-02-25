---
layout: blog-post
draft: false
date: 2020-02-25T17:58:01.302Z
title: 'RxJS Hooks and Suspense: The Ultimate Guide'
description: >-
  In witch I suggested a simple, flexible, testable and performant solution to
  use RxJS Observable with React hooks and Suspense.
quote:
  author: William Shakespeare
  content: 'We are time''s subjects, and time bids be gone.'
  source: ''
tags:
  - RxJS
  - JavaScript
  - React
---
(This post is also on [medium](https://medium.com/@straybugs/rxjs-hooks-and-suspense-the-ultimate-guide-6d4f61dc224c))

## Why Hooks

Stateful logic is unavoidable in any React project. In early days we used the `state` property in Class-Components to hold stateful values.

### "This" isn't the way

But quickly we realized that it is prone to lose track of states in "this" way. So we divided Components into stateful(smart) Components and stateless(dumb) Components. Stateful logic is delegated to parent stateful Components to keep most Components stateless.

This does not solve the issue, just makes it less painful.

### Time travelling

Then came the age of Redux(and MobX etc.). We started to put states into central stores which can be tracked with devtools and stuff.

This does not solve the issue, just delegates it to outside stores.

Introducing stores is acceptable for a full project but would be too bloated for developing reusable stateful Components.

### Get on the Hook

React Hooks fills this gap by offering a mechanism that connects side-effects separately within the Component.

For stateful logic it is like connecting to many mini-stores within the Component. Side-effect code with hooks is compact, reusable and testable.

Hooks is an attempt to solve the issue. It is delicate and not perfect but it is the best we have so far.

For more about hooks see the [React Docs](https://reactjs.org/docs/hooks-intro.html).

## Why RxJS in Hooks

Since React hooks opens a door of reusing side-effect logic within Components, it is tempting to reuse complicated asynchronous logic like remote data fetching, intricate animation or device input sequence interpretation.

One of the most popular ways to manage complicated asynchronous logic is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming), a language-independent declarative programming paradigm concerned with data streams and the propagation of change. RxJS, part of the ReactiveX(Reactive Extensions), is a JavaScript implementation of reactive programming.

There are also libraries that focus only on a few specific asynchronous scenarios, like [swr](https://github.com/zeit/swr) for remote data fetching. This is like comparing Redux Saga with Redux Observable. The knowledge you gain from learning how to use these libraries is not as transferable as RxJS and Reactive Programming.

Yes there is a learning curve on RxJS but that is mostly a one-time conceptual thing. Don't be scared by the number of RxJS opertators. You most likely only need a few of them. Also see the [Operator Decision Tree](https://rxjs-dev.firebaseapp.com/operator-decision-tree).

## Observable Hooks

We first tried [rxjs-hooks](https://github.com/LeetCode-OpenSource/rxjs-hooks) but quickly encountered some [tricky TypeScript issues](https://github.com/LeetCode-OpenSource/rxjs-hooks/issues/60). We also think the `useEventCallback` is [taking too much responsibilities](https://github.com/LeetCode-OpenSource/rxjs-hooks/blob/505d71901a9ca7827472d750455d44e5bc3d9f48/src/use-event-callback.ts#L77-L80) which is a performance issue that is hard to fix due to [rules of hooks](https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level).

Unfortunately the project is not actively developed as the team has shifted focus to the redux-observable-like [ayanami](https://github.com/LeetCode-OpenSource/ayanami) project. 

Ultimately we rethought the whole integration, redesigned API from the ground up and created [observable-hooks](https://observable-hooks.js.org) for connecting RxJS Observable to React Components.

A simple example(more on the [docs](https://observable-hooks.js.org/examples/#conditional-rendering-vanilla-javascript)):

```javascript
import React from 'react'
import { useObservableState } from 'observable-hooks'
import { timer } from 'rxjs'
import { switchMap, mapTo, startWith } from 'rxjs/operators'

const App = () => {
  const [isTyping, updateIsTyping] = useObservableState(
    event$ => event$.pipe(
      switchMap(() =>
        timer(1000).pipe(
          mapTo(false),
          startWith(true)
        )
      )
    ),
    false
  )

  return (
    <div>
      <input type="text" onKeyDown={updateIsTyping} />
      <p>{isTyping ? 'Good you are typing.' : 'Why stop typing?'}</p>
    </div>
  )
}
```

![observable-hooks](https://github.com/crimx/observable-hooks/raw/master/observable-hooks.png?raw=true)

By decoupling states, events and Observables it no longer makes unused resources run idle.

Logic lives in pure function which improves reusability and testability.

See the docs for more about [core concepts](https://observable-hooks.js.org/guide/core-concepts.html) and [API](https://observable-hooks.js.org/api/).

Pomodoro Timer Example:

<iframe title="Pomodoro Timer Example" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin" src="https://codesandbox.io/embed/github/crimx/observable-hooks/tree/master/examples/pomodoro-timer?autoresize=1&amp;fontsize=14&amp;hidenavigation=1&amp;theme=dark" style="width:100%;height:500px;border:1px solid #ebedf0;background-color:#ebedf0;border-radius:4px;overflow:hidden;"></iframe>

## Suspense

With the experimental [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html) asynchronous resources can be read declaratively like it has already been resolved.

Since Suspense is just a mechanism it is possible to convert Observables into Suspense compatible resources ([benefits of observable as data source](https://observable-hooks.js.org/guide/render-as-you-fetch-suspense.html#benefits-of-observable-as-data-source)).

<iframe title="Render-as-You-Fetch (using Suspense)" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin" src="https://codesandbox.io/embed/github/crimx/observable-hooks/tree/master/examples/suspense?autoresize=1&amp;fontsize=14&amp;hidenavigation=1&amp;theme=dark" style="width:100%;height:500px;border:1px solid #ebedf0;background-color:#ebedf0;border-radius:4px;overflow:hidden;"></iframe>

Observable-hooks offers [`ObservableResource`](https://observable-hooks.js.org/api/suspense.html#observableresource) to do the trick.

```javascript
// api.js
import { ObservableResource } from 'observable-hooks'

const postResource$$ = new Subject()

export const postsResource = new ObservableResource(postResource$$.pipe(
  switchMap(id => fakePostsXHR(id))
))

export function fetchPosts(id) {
  postResource$$.next(id)
}
```

Resources are consumed with [`useObservableSuspense`](https://observable-hooks.js.org/api/suspense.html#useobservablesuspense).

```javascript
// App.jsx
import { useObservableSuspense } from 'observable-hooks'

import { postsResource, fetchPosts } from './api'

fetchPosts('crimx')

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading posts...</h1>}>
      <ProfileTimeline />
    </Suspense>
  )
}

function ProfileTimeline() {
  // Try to read posts, although they might not have loaded yet
  const posts = useObservableSuspense(postsResource)
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  )
}
```

## Conclusion

The API of observable-hooks is really simple and flexible. Folks who love both React and RxJS I highly recommend you give it a try.

What do you think? Please let us know by leaving a comment below!
