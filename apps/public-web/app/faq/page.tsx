import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'

export default function FAQPage() {
  const faqs = [
    {
      q: 'What pearl types do you offer?',
      a: 'We work with Akoya, South Sea, Tahitian, and Freshwater pearls, depending on the design direction and your budget.',
    },
    {
      q: 'How long does a custom pearl piece take?',
      a: 'Most custom pieces are completed in 3-8 weeks, depending on pearl availability, matching requirements, and design complexity.',
    },
    {
      q: 'Can I request a specific pearl size or color tone?',
      a: 'Yes. You can specify preferred size range, color family, and overtone. We will recommend the best available options.',
    },
    {
      q: 'Do you offer matching sets?',
      a: 'Yes. We can create coordinated sets (for example necklace + earrings + bracelet) with matched pearl character and metal tone.',
    },
    {
      q: 'Do you provide repairs or restringing?',
      a: 'Yes. We provide restringing and selected repair services. Please contact us with photos and a short description of the issue.',
    },
    {
      q: 'How should I care for pearl jewelry daily?',
      a: 'Wear pearls last, remove first, avoid chemical exposure, and wipe with a soft cloth after each wear. See our Care Guide for details.',
    },
    {
      q: 'Can I return a custom-made item?',
      a: 'Custom pieces are generally final sale once production begins. If there is a craftsmanship issue, we will assist with appropriate aftercare.',
    },
    {
      q: 'Do you offer shipping, and how long does delivery take?',
      a: 'Yes. U.S. shipping is estimated at 3 business days (excluding weekends). International shipping is typically around 10-14 days, depending on destination and customs processing.',
    },
    {
      q: 'How do I start a custom inquiry?',
      a: 'Use our Contact page and include your style idea, preferred pearl type, budget range, and target timeline.',
    },
  ]

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
            FAQ
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.3rem, 6.5vw, 4.2rem)',
              fontWeight: typography.fontWeight.normal,
              lineHeight: typography.lineHeight.tight,
              letterSpacing: '0.03em',
              color: colors.darkGray,
              marginBottom: spacing.lg,
            }}
          >
            Frequently Asked Questions
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
            Common questions about custom pearl jewelry, timelines, care, and after-service support.
          </p>
        </div>
      </section>

      <section style={{ padding: `${spacing['3xl']} ${spacing.xl} ${spacing['4xl']}` }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', display: 'grid', gap: spacing.md }}>
          {faqs.map((item) => (
            <details
              key={item.q}
              style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '10px',
                padding: `${spacing.md} ${spacing.lg}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <summary
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
                <span style={{ color: colors.gold, fontSize: typography.fontSize.lg }}>+</span>
              </summary>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                  marginTop: spacing.sm,
                }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['3xl']} ${spacing.xl}`,
          textAlign: 'center',
          borderTop: `1px solid ${colors.lightGray}`,
        }}
      >
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
            Contact Us
          </Link>
          <Link
            href="/care-guide"
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              backgroundColor: 'transparent',
              color: colors.darkGray,
              textDecoration: 'none',
              border: `1px solid ${colors.darkGray}`,
              letterSpacing: '0.08em',
              transition: transitions.fast,
            }}
          >
            Care Guide
          </Link>
        </div>
      </section>
    </main>
  )
}
