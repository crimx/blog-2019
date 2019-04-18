import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

const Utterances = React.memo(({ slug }) => {
  const utterancesRef = useRef()
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const el = document.createElement('script')
    el.src = 'https://utteranc.es/client.js'
    el.async = true
    el.setAttribute('repo', 'crimx/blog-comments')
    el.setAttribute('issue-term', slug)
    el.setAttribute('label', 'Comment')
    el.setAttribute('theme', 'github-light')
    el.setAttribute('crossorigin', 'anonymous')
    if (utterancesRef.current) {
      utterancesRef.current.appendChild(el)
    }
    return () => {
      el.remove()
    }
  }, [slug])

  return <section key={slug} className='section' ref={utterancesRef} />
})

Utterances.propTypes = {
  slug: PropTypes.string.isRequired
}

export default Utterances
