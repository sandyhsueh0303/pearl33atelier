'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'
import type { BlogPost } from '../lib/blog'

type BlogSearchProps = {
  posts: BlogPost[]
}

export default function BlogSearch({ posts }: BlogSearchProps) {
  const [query, setQuery] = useState('')

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return posts

    return posts.filter((post) => {
      const searchableText = [
        post.title,
        post.excerpt,
        post.seoDescription,
        post.tags.join(' '),
        post.content,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(keyword)
    })
  }, [posts, query])

  return (
    <>
      <div style={{ maxWidth: '1100px', margin: `0 auto ${spacing.xl}` }}>
        <label
          htmlFor="blog-search"
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
            letterSpacing: '0.05em',
          }}
        >
          Search Journal
        </label>
        <input
          id="blog-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pearl types, care tips, custom jewelry..."
          style={{
            width: '100%',
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: '8px',
            border: `1px solid ${colors.lightGray}`,
            fontSize: typography.fontSize.base,
            outline: 'none',
            backgroundColor: colors.white,
            color: colors.darkGray,
          }}
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '10px',
            padding: spacing.lg,
            textAlign: 'center',
            color: colors.textSecondary,
            backgroundColor: '#fcfcfc',
          }}
        >
          No articles found for "{query}".
        </div>
      ) : (
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing.lg,
          }}
        >
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '10px',
                padding: spacing.lg,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p style={{ color: colors.textLight, fontSize: typography.fontSize.sm, marginBottom: spacing.xs }}>
                {post.publishedAt} • {post.readingMinutes} min read
              </p>
              <h2
                style={{
                  fontSize: typography.fontSize['2xl'],
                  color: colors.darkGray,
                  marginBottom: spacing.sm,
                  lineHeight: typography.lineHeight.tight,
                }}
              >
                {post.title}
              </h2>
              <p
                style={{
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                  marginBottom: spacing.md,
                }}
              >
                {post.excerpt}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: spacing.md }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.darkGray,
                      backgroundColor: '#f6f6f6',
                      border: `1px solid ${colors.lightGray}`,
                      borderRadius: '999px',
                      padding: '4px 10px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  display: 'inline-block',
                  padding: `${spacing.xs} ${spacing.md}`,
                  border: `1px solid ${colors.darkGray}`,
                  color: colors.darkGray,
                  textDecoration: 'none',
                  letterSpacing: '0.06em',
                  transition: transitions.fast,
                }}
              >
                Read Article
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
