import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

import Navbar from '../components/Navbar'
import './styles/all.scss'

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

const TemplateWrapper = ({ children }) => (
  <StaticQuery
    query={graphql`
      query HeadingQuery {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `}
    render={data => (
      <div>
        <Helmet>
          <html lang='zh-CN' />
          <title>{data.site.siteMetadata.title}</title>
          <meta
            name='description'
            content={data.site.siteMetadata.description}
          />

          {faviconSizes.map(size => (
            <link
              key={size}
              rel='icon'
              type='image/png'
              sizes={`${size}x${size}`}
              href={`/img/favicon/favicon-${size}x${size}.png`}
            />
          ))}

          {appleIconSizes.map(size => (
            <link
              key={size}
              rel='icon'
              type='apple-touch-icon'
              sizes={`${size}x${size}`}
              href={`/img/favicon/favicon-${size}x${size}.png`}
            />
          ))}

          <meta name='msapplication-TileColor' content='#ffffff' />
          <meta
            name='msapplication-TileImage'
            content='/img/favicon/ms-icon-144x144.png'
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
        <Navbar />
        <div>{children}</div>
      </div>
    )}
  />
)

TemplateWrapper.propTypes = {
  children: PropTypes.element
}

export default TemplateWrapper
