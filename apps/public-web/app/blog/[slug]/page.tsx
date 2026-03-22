import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPostSlugs, getAllPosts } from '../../lib/blog'
import { colors, typography, spacing } from '../../constants/design'

type Props = {
  params: Promise<{ slug: string }>
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'

function toAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return `${SITE_URL}/images/og-home.png`
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

function stripManualRelatedReadingSection(contentHtml: string) {
  return contentHtml.replace(/<h2>Related Reading<\/h2>\s*(<ul>[\s\S]*?<\/ul>)/i, '')
}

function getRelatedPosts(currentSlug: string, currentTags: string[]) {
  const currentTagSet = new Set(currentTags)

  return getAllPosts()
    .filter((candidate) => candidate.slug !== currentSlug)
    .map((candidate) => {
      const sharedTagCount = candidate.tags.filter((tag) => currentTagSet.has(tag)).length
      return { candidate, sharedTagCount }
    })
    .sort((a, b) => {
      if (b.sharedTagCount !== a.sharedTagCount) return b.sharedTagCount - a.sharedTagCount
      return a.candidate.publishedAt < b.candidate.publishedAt ? 1 : -1
    })
    .slice(0, 2)
    .map(({ candidate }) => candidate)
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs
}

// ⭐ SEO 優化的 Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const postUrl = `${SITE_URL}/blog/${post.slug}`
  const ogImageUrl = toAbsoluteUrl(post.ogImage)
  const ogImageAlt = post.ogImageAlt || post.title
  
  return {
    // 基本 SEO
    title: `${post.title} | 33 Pearl Atelier`,
    description: post.seoDescription,
    keywords: post.keywords,
    
    // Open Graph（Facebook, LinkedIn）
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.seoDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      siteName: '33 Pearl Atelier',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.seoDescription,
      images: [ogImageUrl],
    },
    
    // Canonical URL（避免重複內容）
    alternates: {
      canonical: postUrl,
    },
    
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const ogImageUrl = toAbsoluteUrl(post.ogImage)
  const renderedContent = stripManualRelatedReadingSection(post.content)
  const relatedPosts = getRelatedPosts(post.slug, post.tags)
  
  // ⭐ JSON-LD 結構化資料（給 Google）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}`,
    headline: post.title,
    description: post.seoDescription,
    image: ogImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: '33 Pearl Atelier',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/og-home.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    wordCount: post.content.split(/\s+/).length,
  }

  // ⭐ Breadcrumb 結構化資料
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Journal',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  }

  return (
    <>
      {/* JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main
        style={{
          background:
            'radial-gradient(circle at 8% 12%, rgba(212, 175, 55, 0.14), transparent 30%), radial-gradient(circle at 92% 20%, rgba(247, 231, 206, 0.8), transparent 34%), linear-gradient(180deg, #fffdf9 0%, #ffffff 34%, #f9f5ed 100%)',
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: `${spacing.sm} ${spacing.xl} 0`,
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            letterSpacing: '0.03em',
            textAlign: 'left',
          }}
        >
          <Link href="/">Home</Link> / <Link href="/blog">Journal</Link> / {post.title}
        </nav>

        {/* Article Header */}
        <header
          style={{
            maxWidth: '980px',
            margin: `${spacing.sm} auto 0`,
            padding: `${spacing.xl} ${spacing.xl}`,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: typography.fontWeight.normal,
              lineHeight: typography.lineHeight.tight,
              color: colors.darkGray,
              marginBottom: spacing.lg,
              whiteSpace: 'pre-line',
              textShadow: '0 8px 22px rgba(212, 175, 55, 0.16)',
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              display: 'flex',
              justifyContent: 'center',
              gap: spacing.md,
              flexWrap: 'wrap',
            }}
          >
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            <span>•</span>
            <span>{post.readingMinutes} min read</span>
            <span>•</span>
            <span>{post.author}</span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                marginTop: spacing.lg,
                display: 'flex',
                justifyContent: 'center',
                gap: spacing.sm,
                flexWrap: 'wrap',
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '4px 12px',
                    background: '#f8ecd8',
                    border: '1px solid rgba(212, 175, 55, 0.34)',
                    borderRadius: '999px',
                    fontSize: typography.fontSize.xs,
                    color: '#5f4e2e',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div
            style={{
              width: '120px',
              height: '2px',
              margin: `${spacing.lg} auto 0`,
              background:
                'linear-gradient(90deg, rgba(212, 175, 55, 0.06) 0%, rgba(212, 175, 55, 0.82) 50%, rgba(212, 175, 55, 0.06) 100%)',
            }}
          />
        </header>

        {/* Article Content */}
        <article
          className="blogArticle"
          style={{
            maxWidth: '1040px',
            margin: `${spacing.md} auto 0`,
            padding: `${spacing['2xl']} ${spacing['2xl']} ${spacing['4xl']}`,
            borderRadius: '24px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            background: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 20px 42px rgba(44, 44, 44, 0.1)',
          }}
        >
          {/* Article Body（從 Markdown 轉換的 HTML） */}
          <div
            className="markdown-content"
            style={{
              fontSize: '1.08rem',
              lineHeight: typography.lineHeight.relaxed,
              color: colors.textPrimary,
              maxWidth: '860px',
              margin: '0 auto',
            }}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />

          <section
            style={{
              maxWidth: '860px',
              margin: `${spacing['2xl']} auto 0`,
              padding: '1.5rem 1.6rem',
              border: '1px solid rgba(212, 175, 55, 0.22)',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #fffdf8 0%, #fbf7ef 100%)',
              boxShadow: '0 14px 32px rgba(44, 44, 44, 0.05)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(240px, 0.9fr)',
                gap: spacing.lg,
                alignItems: 'end',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: colors.gold,
                    fontSize: typography.fontSize.xs,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  Continue Exploring
                </p>
                <h2
                  style={{
                    margin: `${spacing.xs} 0 ${spacing.sm}`,
                    color: colors.darkGray,
                    fontSize: 'clamp(1.35rem, 2.6vw, 1.7rem)',
                    lineHeight: 1.3,
                  }}
                >
                  Discover the Collection
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.base,
                    lineHeight: typography.lineHeight.relaxed,
                    maxWidth: '36rem',
                  }}
                >
                  Explore ready-to-wear pieces shaped by the same attention to balance, wearability, and pearl character.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifySelf: 'end',
                  gap: spacing.sm,
                }}
              >
                <Link
                  href="/products"
                  style={{
                    display: 'inline-block',
                    padding: `${spacing.sm} ${spacing.lg}`,
                    borderRadius: '999px',
                    border: '1px solid rgba(212, 175, 55, 0.42)',
                    background: '#f7e7ce',
                    color: '#473c26',
                    textDecoration: 'none',
                    letterSpacing: '0.08em',
                    boxShadow: '0 8px 18px rgba(106, 85, 47, 0.12)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Shop Ready-to-Wear Collection
                </Link>

                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    lineHeight: typography.lineHeight.relaxed,
                    textAlign: 'right',
                  }}
                >
                  Have a question about a piece?{' '}
                  <Link
                    href="/contact"
                    style={{
                      color: colors.darkGray,
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(44, 44, 44, 0.2)',
                      paddingBottom: '1px',
                    }}
                  >
                    Contact us
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          {relatedPosts.length > 0 && (
            <section
              style={{
                maxWidth: '860px',
                margin: `${spacing['2xl']} auto 0`,
                padding: '1.5rem 1.6rem 1.35rem',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #fdf9f1 0%, #fffdfa 100%)',
                boxShadow: '0 14px 32px rgba(44, 44, 44, 0.05)',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: colors.darkGray,
                  fontSize: 'clamp(1.35rem, 2.6vw, 1.7rem)',
                  lineHeight: 1.3,
                }}
              >
                Related Reading
              </h2>
              <div style={{ marginTop: spacing.lg }}>
                {relatedPosts.map((relatedPost, index) => (
                  <article
                    key={relatedPost.slug}
                    style={{
                      padding: index === 0 ? '0 0 1rem' : '1rem 0',
                      borderTop: index === 0 ? '0' : '1px solid rgba(212, 175, 55, 0.16)',
                    }}
                  >
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      style={{
                        color: '#3f3320',
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '1.02rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {relatedPost.title.replace('\n', ' ')}
                    </Link>
                    <p
                      style={{
                        margin: '0.45rem 0 0',
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.sm,
                        lineHeight: 1.8,
                      }}
                    >
                      {relatedPost.excerpt}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 更新日期（如果有） */}
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <p
              style={{
                marginTop: spacing['2xl'],
                fontSize: typography.fontSize.sm,
                color: colors.textLight,
                fontStyle: 'italic',
              }}
            >
              Last updated: <time dateTime={post.updatedAt}>{post.updatedAt}</time>
            </p>
          )}

          <p style={{ marginTop: spacing.lg, textAlign: 'center' }}>
            <Link href="/blog" style={{ color: colors.textSecondary }}>
              ← Back to Journal
            </Link>
          </p>
        </article>

      </main>

      <style>{`
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4 {
          color: #2c2c2c;
          line-height: 1.3;
          margin-top: 2.5rem;
          margin-bottom: 0.85rem;
          letter-spacing: 0.015em;
        }

        .markdown-content h2 {
          font-size: clamp(1.65rem, 3.2vw, 2.05rem);
          padding-bottom: 0.45rem;
          border-bottom: 1px solid rgba(212, 175, 55, 0.34);
        }

        .markdown-content h3 {
          font-size: clamp(1.3rem, 2.5vw, 1.55rem);
        }

        .markdown-content p {
          margin: 0 0 1.15rem;
          color: #4a4a4a;
          line-height: 1.95;
        }

        .markdown-content img {
          display: block;
          width: 100%;
          max-width: 760px;
          height: auto;
          margin: 1.5rem auto 2rem;
          border-radius: 18px;
          border: 1px solid rgba(212, 175, 55, 0.18);
          box-shadow: 0 16px 34px rgba(44, 44, 44, 0.08);
          object-fit: cover;
          background: #f8f6f0;
        }

        .markdown-content ul,
        .markdown-content ol {
          margin: 0.35rem 0 1.35rem 1.3rem;
          color: #4a4a4a;
        }

        .markdown-content li {
          margin-bottom: 0.48rem;
          line-height: 1.8;
        }

        .markdown-content blockquote {
          margin: 1.7rem 0;
          padding: 1rem 1.1rem;
          border-left: 3px solid #d4af37;
          background: linear-gradient(135deg, #faf6ed 0%, #fffdf9 100%);
          color: #4f4f4f;
          border-radius: 0 12px 12px 0;
        }

        .markdown-content hr {
          border: 0;
          border-top: 1px solid rgba(212, 175, 55, 0.32);
          margin: 2.2rem 0;
        }

        .markdown-content a {
          color: #4a3c24;
          text-decoration: underline 1px rgba(212, 175, 55, 0.65);
          text-underline-offset: 3px;
        }

        .markdown-content code {
          background: #f7f3ea;
          border: 1px solid #e8dcc3;
          border-radius: 4px;
          padding: 0.1rem 0.35rem;
          font-size: 0.9em;
        }

        .markdown-content pre {
          background: #f8f8f8;
          border: 1px solid #ececec;
          border-radius: 8px;
          padding: 0.9rem;
          overflow-x: auto;
          margin: 1.2rem 0;
        }

        .markdown-content pre code {
          border: 0;
          background: transparent;
          padding: 0;
        }

        .markdown-content > :first-child {
          margin-top: 0;
        }

        @media (max-width: 768px) {
          .markdown-content h2 {
            font-size: 1.45rem;
          }

          .markdown-content h3 {
            font-size: 1.22rem;
          }
        }
      `}</style>
    </>
  )
}
