import type { Metadata } from 'next'
import { colors, typography, spacing } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'
import ContactForm from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us | 33 Pearl Atelier',
  description:
    'Get in touch with 33 Pearl Atelier. Questions about our pearl jewelry collection, shipping, or care? We typically respond within 24 hours.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <main style={pageHeroStyles.main}>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        description="Have a question about our collection, shipping, or pearl care? We&apos;re here to help. We typically respond within 24 hours."
      />

      <section
        style={{
          padding: `0 ${spacing.xl} ${spacing['2xl']}`,
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: spacing.md,
          }}
        >
          <a
            href="mailto:33pearlatelier@gmail.com"
            style={{
              textDecoration: 'none',
              color: colors.darkGray,
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: '#fffdfa',
              borderRadius: '12px',
              padding: spacing.md,
            }}
          >
            <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: colors.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Email
            </p>
            <p style={{ margin: `${spacing.xs} 0 0`, fontSize: typography.fontSize.base }}>
              33pearlatelier@gmail.com
            </p>
          </a>
          <a
            href="https://www.instagram.com/33_pearl_atelier/"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              color: colors.darkGray,
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: '#fffdfa',
              borderRadius: '12px',
              padding: spacing.md,
            }}
          >
            <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: colors.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Instagram
            </p>
            <p style={{ margin: `${spacing.xs} 0 0`, fontSize: typography.fontSize.base }}>
              @33_pearl_atelier
            </p>
          </a>
          <a
            href="weixin://"
            style={{
              textDecoration: 'none',
              color: colors.darkGray,
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: '#fffdfa',
              borderRadius: '12px',
              padding: spacing.md,
            }}
          >
            <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: colors.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              WeChat
            </p>
            <p style={{ margin: `${spacing.xs} 0 0`, fontSize: typography.fontSize.base }}>
              _33pearlatelier
            </p>
          </a>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        style={{
          padding: `0 ${spacing.xl} ${spacing['2xl']}`,
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            backgroundColor: colors.white,
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(24, 24, 24, 0.05)',
            padding: spacing.xl,
          }}
        >
          <ContactForm />
        </div>
      </section>

      {/* Business Hours */}
      <section
        style={{
          padding: `${spacing.xl} ${spacing.xl} ${spacing['4xl']}`,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: `0 ${spacing.md}` }}>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.gold,
              marginTop: 0,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            ✓ We typically respond within 24 hours
          </p>
        </div>
      </section>
    </main>
  )
}
