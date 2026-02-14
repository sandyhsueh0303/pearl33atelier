import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { colors, typography, spacing } from '../../constants/design'
import { blogPosts, getPostBySlug } from '../posts'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article Not Found | 33 Pearl Atelier',
    }
  }

  return {
    title: `${post.title} | 33 Pearl Atelier`,
    description: post.seoDescription,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: '33 Pearl Atelier',
    },
  }

  return (
    <main style={{ backgroundColor: colors.white }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article style={{ maxWidth: '820px', margin: '0 auto', padding: `${spacing['4xl']} ${spacing.xl}` }}>
        <p style={{ color: colors.textLight, marginBottom: spacing.sm }}>
          {post.publishedAt} • {post.readingMinutes} min read
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            color: colors.darkGray,
            lineHeight: typography.lineHeight.tight,
            marginBottom: spacing.md,
          }}
        >
          {post.title}
        </h1>
        <p
          style={{
            color: colors.textSecondary,
            lineHeight: typography.lineHeight.relaxed,
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.lg,
          }}
        >
          {post.excerpt}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: spacing['2xl'] }}>
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

        {post.sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: spacing['2xl'] }}>
            <h2 style={{ fontSize: typography.fontSize['2xl'], color: colors.darkGray, marginBottom: spacing.sm }}>
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                style={{
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                  marginBottom: spacing.sm,
                }}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <Link
          href="/blog"
          style={{
            display: 'inline-block',
            padding: `${spacing.xs} ${spacing.md}`,
            border: `1px solid ${colors.darkGray}`,
            color: colors.darkGray,
            textDecoration: 'none',
            letterSpacing: '0.06em',
          }}
        >
          Back to Journal
        </Link>
      </article>
    </main>
  )
}

