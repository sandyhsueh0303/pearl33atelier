import type { Metadata } from 'next'
import { colors, typography, spacing } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'
import ContactForm from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us | 33 Pearl Atelier',
  description:
    'Get in touch with 33 Pearl Atelier. Questions about our pearl jewelry collection, shipping, or care? We typically respond within 24 hours.',
}

export default function ContactPage() {
  return (
    <main style={pageHeroStyles.main}>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        description="Have a question about our collection, shipping, or pearl care? We&apos;re here to help. We typically respond within 24 hours."
      />

      {/* Contact Form Section */}
      <section
        style={{
          padding: `${spacing['3xl']} ${spacing.xl}`,
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            backgroundColor: colors.white,
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: spacing.xl,
          }}
        >
          <ContactForm />
        </div>
      </section>

      {/* Business Hours */}
      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl} ${spacing['4xl']}`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            backgroundColor: colors.white,
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: spacing.xl,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.xl,
            }}
          >
            Business Hours
          </h2>
          <div style={{ textAlign: 'left', display: 'inline-block' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: spacing['2xl'],
                marginBottom: spacing.md,
                fontSize: typography.fontSize.base,
              }}
            >
              <span style={{ color: colors.textSecondary }}>Monday - Friday</span>
              <span style={{ color: colors.darkGray, fontWeight: typography.fontWeight.medium }}>
                10:00 AM - 6:00 PM PST
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: spacing['2xl'],
                marginBottom: spacing.md,
                fontSize: typography.fontSize.base,
              }}
            >
              <span style={{ color: colors.textSecondary }}>Saturday</span>
              <span style={{ color: colors.darkGray, fontWeight: typography.fontWeight.medium }}>
                11:00 AM - 4:00 PM PST
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: spacing['2xl'],
                fontSize: typography.fontSize.base,
              }}
            >
              <span style={{ color: colors.textSecondary }}>Sunday</span>
              <span style={{ color: colors.darkGray, fontWeight: typography.fontWeight.medium }}>
                Closed
              </span>
            </div>
          </div>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.gold,
              marginTop: spacing.xl,
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
