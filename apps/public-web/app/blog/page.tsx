import Link from 'next/link'
import type { Metadata } from 'next'
import { colors, typography, spacing } from '../constants/design'
import { getAllPosts } from '../lib/blog'
import BlogSearch from './BlogSearch'

export const metadata: Metadata = {
  title: 'Pearl Blog',
  description:
    'Pearl blog by 33 Pearl Atelier covering Pearl Types, Pearl Care, Buying Guide, and Custom Design insights.',
}

export default function JournalPage() {
  const posts = getAllPosts()

  return (
    <main style={{ backgroundColor: colors.white }}>
      <section
        style={{
          padding: `${spacing['4xl']} ${spacing.xl} ${spacing['3xl']}`,
          background: 'linear-gradient(180deg, #f7f4ee 0%, #ffffff 100%)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: spacing.md,
            }}
          >
            Journal / Blog
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 6.5vw, 4rem)',
              fontWeight: typography.fontWeight.normal,
              lineHeight: typography.lineHeight.tight,
              letterSpacing: '0.03em',
              color: colors.darkGray,
              marginBottom: spacing.lg,
            }}
          >
            Pearl Knowledge & Stories
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
              maxWidth: '760px',
              margin: '0 auto',
            }}
          >
            Educational blog content organized into topic clusters to help visitors and search engines understand your expertise.
          </p>
        </div>
      </section>

      <section style={{ padding: `${spacing['3xl']} ${spacing.xl} ${spacing['4xl']}` }}>
        <BlogSearch posts={posts} />
      </section>

      <section style={{ textAlign: 'center', padding: `0 ${spacing.xl} ${spacing['3xl']}` }}>
        <Link
          href="/products"
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
          Shop Collection
        </Link>
      </section>
    </main>
  )
}
