---
layout: blog-post
draft: false
date: 2019-05-05T12:00:02.769Z
title: 搭建 Gatsby 博客四：兼容 Jekyll 式路径
description: 前面已经让博客顺利运行起来，接下来就是实现一些个性化的功能。本文通过实现兼容 Jekyll 式路径来了解 Gatsby 的 Node APIs。
quote:
  author: Ralph Waldo Emerson
  content: '"Do not go where the path may lead, go instead where there is no path and leave a trail." '
  source: ''
tags:
  - Gatsby
  - Blog
  - Jekyll
---

迁移博客需要考虑的一个重要问题便是路径兼容。我们当然不希望迁移后原有的链接无法访问，这不仅影响到 SEO ，更带来了不好的用户访问体验。本文将聊聊怎么让 Gatsby 兼容 Jekyll 式路径。

## Gatsby 如何生成特定页面

一般来说，在 `/src/pages/` 目录下的组件会自动生成相应路径的页面，但如果是其它类型的文件就不会了。我们可以通过 Gatsby 的 Node APIs 来生成特定页面。

在 `/gatsby-node.js` 中配置 Gatsby Node APIs，如果项目是基于 starter 的话你很可能会发现里面已经有相应的配置。

我们通过声明 `exports.createPages` 钩子来配置页面生成，在回调中通过调用 `actions.createPage` 来生成某个指定页面。这个方法接受一个配置参数，其中的 `path` 域代表了生成页面的路径。

```javascript
exports.createPages = ({ actions, graphql }) => {
  actions.createPage({
    path,
    // ...
  })
}
```

## 指定博客页面

那么我们怎么知道该生成哪些页面呢？这里通过 `exports.createPages` 回调中的 `graphql` 来查询 Markdown 文件。

```javascript
exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    {
      allMarkdownRemark(sort: { order: ASC, fields: [frontmatter___date] }) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              path
              title
              layout
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      result.errors.forEach(e => console.error(e.toString()))
      return Promise.reject(result.errors)
    }
    
    // ...
  })
}
```

Netlify CMS 会在 Markdown front matters 中的 `path` 域生成路径。根据默认的 `/static/admin/config.yml` 我们的路径应该是 `/blog/{{year}}-{{month}}-{{day}}-{{slug}}/`，这个可能跟旧博客不一样，如 Jekyll 是 `/{{year}}/{{month}}/{{day}}/{{slug}}/`。

## 修改 Markdown 节点

在 Remark 插件生成的 Markdown 节点中，我们可以往 `fields` 域放一些自定义的变量。这里我们把自定义的路径存到 `fields.slug` 中。

通过 `/gatsby-node.js` 中的 `exports.onCreateNode` 钩子我们可以在生成节点的时候进行拦截处理。你可能发现文件里面已经有一些配置的代码了，我们这里只关注 Markdown 相关的。

```javascript
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    // Jeykll style post path
    const filepath = createFilePath({ node, getNode })
    createNodeField({
      node,
      name: 'slug',
      value: filepath.replace(
        /^\/blog\/([\d]{4})-([\d]{2})-([\d]{2})-/,
        '/$1/$2/$3/'
      )
    })
  }
}
```

我们把原有的路径值换成了自定义值并存在了 `fileds.slug` 中。

## 创建页面

回到我们[前面的查询](https://github.com/crimx/blog-2019/blob/d7c8c6bbbe73ef455f70bc629d153b836482f788/gatsby-node.js#L71-L79)，得到需要的数据之后只需要对每个页面调用 `actions.createPage` 即可。

```javascript
exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    {
      allMarkdownRemark(sort: { order: ASC, fields: [frontmatter___date] }) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              path
              title
              layout
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      result.errors.forEach(e => console.error(e.toString()))
      return Promise.reject(result.errors)
    }
    
    const { edges } = result.data.allMarkdownRemark

    const options = edges.map(edge => ({
      path: edge.node.fields.slug,
      title: edge.node.frontmatter.title,
      component: path.resolve(
        `src/templates/${edge.node.frontmatter.layout}.js`
      ),
      // additional data can be passed via context
      context: {
        id: edge.node.id
      }
    }))
    
    options.forEach(option => createPage(option))
  })
}
```

也许你会问为什么不在这里直接计算自定义路径而是要存到 `fields.slug` 中。这是因为这个路径我们可能还会在其它地方用到，存起来就不必多处计算了。

上面代码中可以注意到还有个 `context` 域，这个域中的数据会被传到 `component` 的 props 中。这样我们在模板组件中通过 `pageContext.id` 便可判断当前渲染的文件。

通过实现自定义路径基本上可以了解 Gatsby 页面生成的方式了。下篇文章中我会继续谈谈其它个性化的配置，如草稿模式和显示上下篇博文。
