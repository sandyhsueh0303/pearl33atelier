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

      <main style={{ backgroundColor: colors.white }}>
        {/* Breadcrumb Navigation（用戶 + SEO） */}
        <nav
          style={{
            padding: `${spacing.lg} ${spacing.xl}`,
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}
        >
          <a href="/">Home</a> / <a href="/blog">Journal</a> / {post.title}
        </nav>

        {/* Article Header */}
        <header
          style={{
            padding: `${spacing['3xl']} ${spacing.xl}`,
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
                    background: colors.pearl,
                    borderRadius: '4px',
                    fontSize: typography.fontSize.xs,
                    color: colors.textSecondary,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            padding: `${spacing.xl} ${spacing.lg} ${spacing['4xl']}`,
          }}
        >
          {/* Article Body（從 Markdown 轉換的 HTML） */}
          <div
            className="markdown-content"
            style={{
              fontSize: typography.fontSize.lg,
              lineHeight: typography.lineHeight.relaxed,
              color: colors.textPrimary,
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
                backgroundColor: colors.darkGray,
                color: colors.white,
                textDecoration: 'none',
                border: `1px solid ${colors.darkGray}`,
                letterSpacing: '0.08em',
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
          margin-top: 2.25rem;
          margin-bottom: 0.85rem;
          letter-spacing: 0.01em;
        }

        .markdown-content h2 {
          font-size: 2rem;
        }

        .markdown-content h3 {
          font-size: 1.5rem;
        }

        .markdown-content p {
          margin: 0 0 1rem;
          color: #4a4a4a;
          line-height: 1.9;
        }

        .markdown-content ul,
        .markdown-content ol {
          margin: 0.25rem 0 1.25rem 1.3rem;
          color: #4a4a4a;
        }

        .markdown-content li {
          margin-bottom: 0.35rem;
          line-height: 1.8;
        }

        .markdown-content blockquote {
          margin: 1.5rem 0;
          padding: 0.85rem 1rem;
          border-left: 3px solid #d4af37;
          background: #faf8f2;
          color: #555;
        }

        .markdown-content hr {
          border: 0;
          border-top: 1px solid #ececec;
          margin: 2rem 0;
        }

        .markdown-content a {
          color: #2c2c2c;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .markdown-content code {
          background: #f4f4f4;
          border: 1px solid #e6e6e6;
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
      `}</style>
    </>
  )
}
