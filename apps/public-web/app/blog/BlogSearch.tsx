'use client'

import { Fragment, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { colors, typography, spacing, transitions, shadows } from '../constants/design'
import type { BlogPost } from '../lib/blog'

type BlogSearchProps = {
  posts: BlogPost[]
}

export default function BlogSearch({ posts }: BlogSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return posts.filter((post) => {
      if (!keyword) return true

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

  const activeCount = query.trim() ? 1 : 0

  return (
    <>
      <div
        style={{
          maxWidth: '1240px',
          margin: `0 auto ${spacing.lg}`,
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing.xs,
            padding: `${spacing.xs} ${spacing.md}`,
            border: `1px solid ${activeCount > 0 ? colors.gold : 'rgba(44, 44, 44, 0.14)'}`,
            backgroundColor: colors.white,
            color: colors.darkGray,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: shadows.subtle,
          }}
        >
          <span>Filter</span>
          {activeCount > 0 ? (
            <span
              style={{
                display: 'inline-flex',
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                borderRadius: '999px',
                backgroundColor: colors.gold,
                color: colors.white,
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: typography.fontSize.xs,
              }}
            >
              {activeCount}
            </span>
          ) : null}
          <span>{isOpen ? '▴' : '▾'}</span>
        </button>

        {isOpen ? (
          <div
            style={{
              position: 'absolute',
              top: `calc(100% + ${spacing.sm})`,
              right: 0,
              width: 'min(92vw, 360px)',
              padding: spacing.md,
              border: '1px solid rgba(44, 44, 44, 0.12)',
              backgroundColor: colors.white,
              boxShadow: shadows.medium,
              zIndex: 20,
              display: 'grid',
              gap: spacing.sm,
            }}
          >
            <input
              id="blog-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pearl types, care tips, or styling ideas..."
              style={{
                width: '100%',
                padding: `${spacing.xs} ${spacing.sm}`,
                border: `1px solid ${colors.lightGray}`,
                backgroundColor: '#fffdf8',
                fontSize: typography.fontSize.sm,
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: spacing.sm,
                marginTop: spacing.xs,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: colors.gold,
                  fontSize: typography.fontSize.sm,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  border: `1px solid ${colors.lightGray}`,
                  background: colors.white,
                  color: colors.darkGray,
                  fontSize: typography.fontSize.sm,
                  cursor: 'pointer',
                  padding: `${spacing.xs} ${spacing.sm}`,
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
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
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))',
            gap: spacing.lg,
          }}
        >
          {filteredPosts.map((post, index) => (
            <Fragment key={post.slug}>
              <div style={{ display: 'grid', gap: spacing.lg }}>
                <article
                  className="journalCard"
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(249, 245, 237, 0.94) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.22)',
                    borderRadius: '16px',
                    padding: `clamp(0.9rem, 3vw, ${spacing.lg}) clamp(0.9rem, 3vw, ${spacing.lg}) clamp(0.8rem, 2.5vw, ${spacing.md})`,
                    boxShadow: '0 12px 28px rgba(44, 44, 44, 0.08)',
                    display: 'grid',
                    gridTemplateColumns: post.ogImage
                      ? 'clamp(96px, 28vw, 140px) minmax(0, 1fr)'
                      : '1fr',
                    gap: spacing.sm,
                    alignItems: 'start',
                  }}
                >
                  {post.ogImage ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{
                        display: 'block',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      width: 'clamp(96px, 28vw, 140px)',
                      height: 'clamp(84px, 24vw, 104px)',
                      backgroundColor: '#f6f1e8',
                      flexShrink: 0,
                      marginTop: 'clamp(0.75rem, 2vw, 1.75rem)',
                    }}
                  >
                      <Image
                        src={post.ogImage}
                        alt={post.ogImageAlt || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 980px"
                        style={{ objectFit: 'cover' }}
                      />
                    </Link>
                  ) : null}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing.sm,
                      minWidth: 0,
                    }}
                  >
                    <p style={{ color: '#8f7a53', fontSize: typography.fontSize.sm, margin: 0 }}>
                      {post.publishedAt} • {post.readingMinutes} min read
                    </p>
                    <h2
                      style={{
                        fontSize: typography.fontSize['2xl'],
                        color: colors.darkGray,
                        margin: 0,
                        lineHeight: typography.lineHeight.tight,
                      }}
                    >
                      {post.title}
                    </h2>
                    <p
                      style={{
                        color: colors.textSecondary,
                        lineHeight: typography.lineHeight.relaxed,
                        margin: 0,
                        maxWidth: '52rem',
                      }}
                    >
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: spacing.xs,
                      }}
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        style={{
                          display: 'inline-block',
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
                    </div>
                  </div>
                </article>
              </div>

              {index === 1 && filteredPosts.length > 2 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    borderRadius: '16px',
                    border: '1px solid rgba(212, 175, 55, 0.22)',
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248, 246, 240, 0.96) 100%)',
                    padding: `${spacing.lg} ${spacing.xl}`,
                    textAlign: 'center',
                    boxShadow: '0 10px 24px rgba(96, 82, 48, 0.08)',
                  }}
                >
                  <p
                    style={{
                      margin: `0 0 ${spacing.sm}`,
                      fontSize: typography.fontSize.lg,
                      color: colors.darkGray,
                    }}
                  >
                    Not sure where to start?
                  </p>
                  <Link
                    href="/products"
                    style={{
                      color: '#473c26',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(71, 60, 38, 0.22)',
                      paddingBottom: '2px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Explore our ready-to-wear collection →
                  </Link>
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      )}
    </>
  )
}
