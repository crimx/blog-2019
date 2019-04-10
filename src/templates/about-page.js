import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Navbar from '../components/Navbar'
import Content, { HTMLContent } from '../components/Content'
import DoubanShow from '../components/DoubanShow'

const AboutPage = ({ data }) => {
  const { markdownRemark: post } = data
  const PageContent = HTMLContent || Content

  return (
    <Layout title={post.frontmatter.title}>
      <Navbar />
      <section className='section is-marginless-top-mobile'>
        <div className='container'>
          <div className='columns'>
            <div className='column is-10-desktop is-offset-1'>
              <section className='postify'>
                <PageContent className='content' content={post.html} />
              </section>
            </div>
          </div>
        </div>
      </section>
      <section className='section content has-text-centered is-marginless-mobile'>
        <p className='has-text-centered'>最近个人推荐的一些书和影视作品：</p>
        <DoubanShow />
      </section>
    </Layout>
  )
}

AboutPage.propTypes = {
  data: PropTypes.object.isRequired
}

export default AboutPage

export const aboutPageQuery = graphql`
  query AboutPage($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
      }
    }
  }
`
