import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { parse as qsParse } from 'query-string'
import Layout from '../components/Layout'
import Navbar from '../components/Navbar'
import PostList from '../components/PostList'

const ArchivesPage = ({ data: { site, posts }, location }) => {
  const [searchText, setSearchText] = useState(
    (qsParse(location.search).search || '').trim()
  )

  return (
    <Layout title={`Archives | ${site.siteMetadata.title}`}>
      <Navbar />
      <section className='section'>
        <div className='container'>
          <div className='field'>
            <div className='control is-large'>
              <input
                className='input is-large'
                type='text'
                value={searchText}
                onChange={e =>
                  setSearchText((e.currentTarget.value || '').trim())
                }
                placeholder='Preceding "#" to match tags.'
              />
            </div>
          </div>
        </div>
      </section>
      <PostList text={searchText} posts={posts} setSearchText={setSearchText} />
    </Layout>
  )
}

ArchivesPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string
  }),
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string
      })
    }),
    posts: PostList.propTypes.posts
  })
}

export default ArchivesPage

export const archivesPageQuery = graphql`
  query ArchivesQuery {
    site {
      siteMetadata {
        title
      }
    }
    posts: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: {
        fields: { draft: { ne: true } }
        frontmatter: { layout: { eq: "blog-post" } }
      }
    ) {
      edges {
        node {
          excerpt(pruneLength: 200)
          id
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            tags
          }
        }
      }
    }
  }
`
