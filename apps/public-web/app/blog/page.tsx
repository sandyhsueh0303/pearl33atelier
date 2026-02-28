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
    <main
      style={{
        background: 'linear-gradient(180deg, #fffdf8 0%, #ffffff 32%, #faf7f1 100%)',
      }}
    >
      <section
        style={{
          padding: `${spacing['4xl']} ${spacing.xl} ${spacing['3xl']}`,
          background: 'linear-gradient(180deg, #f2e9da 0%, #ffffff 100%)',
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
              textShadow: '0 6px 16px rgba(212, 175, 55, 0.14)',
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
          <div
            style={{
              width: '96px',
              height: '2px',
              margin: `${spacing.lg} auto 0`,
              background:
                'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.85) 50%, rgba(212, 175, 55, 0.08) 100%)',
            }}
          />
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['3xl']} ${spacing.xl} ${spacing['4xl']}`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(250, 246, 238, 0.76) 100%)',
        }}
      >
        <BlogSearch posts={posts} />
      </section>

      <section style={{ textAlign: 'center', padding: `0 ${spacing.xl} ${spacing['3xl']}` }}>
        <Link
          href="/products"
          style={{
            display: 'inline-block',
            padding: `${spacing.xs} ${spacing.md}`,
            background: 'linear-gradient(135deg, #2c2c2c 0%, #49443a 100%)',
            color: colors.white,
            textDecoration: 'none',
            border: `1px solid rgba(212, 175, 55, 0.38)`,
            letterSpacing: '0.08em',
            boxShadow: '0 10px 24px rgba(44, 44, 44, 0.2)',
          }}
        >
          Shop Collection
        </Link>
      </section>
    </main>
  )
}
