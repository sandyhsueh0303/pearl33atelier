import Link from 'next/link'
import type { Metadata } from 'next'
import { colors, typography, spacing } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import { getAllPosts } from '../lib/blog'
import BlogSearch from './BlogSearch'
import PageHero from '../components/PageHero'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'

export const metadata: Metadata = {
  title: 'Pearl Blog | Guides, Care Tips, and Buying Advice',
  description:
    'Explore pearl guides, care tips, buying advice, and custom design insights from 33 Pearl Atelier.',
  keywords: [
    'pearl blog',
    'pearl buying guide',
    'pearl care tips',
    'pearl types guide',
    'custom pearl jewelry blog',
    '33 Pearl Atelier blog',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Pearl Blog | Guides, Care Tips, and Buying Advice',
    description:
      'Explore pearl guides, care tips, buying advice, and custom design insights from 33 Pearl Atelier.',
    url: `${SITE_URL}/blog`,
    type: 'website',
    siteName: '33 Pearl Atelier',
    images: [
      {
        url: `${SITE_URL}/images/og-home.png`,
        width: 1200,
        height: 630,
        alt: '33 Pearl Atelier Pearl Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pearl Blog | Guides, Care Tips, and Buying Advice',
    description:
      'Explore pearl guides, care tips, buying advice, and custom design insights from 33 Pearl Atelier.',
    images: [`${SITE_URL}/images/og-home.png`],
  },
}

export default function JournalPage() {
  const posts = getAllPosts()

  return (
    <main style={pageHeroStyles.main}>
      <PageHero
        eyebrow="Journal / Blog"
        title="Pearl Knowledge & Stories"
        description="Educational blog content organized into topic clusters to help visitors and search engines understand your expertise."
      />

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
