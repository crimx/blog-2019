import React from 'react'
import PropTypes from 'prop-types'
import { Link, graphql } from 'gatsby'
import Img from 'gatsby-image'
import Layout from '../components/Layout'
import Navbar from '../components/Navbar'
import Quote from '../components/Quote'
import logo from '../img/logo.svg'

const IndexPage = ({
  data: { heroimg, tagJavaScript, tagSource, tagSpec, tagTotal, latestPosts },
}) => {
  return (
    <Layout>
      <section className="hero has-gatsby-img">
        <Img fluid={heroimg.childImageSharp.fluid} />
        <div className="hero-head">
          <Navbar />
        </div>

        <div className="hero-body has-text-centered">
          <div className="container">
            <img
              style={{ width: '55vmin', height: '55vmin' }}
              src={logo}
              alt="CRIMX LOGO"
            />
          </div>
        </div>

        <div className="hero-foot has-text-centered">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <title>scroll down</title>
            <path
              fill="#fff"
              d="M.045 8.443c0-.215.082-.43.246-.594.33-.33.86-.33 1.19 0L16 22.37 30.52 7.85c.33-.33.86-.33 1.19 0s.327.86 0 1.186L16.593 24.152c-.328.326-.86.326-1.188 0L.29 9.036c-.163-.163-.245-.378-.245-.593z"
            />
          </svg>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Quote
            quote={{
              content: `"How do you know I'm mad?" said Alice.\n"You must be," said the Cat, "or you wouldn't have come here."`,
              author: `Lewis Carroll`,
              source: `Alice's Adventures in Wonderland`,
            }}
          />
        </div>
      </section>

      <section className="section">
        <div className="container has-text-centered">
          <div className="content">
            <p>
              欢迎光临本博客！这里主要是记录 Web
              前端相关的一些文章，偶尔涉及其它我感兴趣的东西。
            </p>
          </div>
          <div className="columns">
            <div className="column">
              <Link
                className="has-text-dark is-block"
                to="/archives?search=%23JavaScript"
              >
                <div className="box has-background-light">
                  <h2 className="heading">{tagJavaScript.totalCount} 篇文章</h2>
                  <h1 className="title">JAVASCRIPT</h1>
                </div>
              </Link>
            </div>
            <div className="column">
              <Link
                className="has-text-dark is-block"
                to="/archives?search=%23闲读源码"
              >
                <div className="box has-background-light">
                  <h2 className="heading">{tagSource.totalCount} 篇文章</h2>
                  <h1 className="title">闲读源码</h1>
                </div>
              </Link>
            </div>
            <div className="column">
              <Link
                className="has-text-dark is-block"
                to="/archives?search=%23闲读规范"
              >
                <div className="box has-background-light">
                  <h2 className="heading">{tagSpec.totalCount} 篇文章</h2>
                  <h1 className="title">闲读规范</h1>
                </div>
              </Link>
            </div>
            <div className="column">
              <Link className="has-text-dark is-block" to="/archives">
                <div className="box has-background-light">
                  <h2 className="heading">{tagTotal.totalCount} 篇文章</h2>
                  <h1 className="title">全部博文</h1>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Quote
            quote={{
              content: `"Either write something worth reading or do something worth writing."`,
              author: `Benjamin Franklin`,
              source: ``,
            }}
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="content">
            <p className="has-text-centered">最近文章：</p>
            {latestPosts.edges.map(({ node: post }) => (
              <div className="box" key={post.id}>
                <p>
                  <Link className="is-link-reverse" to={post.fields.slug}>
                    <strong>{post.frontmatter.title}</strong>
                  </Link>
                  <span> &bull; </span>
                  <small>{post.frontmatter.date}</small>
                </p>
                <p>{post.frontmatter.description || post.excerpt}</p>
                <p>
                  <Link className="button is-small" to={post.fields.slug}>
                    继续阅读 →
                  </Link>
                </p>
              </div>
            ))}
          </div>
          <Link
            className="button has-text-weight-light is-medium is-light is-fullwidth"
            to="/archives"
          >
            查看全部文章
          </Link>
        </div>
      </section>
    </Layout>
  )
}

IndexPage.propTypes = {
  data: PropTypes.shape({
    heroimg: PropTypes.shape({
      fluid: PropTypes.any,
    }),
    tagJavaScript: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
    tagSource: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
    tagSpec: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
    tagTotal: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
    latestPosts: PropTypes.shape({
      edges: PropTypes.array,
    }),
  }),
}

export default IndexPage

export const pageQuery = graphql`
  query IndexQuery {
    heroimg: file(relativePath: { eq: "hero/pexels-photo-19031.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1920) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    tagJavaScript: allMarkdownRemark(
      filter: {
        frontmatter: {
          layout: { eq: "blog-post" }
          tags: { in: ["JavaScript"] }
        }
      }
    ) {
      totalCount
    }
    tagSource: allMarkdownRemark(
      filter: {
        frontmatter: { layout: { eq: "blog-post" }, tags: { in: ["闲读源码"] } }
      }
    ) {
      totalCount
    }
    tagSpec: allMarkdownRemark(
      filter: {
        frontmatter: { layout: { eq: "blog-post" }, tags: { in: ["闲读规范"] } }
      }
    ) {
      totalCount
    }
    tagTotal: allMarkdownRemark(
      filter: { frontmatter: { layout: { eq: "blog-post" } } }
    ) {
      totalCount
    }
    latestPosts: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: {
        fields: { draft: { ne: true } }
        frontmatter: { layout: { eq: "blog-post" } }
      }
      limit: 5
    ) {
      edges {
        node {
          excerpt(pruneLength: 200)
          id
          fields {
            slug
          }
          frontmatter {
            title
            description
            layout
            date(formatString: "MMMM DD, YYYY")
          }
        }
      }
    }
  }
`
