import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { graphql, withPrefix, useStaticQuery } from 'gatsby'
import Footer from './Footer'
import './styles'

const faviconSizes = ['192', '32', '96', '16']
const appleIconSizes = [
  '57',
  '60',
  '72',
  '76',
  '114',
  '120',
  '144',
  '152',
  '180'
]

const Layout = ({ title, description, children }) => {
  const data = useStaticQuery(graphql`
    query HeadingQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)
  const { siteMetadata } = data.site

  return (
    <div>
      <Helmet>
        <html lang='zh-CN' />
        <title>{title || siteMetadata.title}</title>
        <meta
          name='description'
          content={description || siteMetadata.description}
        />

        <meta httpEquiv='X-UA-Compatible' content='IE=edge,chrome=1' />
        <meta name='referrer' content='never' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=0'
        />

        {faviconSizes.map(size => (
          <link
            key={size}
            rel='icon'
            type='image/png'
            sizes={`${size}x${size}`}
            href={withPrefix(`/img/favicon/favicon-${size}x${size}.png`)}
          />
        ))}

        {appleIconSizes.map(size => (
          <link
            key={size}
            rel='icon'
            type='apple-touch-icon'
            sizes={`${size}x${size}`}
            href={withPrefix(`/img/favicon/favicon-${size}x${size}.png`)}
          />
        ))}

        <meta name='msapplication-TileColor' content='#ffffff' />
        <meta
          name='msapplication-TileImage'
          content={withPrefix('/img/favicon/ms-icon-144x144.png')}
        />
        <link rel='manifest' href='/manifest.json' />

        <meta name='theme-color' content='#fff' />

        <meta property='og:type' content='website' />
        <meta property='og:title' content={data.site.siteMetadata.title} />
        <meta property='og:url' content='/' />

        <meta name='twitter:card' content='summary' />
        <meta name='twitter:title' content='CRIMX' />
        <meta name='twitter:creator' content='@straybugs' />
      </Helmet>
      <div>{children}</div>

      <Footer />
    </div>
  )
}

Layout.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node
}

export default Layout
