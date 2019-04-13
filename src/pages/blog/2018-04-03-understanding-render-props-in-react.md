---
title: 深入 React Render Props 模式
tags:
  - React
  - JavaScript
quote:
  content: 'When you connect with a cause, it''s like falling in love.'
  author: Debra Winger
  source: ''
date: 2018-04-03T12:00:00.000Z
layout: blog-post
description: ''
---

随着 React 的新 Context API 出来，render props 模式再次发挥重要作用。本文将尝试深入理解 render props 的利弊，并结合高阶组件寻找合适的处理方式。

## 基础

先看[官方](https://reactjs.org/docs/render-props.html)给出的简单例子：

```jsx
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
```

加个 `DataProvider` 的简单实现，

```jsx
class DataProvider extends React.Component {
  state = { target: '' }
  handleMouseMove = e => this.setState({ target: e.target.title })
  render() {
    return (
      <div style={{ height: '1vh' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    )
  }
}
```

这里是将一个返回 React 元素的函数传给 `DataProvider` 的 `props.render`，`DataProvider` render 的时候调用 `this.props.render(this.state)` 渲染这个函数。

这也是“render props”名字的来源，而现在更流行的是“children props”，虽然依然沿用 render props 的说法。

Children props 即将 render 换为 children ，同时 JSX 中不需要显式写 chidlren ，所以成了这个样子：

```jsx
<DataProvider>
  {data => <h1>Hello {data.target}</h1>}
</DataProvider>
```

子组件通过 render props 传进父组件渲染，让父组件不再依赖子组件，达到重用父组件的目的，即[依赖反转](https://en.wikipedia.org/wiki/Dependency_inversion_principle)。

## Render Props 与 SFC

前面提到的“返回 React 元素的函数”，一看是不是跟[无状态函数组件](https://reactjs.org/docs/components-and-props.html#functional-and-class-components)（Stateless Fuctional Component）的[签名](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/8a857d6473829df15ae8d695dbac310e824479df/types/react/index.d.ts#L329)很接近。这么看：

```jsx
<DataProvider>
  {props => <h1>Hello {props.target}</h1>}
</DataProvider>
```

但不一样的地方在于 render props 只是一个普通函数，是直接函数调用。且 inline render props 可以跳过 `DataProvider` 直接访问其它父组件：

```jsx
const App = props => (
  <DataProvider>
    {data => <h1>Hello {data.target} {props.target}</h1>}
  </DataProvider>
)
```

这就造成了 `DataProvider` 不能优化为纯组件。这也是非常不好的习惯，一个解决方式是人为限制 render props 为 SFC 从而让只有一个数据来源。理想很美好，但没法强制所有人这么干。

## Render Props 与 HOC

如果将 render props 限制为传入子组件，其实很容易联想到[高阶组件](https://reactjs.org/docs/higher-order-components.html)（Higher-Order Components）。高阶组件是一个函数，接受一个组件，返回新的组件。

所以可以用高阶组件包装起来，并隐藏 render props 接口。

```jsx
const withData = Base => () => <DataProvider>{Base}</DataProvider>

const BaseTarget = props => <h1>Hello {props.target}</h1>

const EnhancedComponent = withData(BaseTarget)

const App = () => <EnhancedComponent />
```

这样就限制了 `DataProvider` 的使用方式。如果需要多方数据，可以修改 `DataProvider` 为 `this.props.render({ ...this.props, ...this.state })` 将其它数据作为 props 传入 `DataProvider`。

```jsx
const withData = Base => props => <DataProvider {...props}>{Base}</DataProvider>

const BaseTarget = props => <h1>Hello {props.target}</h1>

const EnhancedComponent = withData(BaseTarget)

const App = props => <EnhancedComponent {...props} />
```

「完」

