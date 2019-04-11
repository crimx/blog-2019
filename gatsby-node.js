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
              templateKey
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
        `src/templates/${edge.node.frontmatter.templateKey}.js`
      ),
      // additional data can be passed via context
      context: {
        id: edge.node.id
      }
    }))

    options
      .filter((_, i) => edges[i].node.frontmatter.templateKey === 'blog-post')
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

    options.forEach(option => createPage(option))
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  fmImagesToRelative(node) // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value
    })
  }
}
