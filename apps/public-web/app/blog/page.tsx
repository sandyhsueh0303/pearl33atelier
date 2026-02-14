import type { Metadata } from 'next'
import { colors, typography, spacing } from '../constants/design'
import { blogPosts } from './posts'
import BlogSearch from './BlogSearch'

export const metadata: Metadata = {
  title: 'Journal | 33 Pearl Atelier',
  description:
    'Pearl education, styling tips, and care guides from 33 Pearl Atelier. Explore articles about pearl types, quality, and custom jewelry.',
}

export default function JournalPage() {
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
            Journal
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
            Educational blog content designed to help you understand pearls better and discover the
            right piece for your style.
          </p>
        </div>
      </section>

      <section style={{ padding: `${spacing['3xl']} ${spacing.xl} ${spacing['4xl']}` }}>
        <BlogSearch posts={blogPosts} />
      </section>
    </main>
  )
}
