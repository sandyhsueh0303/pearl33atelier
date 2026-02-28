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
      <div
        style={{
          maxWidth: '980px',
          margin: `0 auto ${spacing.xl}`,
          padding: spacing.lg,
          borderRadius: '18px',
          border: '1px solid rgba(212, 175, 55, 0.24)',
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248, 246, 240, 0.98) 100%)',
          boxShadow: '0 14px 32px rgba(96, 82, 48, 0.1)',
        }}
      >
        <label
          htmlFor="blog-search"
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            color: '#7e6a46',
            marginBottom: spacing.xs,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
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
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            fontSize: typography.fontSize.base,
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: colors.darkGray,
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.04)',
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
            maxWidth: '980px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: spacing.xl,
          }}
        >
          {filteredPosts.map((post) => (
            <article
              className="journalCard"
              key={post.slug}
              style={{
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(249, 245, 237, 0.94) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                borderRadius: '16px',
                padding: spacing.lg,
                boxShadow: '0 12px 28px rgba(44, 44, 44, 0.08)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <p style={{ color: '#8f7a53', fontSize: typography.fontSize.sm, marginBottom: spacing.xs }}>
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
                      color: '#5a4a2a',
                      backgroundColor: '#f8ecd7',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      letterSpacing: '0.04em',
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
                  alignSelf: 'flex-end',
                  marginTop: 'auto',
                  padding: `${spacing.xs} ${spacing.md}`,
                  borderRadius: '999px',
                  border: '1px solid rgba(212, 175, 55, 0.45)',
                  background: '#f7e7ce',
                  color: '#473c26',
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  transition: transitions.fast,
                  boxShadow: '0 6px 14px rgba(106, 85, 47, 0.14)',
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
