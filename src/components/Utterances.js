import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const Utterances = React.memo(({ slug }) => {
  const [loaded, setLoaded] = useState(false)
  const utterancesRef = useRef()
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    setLoaded(false)
    const el = document.createElement('script')
    if (utterancesRef.current) {
      el.src = 'https://utteranc.es/client.js'
      el.async = true
      el.setAttribute('repo', process.env.GATSBY_UTTERANCES)
      el.setAttribute('issue-term', slug)
      el.setAttribute('label', 'Comment')
      el.setAttribute('theme', 'github-light')
      el.setAttribute('crossorigin', 'anonymous')
      el.onload = () => {
        setLoaded(true)
      }
      utterancesRef.current.appendChild(el)
    }
    return () => {
      el.remove()
    }
  }, [slug])

  return (
    <section key={slug} className='section' ref={utterancesRef}>
      {loaded || (
        <div className='has-text-centered'>
          <div className='box is-inline-block'>
            <p className='is-size-6'>评论没有加载，检查你的局域网</p>
            <p className='is-size-7'>
              Cannot load comments. Check you network.
            </p>
          </div>
        </div>
      )}
    </section>
  )
})

Utterances.propTypes = {
  slug: PropTypes.string.isRequired
}

export default Utterances
