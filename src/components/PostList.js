import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

const PostItem = React.memo(({ post, onTagClicked }) => {
  const { title, date, description, tags } = post.frontmatter
  return (
    <div className='box content'>
      <p>
        <Link className='is-link-reverse' to={post.fields.slug}>
          <strong>{title}</strong>
        </Link>
        <span> &bull; </span>
        <small>{date}</small>
      </p>
      <p>{description || post.excerpt}</p>
      {tags && tags.length ? (
        <p className='tags'>
          {tags.map(tag => (
            <Link
              key={tag}
              data-tag={tag}
              onClick={onTagClicked}
              className='tag is-info is-rounded'
              to={`/archives?search=%23${tag}`}
            >
              #{tag}
            </Link>
          ))}
        </p>
      ) : null}
    </div>
  )
})

PostItem.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    fields: PropTypes.shape({
      slug: PropTypes.string
    }),
    frontmatter: PropTypes.shape({
      date: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string)
    })
  }),
  onTagClicked: PropTypes.func
}

const PostList = React.memo(({ text, posts, setSearchText }) => {
  const onTagClicked = useCallback(
    e => {
      setSearchText('#' + (e.currentTarget.dataset.tag || '').trim())
    },
    [setSearchText]
  )

  const lowerCasePosts = useMemo(
    () =>
      posts.edges.map(({ node: post }) => ({
        title: (post.frontmatter.title || '').toLowerCase(),
        description: (post.frontmatter.description || '').toLowerCase(),
        excerpt: (post.excerpt || '').toLowerCase(),
        tags: (post.frontmatter.tags || []).map(tag =>
          (tag || '').toLowerCase()
        )
      })),
    [posts]
  )

  let filteredPosts = posts.edges
  if (text) {
    const lowerCaseText = text.toLowerCase()
    if (lowerCaseText[0] === '#') {
      const tag = lowerCaseText.slice(1)
      if (tag) {
        filteredPosts = filteredPosts.filter((_, i) =>
          lowerCasePosts[i].tags.includes(tag)
        )
      }
    } else {
      filteredPosts = filteredPosts.filter(
        (_, i) =>
          lowerCasePosts[i].title.includes(lowerCaseText) ||
          lowerCasePosts[i].description.includes(lowerCaseText) ||
          lowerCasePosts[i].excerpt.includes(lowerCaseText)
      )
    }
  }

  return (
    <section className='section'>
      <div className='container'>
        {filteredPosts.map(({ node: post }) => (
          <PostItem key={post.id} post={post} onTagClicked={onTagClicked} />
        ))}
      </div>
    </section>
  )
})

PostList.propTypes = {
  text: PropTypes.string,
  posts: PropTypes.shape({
    edges: PropTypes.arrayOf(
      PropTypes.shape({
        node: PostItem.propTypes.post
      })
    )
  }),
  setSearchText: PropTypes.func
}

export default PostList
