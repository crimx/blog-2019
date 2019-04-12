import React from 'react'
import PropTypes from 'prop-types'

export const HTMLContent = ({ content, className, style }) => (
  <div
    className={className}
    style={style}
    dangerouslySetInnerHTML={{ __html: content }}
  />
)

const Content = ({ content, className, style }) => (
  <div className={className} style={style}>
    {content}
  </div>
)

Content.propTypes = {
  content: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.style
}

HTMLContent.propTypes = Content.propTypes

export default Content
