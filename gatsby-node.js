const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { fmImagesToRelative } = require('gatsby-remark-relative-images')

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

    // add prev & next pages
    options
      .filter(
        (_, i) =>
          edges[i].node.frontmatter.layout === 'blog-post' &&
          !edges[i].node.fields.draft
      )
      .forEach((option, i, blogPostOptions) => {
        option.context.prev =
          i === 0
            ? null
            : {
              title: blogPostOptions[i - 1].title,
              path: blogPostOptions[i - 1].path
            }
        option.context.next =
          i === blogPostOptions.length - 1
            ? null
            : {
              title: blogPostOptions[i + 1].title,
              path: blogPostOptions[i + 1].path
            }
      })

    // render everthing except post drafts
    options
      .filter(
        (_, i) =>
          !(
            edges[i].node.frontmatter.layout === 'blog-post' &&
            edges[i].node.fields.draft
          )
      )
      .forEach(option => createPage(option))
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  fmImagesToRelative(node) // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    // GraphQL query over frontmatter.draft might throw error if
    // no post has this field.
    createNodeField({
      node,
      name: 'draft',
      value: Boolean(node.frontmatter.draft)
    })

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

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  switch (stage) {
    case 'build-html':
      actions.setWebpackConfig({
        // fix Trianglify
        externals: ['canvas']
      })
      break
  }
}
