---
title: React Native 搭配 MobX 使用心得
tags:
  - React
  - React Native
  - JavaScript
  - MobX
quote:
  content: The mob is the mother of tyrants.
  author: Diogenes
  source: ''
date: 2017-11-13T12:00:00.000Z
layout: blog-post
description: ''
---

MobX 是一款十分优秀的状态管理库，不但书写简洁还非常高效。当然这是我在使用之后才体会到的，当初试水上车的主要原因是响应式，考虑到可能会更符合 Vue 过来的思考方式。然而其实两者除了响应式以外并没有什么相似之处:joy:。

在使用过程中走了不少弯路，一部分是因为当时扫两眼文档就动手，对 MobX 机制理解得不够；其它原因是 MobX 终究只是一个库，会受限于 React 机制，以及与其它非 MobX 管理组件的兼容问题。当中很多情况在文档已经给出了说明（[这里](https://mobx.js.org/best/react.html)和[这里](https://mobx.js.org/best/react-performance.html)），我根据自己遇到的再做一番总结。

## 与非响应式组件兼容问题

与非响应式的组件一起工作时，MobX 有时需要为它们提供一份非响应式的数据副本，以免 observable 被其它组件修改。

### observable.ref

使用 React Navigation 导航时，如果要交由 MobX 管理，则需要手动配置导航状态栈，此时用 `@observable.ref` “浅观察”可避免状态被 React Navigation 修改时触发 MobX 警告。

当 Navigator 接受 `navigation` props 时代表导航状态为手动管理。

```javascript
import { addNavigationHelpers, StackNavigator } from 'react-navigation'
import { observable, action } from 'mobx'
import { Provider, observer } from 'mobx-react'
import AppComp from './AppComp'

const AppNavigator = StackNavigator({
  App: { screen: AppComp },
  // ...
}, {
  initialRouteName: 'App',
  headerMode: 'none'
})

@observer
export default class AppNavigation extends Component {
  @observable.ref navigationState = {
    index: 0,
    routes: [
      { key: 'App', routeName: 'App' }
    ],
  }

  @action.bound dispatchNavigation = (action, stackNavState = true) => {
    const previousNavState = stackNavState ? this.navigationState : null
    this.navigationState = this.AppNavigator.router.getStateForAction(action, previousNavState)
    return this.navigationState
  }

  render () {
    return (
      <Provider
        dispatchNavigation={this.dispatchNavigation}
        navigationState={this.navigationState}
      >
        <AppNavigator navigation={addNavigationHelpers({
          dispatch: this.dispatchNavigation,
          state: this.navigationState,
        })} />
      </Provider>
    )
  }
}
```

### `observable.shallowArray()` 与 `observable.shallowMap()`

MobX 还提供其它方便的数据结构来存放非响应式数据。

比如使用 `SectionList` 的时候，我们要为其提供数据用于生成列表，由于 Native 官方的实现跟 MobX 不兼容，这个数据不能是响应式的，不然 MobX 会报一堆警告。

MobX 有个 `mobx.toJS()` 方法可以导出非响应式副本；如果结构不相同还可以使用 `@computed` 自动生成符合的数据。但这两个方法每次添加项目都要全部遍历一遍，可能会存在性能问题。

这时其实可以维护一个 `observable.shallowArray`，里面只放 `key` 数据，只用于生成列表（像骨架一样）。传给 `SectionList` 的 `sections` props 时 `slice` 数组复制副本（shallowArray 里的数据非响应式，所以只需浅复制，复杂度远小于上面两种方式）。

然后 store 维护一个 `observable.map` 来存放每个项的数据，在项（item）组件中 `inject` store 进去，再利用 `key` 从 map 中获取数据来填充。

通过 shallowArray 可以让 MobX 识别列表长度变化自动更新列表，利用 map 维护项数据可以使每个项保持响应式却互不影响，对长列表优化效果很明显。

```javascript
// store comp
class MyStore {
  @observable sections = observable.shallowArray()
  @observable itemData = observable.map()

  @action.bound appendSection (section) {
    const data = []
    section.items.forEach(action(item => {
      this.itemData.set(item.id, item)
      data.push({key: item.id})
    }))
    this.sections.push({
      key: section.id,
      data
    })
  }
}
```

```javascript
// MyList comp
import { SectionList } from 'react-native'
@inject('myStore')
@observer
class MyList extends React.Component {
  _renderItem = ({item}) => <SectionItem id={item.key} />

  render () {
    return (
      <SectionList
        getItemLayout={this._getItemLayout}
        sections={this.props.myStore.sections.slice()}
        renderSectionHeader={this._renderSectionHeader}
        renderItem={this._renderItem}
      />
    )
  }
}
```

```javascript
// SectionItem comp
@inject('myStore')
@observer
class SectionItem extends React.Component {
  render () {
    const {myStore, id} = this.props
    const itemData = myStore.itemData.get(id)
    return (
      <Text>{itemData.title}</Text>
    )
  }
}
```

## computed

利用 `@computed` 缓存数据可以做一些优化。

比如有一个响应式的数组 `arr`，一个组件要根据 `arr` 是否为空更新。如果直接访问 `arr.length`，那么只要数组长度发生变化，这个组件都要 render 一遍。

此时利用 computed 生成，组件只需要判断 `isArrEmpty` 就可以减少不必要的更新：

```javascript
@computed get isArrEmpty () {
  return this.arr.length <= 0
}
```

## observable.map

因 JS 机制 MobX 不能检测属性的增删，所以最好用 `observable.map` 取代简单 `{}` 对象。另外 MobX 没有提供 Set 支持，可以用 key 和 value 一样的 Map 代替。

## 避免在父组件中访问子组件的属性

这条规则在文档也提到，原因很简单，MobX 对于一个 `observer` 组件，是通过访问属性来记录依赖的。所以哪怕父组件里没有用到这个属性，只是为了作为 props 传给子组件，MobX 还是算它依赖了这个属性，于是会产生不必要的更新。最好的方式是将数据统一放在 store 中，子组件通过 `inject` store 方式获取数据。

## 小组件

由于 React 的机制，MobX 只能在组件层面发光发热，对于组件内部就无能为力了。所以大组件用 MobX 很容易卡死（用其它也会:sweat_smile:），小组件才能真正发挥 MobX 自动管理更新的优势。

【完】

