import type { Metadata } from 'next'
import { colors, typography, spacing } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'
import ContactMethods from './ContactMethods'
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

      <div style={{ marginTop: `-${spacing.lg}` }}>
        <ContactMethods />
      </div>

      {/* Contact Form Section */}
      <section
        style={{
          padding: `0 ${spacing.xl} ${spacing['3xl']}`,
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            backgroundColor: colors.white,
            border: '1px solid #ece7dc',
            borderRadius: '12px',
            boxShadow: 'none',
            padding: spacing.xl,
          }}
        >
          <ContactForm />
          <p
            style={{
              margin: `${spacing.lg} 0 0`,
              paddingTop: spacing.md,
              borderTop: '1px solid #f0ece2',
              textAlign: 'center',
              fontSize: typography.fontSize.base,
              color: colors.gold,
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
