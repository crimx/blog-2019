import React from 'react'
import { graphql, withPrefix, useStaticQuery } from 'gatsby'

const Footer = React.memo(() => {
  const data = useStaticQuery(graphql`
    query FooterQuery {
      site {
        siteMetadata {
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
  `)
  const { social } = data.site.siteMetadata

  return (
    <footer className='site-footer'>
      <div className='container' style={{ maxWidth: 600 }}>
        <div className='columns is-mobile is-gapless is-family-monospace'>
          <div className='column has-text-centered'>
            <svg fill='#363636' width='50' height='50' viewBox='0 0 512 512'>
              <path d='M498.682 435.326L297.917 234.56 63.357 0H45.026l-3.743 9.511c-9.879 25.104-14.1 50.78-12.205 74.249 2.16 26.752 12.323 49.913 29.392 66.982l183.11 183.11 24.152-24.152 169.285 189.293c16.84 16.84 45.825 17.84 63.665 0 17.554-17.554 17.554-46.114 0-63.667zM156.728 291.442L13.317 434.853c-17.552 17.552-17.552 46.113 0 63.665 16.674 16.674 45.519 18.146 63.665 0l143.412-143.412-63.666-63.664zM490.253 85.249l-81.351 81.35-21.223-21.222 81.351-81.351-21.222-21.222-81.35 81.35-21.222-21.222 81.351-81.35L405.366.361l-106.11 106.11a74.903 74.903 0 0 0-21.828 48.535c-.277 4.641-1.329 9.206-3.074 13.548l68.929 68.929c4.342-1.747 8.908-2.798 13.548-3.075a74.887 74.887 0 0 0 48.535-21.827l106.11-106.109-21.223-21.223z' />
            </svg>
            <p className='has-text-grey-light is-size-7-mobile'>
              eat<span className='has-text-warning'>()</span>;
            </p>
          </div>
          <div className='column has-text-centered'>
            <svg
              fill='#363636'
              width='50'
              height='50'
              viewBox='0 0 490.7 490.7'
            >
              <path d='M436.2 154.6H182.4c-12.4 0-33.1 4.7-33.1 36.6V240h320v-48.8c0-31.8-20.7-36.6-33.1-36.6z' />
              <path d='M80.3 250.6H32V80H0v330.7h32v-85.4h426.7v85.3h32v-160z' />
              <circle cx='85.3' cy='197.3' r='44.7' />
            </svg>
            <p className='has-text-grey-light is-size-7-mobile'>
              sleep<span className='has-text-success'>()</span>;
            </p>
          </div>
          <div className='column has-text-centered'>
            <svg
              fill='#363636'
              width='50'
              height='50'
              viewBox='0 0 522.468 522.468'
            >
              <path d='M325.762 70.513l-17.706-4.854c-2.279-.76-4.524-.521-6.707.715-2.19 1.237-3.669 3.094-4.429 5.568L190.426 440.53c-.76 2.475-.522 4.809.715 6.995 1.237 2.19 3.09 3.665 5.568 4.425l17.701 4.856c2.284.766 4.521.526 6.71-.712 2.19-1.243 3.666-3.094 4.425-5.564L332.042 81.936c.759-2.474.523-4.808-.716-6.999-1.238-2.19-3.089-3.665-5.564-4.424zM166.167 142.465c0-2.474-.953-4.665-2.856-6.567l-14.277-14.276c-1.903-1.903-4.093-2.857-6.567-2.857s-4.665.955-6.567 2.857L2.856 254.666C.95 256.569 0 258.759 0 261.233s.953 4.664 2.856 6.566l133.043 133.044c1.902 1.906 4.089 2.854 6.567 2.854s4.665-.951 6.567-2.854l14.277-14.268c1.903-1.902 2.856-4.093 2.856-6.57 0-2.471-.953-4.661-2.856-6.563L51.107 261.233l112.204-112.201c1.906-1.902 2.856-4.093 2.856-6.567zM519.614 254.663L386.567 121.619c-1.902-1.902-4.093-2.857-6.563-2.857-2.478 0-4.661.955-6.57 2.857l-14.271 14.275c-1.902 1.903-2.851 4.09-2.851 6.567s.948 4.665 2.851 6.567l112.206 112.204-112.206 112.21c-1.902 1.902-2.851 4.093-2.851 6.563 0 2.478.948 4.668 2.851 6.57l14.271 14.268c1.909 1.906 4.093 2.854 6.57 2.854 2.471 0 4.661-.951 6.563-2.854L519.614 267.8c1.903-1.902 2.854-4.096 2.854-6.57 0-2.475-.951-4.665-2.854-6.567z' />
            </svg>
            <p className='has-text-grey-light is-size-7-mobile'>
              code<span className='has-text-info'>()</span>;
            </p>
          </div>
          <div className='column has-text-centered'>
            <svg
              fill='#363636'
              width='50'
              height='50'
              viewBox='0 0 155.724 155.724'
            >
              <path d='M42.735 121.521c-12.77-10.273-20.942-26.025-20.942-43.691 0-26.114 17.882-47.992 42.051-54.23V9.154C31.854 15.646 7.776 43.927 7.776 77.83c0 20.951 9.199 39.738 23.767 52.578 11.276 10.503 18.284-3.514 11.192-8.887zm80.854-96.775c-7.18-6.485-17.693 4.028-10.801 9.236 12.888 10.27 21.143 26.097 21.143 43.848 0 26.118-17.885 48-42.052 54.234v14.449c31.99-6.499 56.068-34.776 56.068-68.684 0-21.227-9.445-40.233-24.358-53.083zM70.037 35.707L92.85 22.046c3.319-1.988 3.326-5.226.018-7.228L69.844.883c-3.312-1.999-5.985-.49-5.969 3.381l.124 28.035c.01 3.869 2.715 5.396 6.038 3.408zm15.846 84.322l-23.027 13.935c-3.311 2.002-3.304 5.239.019 7.228l22.811 13.662c3.319 1.984 6.03.462 6.047-3.412l.12-28.034c.012-3.868-2.665-5.378-5.97-3.379z' />
            </svg>
            <p className='has-text-grey-light is-size-7-mobile'>
              repeat<span className='has-text-danger'>()</span>;
            </p>
          </div>
        </div>
      </div>
      <div className='site-description'>
        I{' '}
        <a
          className='has-text-info'
          href={social.github.url}
          target='_blank'
          rel='nofollow noreferrer noopener'
        >
          code
        </a>
        ,{' '}
        <a
          className='has-text-info'
          href={social.codepen.url}
          target='_blank'
          rel='nofollow noreferrer noopener'
        >
          doodle
        </a>
        ,{' '}
        <a
          className='has-text-info'
          href={social.twitter.url}
          target='_blank'
          rel='nofollow noreferrer noopener'
        >
          tweet
        </a>{' '}
        &amp;{' '}
        <a className='has-text-info' href={withPrefix('/')}>
          blog
        </a>
        .
      </div>
      <div className='copyright'>
        © COPYRIGHT 2019 · Made With{' '}
        <svg
          viewBox='0 0 32 32'
          width='1em'
          height='1em'
          style={{ position: 'relative', top: 2 }}
        >
          <title>love</title>
          <path
            fill='#dd4b39'
            d='M23.6 2c-3.363 0-6.258 2.736-7.599 5.594-1.342-2.858-4.237-5.594-7.601-5.594-4.637 0-8.4 3.764-8.4 8.401 0 9.433 9.516 11.906 16.001 21.232 6.13-9.268 15.999-12.1 15.999-21.232 0-4.637-3.763-8.401-8.4-8.401z'
          />
        </svg>{' '}
        by CRIMX
      </div>
    </footer>
  )
})

export default Footer
