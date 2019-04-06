import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { StaticQuery, graphql, withPrefix } from 'gatsby'

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

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query HeadingQuery {
        site {
          siteMetadata {
            title
            description
            social {
              codepen {
                url
              }
              github {
                url
              }
              twitter {
                url
              }
            }
          }
        }
      }
    `}
    render={data => {
      const { siteMetadata } = data.site
      return (
        <div>
          <Helmet>
            <html lang='zh-CN' />
            <title>{siteMetadata.title}</title>
            <meta name='description' content={siteMetadata.description} />

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
          <div>{children}</div>

          <footer className='site-footer'>
            <div className='site-description'>
              I{' '}
              <a
                href={siteMetadata.social.github.url}
                target='_blank'
                rel='nofollow noreferrer noopener'
              >
                code
              </a>
              ,{' '}
              <a
                href={siteMetadata.social.codepen.url}
                target='_blank'
                rel='nofollow noreferrer noopener'
              >
                doodle
              </a>
              ,{' '}
              <a
                href={siteMetadata.social.twitter.url}
                target='_blank'
                rel='nofollow noreferrer noopener'
              >
                tweet
              </a>{' '}
              &amp; <a href={withPrefix('/')}>blog</a>.
            </div>
            <div className='copyright'>
              © COPYRIGHT 2019 · Designed &amp; Written With{' '}
              <svg viewBox='0 0 32 32' width='1em' height='1em'>
                <title>heart</title>
                <path
                  fill='#dd4b39'
                  d='M23.6 2c-3.363 0-6.258 2.736-7.599 5.594-1.342-2.858-4.237-5.594-7.601-5.594-4.637 0-8.4 3.764-8.4 8.401 0 9.433 9.516 11.906 16.001 21.232 6.13-9.268 15.999-12.1 15.999-21.232 0-4.637-3.763-8.401-8.4-8.401z'
                />
              </svg>
            </div>
          </footer>
        </div>
      )
    }}
  />
)

Layout.propTypes = {
  children: PropTypes.node
}

export default Layout
