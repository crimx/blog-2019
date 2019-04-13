import React, { useRef, useEffect } from 'react'

const Utterances = React.memo(() => {
  const utterancesRef = useRef()
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const el = document.createElement('script')
    el.src = 'https://utteranc.es/client.js'
    el.async = true
    el.setAttribute('repo', 'crimx/blog-comments')
    el.setAttribute('issue-term', 'pathname')
    el.setAttribute('label', 'Comment')
    el.setAttribute('theme', 'github-light')
    el.setAttribute('crossOrigin', 'anonymous')
    if (utterancesRef.current) {
      utterancesRef.current.appendChild(el)
    }
  }, [])

  return <section key='utterances' className='section' ref={utterancesRef} />
})

export default Utterances
