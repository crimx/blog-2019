import React from 'react'
import PropTypes from 'prop-types'

const boxStyle = {
  margin: '0 auto',
  maxWidth: 800,
  fontFamily: `Georgia,'hiragino sans gb',stheiti,'wenquanyi micro hei',\\5FAE\\8F6F\\96C5\\9ED1,\\5B8B\\4F53,serif`
}

const Quote = React.memo(({ quote }) => {
  if (!quote || !quote.content) {
    return null
  }

  const { content, author, source } = quote
  const hasFoot = !!(author || source)

  return (
    <div className='box' style={boxStyle}>
      <article
        className={`media${hasFoot ? '' : ' is-flex is-aligned-center'}`}
      >
        <div className='media-left'>
          <svg viewBox='0 0 32 32' width='48' height='48' fill='#bdc3c7'>
            <title>quote</title>
            <path d='M16 1.204c8.15 0 14.796 6.646 14.796 14.796S24.15 30.796 16 30.796 1.204 24.15 1.204 16 7.85 1.204 16 1.204m0-1.087C7.223.117.117 7.223.117 16S7.223 31.883 16 31.883 31.883 24.777 31.883 16 24.777.117 16 .117z' />
            <path d='M16 1.956C8.226 1.956 1.956 8.226 1.956 16S8.226 30.044 16 30.044 30.044 23.774 30.044 16 23.774 1.956 16 1.956zm-3.887 13.92c.836 0 1.505.207 2.006.626.5.418.75 1.044.75 1.84 0 .584-.21 1.127-.67 1.63-.46.5-1.045.752-1.798.752-1.17 0-2.048-.377-2.55-1.17S9.1 17.756 9.1 16.502c0-.878.21-1.714.586-2.424.375-.752.835-1.38 1.42-1.965.543-.585 1.17-1.086 1.797-1.504.626-.42 1.17-.757 1.588-1.008l.754 1.212c-.627.376-1.17.67-1.546.96-.418.252-.794.628-1.21 1.046-.378.42-.67.837-.88 1.297-.21.46-.334 1.043-.418 1.754h.92zm7.65 0c.835 0 1.504.207 2.005.626.502.418.752 1.044.752 1.84 0 .584-.208 1.127-.668 1.63-.418.5-1.045.752-1.798.752-1.17 0-2.048-.377-2.55-1.17-.5-.795-.752-1.798-.752-3.052 0-.878.21-1.714.586-2.424.376-.752.836-1.38 1.42-1.965.544-.585 1.17-1.086 1.8-1.504.625-.42 1.17-.757 1.587-1.008l.752 1.212c-.627.376-1.17.67-1.547.96-.417.252-.793.628-1.212 1.046-.418.42-.71.878-.877 1.297-.163.416-.33 1.002-.414 1.754h.92z' />
          </svg>
        </div>
        <div className='media-content'>
          <div className='is-italic'>
            {typeof content === 'string'
              ? content.split('\n').map(line => <p key={line}>{line}</p>)
              : content}
          </div>
          {hasFoot && (
            <div className='has-text-right'>
              {'— '}
              {!!author && <span className='is-uppercase'>{author}</span>}
              {!!(author && source) && ', '}
              {!!source && <span className='is-italic'>{source}</span>}
            </div>
          )}
        </div>
      </article>
    </div>
  )
})

Quote.propTypes = {
  quote: PropTypes.shape({
    content: PropTypes.node,
    author: PropTypes.node,
    source: PropTypes.node
  })
}

export default Quote
