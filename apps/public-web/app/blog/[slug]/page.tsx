import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPostSlugs } from '../../lib/blog'
import { colors, typography, spacing } from '../../constants/design'

type Props = {
  params: Promise<{ slug: string }>
}

// 產生靜態頁面（SSG）
export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs
}

// 產生 metadata（SEO）
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | 33 Pearl Atelier`,
    description: post.seoDescription,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main style={{ backgroundColor: colors.white }}>
      {/* Header */}
      <header
        style={{
          padding: `${spacing['4xl']} ${spacing.xl} ${spacing.lg}`,
          background: 'linear-gradient(180deg, #f7f4ee 0%, #ffffff 100%)',
          textAlign: 'center',
          borderBottom: `1px solid ${colors.lightGray}`,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: spacing.md,
            }}
          >
            Journal
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: typography.fontWeight.normal,
              lineHeight: typography.lineHeight.tight,
              letterSpacing: '0.02em',
              color: colors.darkGray,
              marginBottom: spacing.lg,
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              maxWidth: '700px',
              margin: `0 auto ${spacing.lg}`,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
              fontSize: typography.fontSize.lg,
            }}
          >
            {post.excerpt}
          </p>
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              display: 'flex',
              justifyContent: 'center',
              gap: spacing.md,
              flexWrap: 'wrap',
              marginBottom: spacing.md,
            }}
          >
            <span>{post.publishedAt}</span>
            <span>•</span>
            <span>{post.readingMinutes} min read</span>
            <span>•</span>
            <span>{post.author}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
        </div>
      </header>

      {/* Content */}
      <article
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: `${spacing.sm} ${spacing.xl} ${spacing['4xl']}`,
        }}
      >
        <div
          className="markdown-content"
          style={{
            color: colors.textPrimary,
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div style={{ marginTop: spacing['2xl'] }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-block',
              padding: `${spacing.xs} ${spacing.md}`,
              border: `1px solid ${colors.lightGray}`,
              color: colors.darkGray,
              textDecoration: 'none',
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.04em',
            }}
          >
            ← Back to Journal
          </Link>
        </div>
      </article>

      <style>{`
        .markdown-content {
          font-size: 1.125rem;
          line-height: 1.9;
          color: #2c2c2c;
        }

        .markdown-content h2 {
          font-size: 2rem;
          line-height: 1.3;
          margin-top: 3rem;
          margin-bottom: 1rem;
          color: #2c2c2c;
          letter-spacing: 0.01em;
        }

        .markdown-content h3 {
          font-size: 1.5rem;
          line-height: 1.35;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #2c2c2c;
        }

        .markdown-content p {
          margin: 0 0 1rem;
          color: #4a4a4a;
        }

        .markdown-content ul,
        .markdown-content ol {
          margin: 0 0 1.25rem 1.25rem;
          color: #4a4a4a;
        }

        .markdown-content li {
          margin-bottom: 0.35rem;
        }

        .markdown-content blockquote {
          margin: 1.5rem 0;
          padding: 0.75rem 1rem;
          border-left: 3px solid #d4af37;
          background: #faf8f2;
          color: #555;
        }

        .markdown-content a {
          color: #2c2c2c;
          text-underline-offset: 3px;
        }

        .markdown-content strong {
          color: #1f1f1f;
          font-weight: 600;
        }
      `}</style>
    </main>
  )
}
