import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'
import styles from './faq.module.css'

export const metadata: Metadata = {
  title: 'Pearl Jewelry FAQ',
  description:
    'Answers to common questions about pearl jewelry, custom services, shipping, care, and returns from 33 Pearl Atelier.',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQPage() {
  const faqs = [
    {
      id: 'exact-piece-photos',
      q: 'Will my pearl look exactly like the photos?',
      a: 'Yes — most of our pearl pieces are photographed individually, so the pearl you see is the exact one you will receive. We also provide images under different lighting conditions whenever possible, so you can view its luster and tone with confidence.',
    },
    {
      id: 'pearl-types',
      q: 'What pearl types do you offer?',
      a: 'We work with Akoya, South Sea, Tahitian, and Freshwater pearls, selected based on design direction, availability, and your budget.',
    },
    {
      id: 'pearl-size-color',
      q: 'Can I request size or tone?',
      a: 'Yes. You’re welcome to share your preferred size range, color family, or overtone, and we will recommend the most suitable options available.',
    },
    {
      id: 'matching-sets',
      q: 'Do you offer matching sets?',
      a: 'Yes. We can create coordinated sets — such as necklace, earrings, or bracelets — with carefully matched pearl character and metal tone.',
    },
    {
      id: 'timeline-faq',
      q: 'How long does custom take?',
      a: 'Most custom pieces are completed in 2-6 weeks, depending on pearl availability, matching requirements, and design complexity.',
    },
    {
      id: 'shipping-policy',
      q: 'Shipping time?',
      a: 'Yes. U.S. shipping is estimated at 3 business days (excluding weekends). International shipping is usually 10-14 days, depending on destination and customs processing.',
    },
    {
      id: 'tax-policy',
      q: 'Do you charge tax?',
      a: 'Tax is currently applied to California orders only, because we are required to collect sales tax for orders delivered within California based on local tax regulations.',
    },
    {
      id: 'shipping-fee',
      q: 'How much is shipping?',
      a: 'Shipping is free for orders over $200. For orders below $200, a flat $10 shipping fee applies.',
    },
    {
      id: 'returns-policy',
      q: 'Return policy?',
      a: 'Because every pearl is individually chosen, we do not offer standard returns. Instead, we provide a lifetime restyling service for all pearl jewelry purchased from us — allowing your piece to be refreshed or redesigned as your style evolves.',
    },
    {
      id: 'repairs-restringing',
      q: 'Repairs / Restringing',
      a: 'Yes — we offer restringing and selected repair services for pearl jewelry purchased from us. Because we personally select and match each pearl, this allows us to maintain consistent quality and design integrity. For pieces not originally from 33 Pearl Atelier, we may not be able to guarantee results, as pearls can vary in treatment, structure, and appearance. If you’re unsure, feel free to contact us with a photo and a brief description — we’re always happy to take a look and advise.',
    },
    {
      id: 'daily-care',
      q: 'Care Guide',
      a: 'Wear pearls last, remove them first. Avoid chemical exposure and gently wipe with a soft cloth after each wear. For detailed care tips, please visit our Care Guide.',
    },
    {
      id: 'start-custom',
      q: 'Custom Inquiry',
      a: 'Please visit our Contact page and share your style idea, preferred pearl type, budget range, and timeline. We’ll guide you through the next steps.',
    },
  ]

  const groupedFaqs = [
    {
      title: 'Before Purchase',
      ids: ['exact-piece-photos', 'pearl-types', 'pearl-size-color', 'matching-sets'],
    },
    {
      title: 'Ordering & Delivery',
      ids: ['timeline-faq', 'shipping-policy', 'shipping-fee', 'tax-policy', 'returns-policy'],
    },
    {
      title: 'After Purchase',
      ids: ['repairs-restringing', 'daily-care', 'start-custom'],
    },
  ]

  const faqById = Object.fromEntries(faqs.map((item) => [item.id, item]))

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <main style={pageHeroStyles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Common questions about custom pearl jewelry, timelines, care, and after-service support."
      />

      <section style={{ padding: `${spacing['2xl']} ${spacing.xl} ${spacing['3xl']}` }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', display: 'grid', gap: spacing.xl }}>
          {groupedFaqs.map((group) => (
            <section
              key={group.title}
              style={{
                paddingTop: spacing.md,
                borderTop: `1px solid ${colors.lightGray}`,
              }}
            >
              <h2
                style={{
                  fontSize: typography.fontSize['2xl'],
                  color: colors.darkGray,
                  marginBottom: spacing.md,
                  letterSpacing: '0.01em',
                }}
              >
                {group.title}
              </h2>
              <div style={{ display: 'grid', gap: spacing.md }}>
                {group.ids.map((id) => {
                  const item = faqById[id]
                  if (!item) return null

                  return (
                    <details
                      key={item.q}
                      id={item.id}
                      className={styles.faqItem}
                      style={{
                        scrollMarginTop: '110px',
                        backgroundColor: colors.white,
                        border: `1px solid ${colors.lightGray}`,
                        borderRadius: '12px',
                        padding: `${spacing.md} ${spacing.lg}`,
                        boxShadow: '0 6px 14px rgba(24, 24, 24, 0.04)',
                      }}
                    >
                      <summary
                        className={styles.faqSummary}
                        style={{
                          fontSize: typography.fontSize.xl,
                          fontWeight: typography.fontWeight.medium,
                          color: colors.darkGray,
                          cursor: 'pointer',
                          listStyle: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: spacing.md,
                        }}
                      >
                        <span>{item.q}</span>
                        <span
                          className={styles.marker}
                          aria-hidden="true"
                          style={{ color: colors.gold, fontSize: typography.fontSize.lg }}
                        />
                      </summary>
                      <p
                        style={{
                          fontSize: typography.fontSize.base,
                          color: colors.textSecondary,
                          lineHeight: typography.lineHeight.relaxed,
                          marginTop: spacing.sm,
                          paddingTop: spacing.sm,
                          borderTop: `1px solid ${colors.lightGray}`,
                        }}
                      >
                        {item.a}
                      </p>
                    </details>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
          textAlign: 'center',
          borderTop: `1px solid ${colors.lightGray}`,
          background: 'linear-gradient(180deg, #fffefb 0%, #ffffff 100%)',
        }}
      >
        <p
          style={{
            fontSize: typography.fontSize.sm,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: colors.textSecondary,
            marginBottom: spacing.sm,
          }}
        >
          Personal guidance available
        </p>
        <h2
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.normal,
            color: colors.darkGray,
            marginBottom: spacing.md,
          }}
        >
          Still Have Questions?
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.textSecondary,
            lineHeight: typography.lineHeight.relaxed,
            marginBottom: spacing.xl,
            maxWidth: '700px',
            margin: `0 auto ${spacing.xl}`,
          }}
        >
          Reach out and we&apos;ll help with recommendations based on your style, pearl preference, and timeline.
        </p>
        <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/contact"
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              backgroundColor: colors.darkGray,
              color: colors.white,
              textDecoration: 'none',
              border: `1px solid ${colors.darkGray}`,
              letterSpacing: '0.08em',
              transition: transitions.fast,
            }}
          >
            Start Custom Inquiry
          </Link>
        </div>
        <p style={{ marginTop: spacing.sm }}>
          <Link href="/care-guide" style={{ color: colors.textSecondary }}>
            For daily handling steps, read the care guide.
          </Link>
        </p>
      </section>
    </main>
  )
}
