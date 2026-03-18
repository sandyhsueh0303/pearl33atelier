import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPostSlugs } from '../../lib/blog'
import { colors, typography, spacing } from '../../constants/design'

type Props = {
  params: Promise<{ slug: string }>
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

  const siteUrl = 'https://33pearlatelier.com'
  const postUrl = `${siteUrl}/blog/${post.slug}`
  
  return {
    // 基本 SEO
    title: `${post.title} | 33 Pearl Atelier`,
    description: post.seoDescription,
    
    // Open Graph（Facebook, LinkedIn）
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.seoDescription,
      images: [
        {
          url: `${siteUrl}/default-og.jpg`,
          width: 1200,
          height: 630,
          alt: post.title,
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
      images: [`${siteUrl}/default-og.jpg`],
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

  const siteUrl = 'https://33pearlatelier.com'
  
  // ⭐ JSON-LD 結構化資料（給 Google）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/blog/${post.slug}`,
    headline: post.title,
    description: post.seoDescription,
    image: `${siteUrl}/default-og.jpg`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: '33 Pearl Atelier',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
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
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Journal',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

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

          <section style={{ marginTop: spacing['2xl'], textAlign: 'center' }}>
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                padding: `${spacing.xs} ${spacing.md}`,
                background: 'linear-gradient(135deg, #2c2c2c 0%, #4b463d 100%)',
                color: colors.white,
                textDecoration: 'none',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                letterSpacing: '0.08em',
                boxShadow: '0 10px 22px rgba(44, 44, 44, 0.2)',
              }}
            >
              Start Custom Inquiry
            </Link>
          </section>

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
