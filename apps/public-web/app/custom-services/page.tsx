import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'

export const metadata: Metadata = {
  title: 'Custom Pearl Jewelry Service',
  description:
    'Design custom pearl jewelry with 33 Pearl Atelier. Choose pearl type, size, tone, and setting for a bespoke handcrafted piece.',
}

export default function CustomServicesPage() {
  const processSteps = [
    {
      step: '01',
      title: 'Consultation',
      description:
        'Share your preferred style, occasion, and budget. We help define pearl type, size range, overtone, and setting direction.',
    },
    {
      step: '02',
      title: 'Select Your Pearl',
      description:
        'Choose your pearl variety and quality level. We then provide curated design options with recommendations on pearl matching, metal tone, and silhouette.',
    },
    {
      step: '03',
      title: 'Finalize the Artistry',
      description:
        'Confirm final details including measurements, clasp or setting style, and finishing touches before production.',
    },
    {
      step: '04',
      title: 'Handcraft & Delivery',
      description:
        'Your custom piece is handcrafted, matched for symmetry, and quality-checked before final delivery.',
    },
  ]

  const customNote =
    'From first pearl selection to final setting, our custom service is focused on precision and wearability. Whether you are looking for a timeless pendant, elegant earrings, a matched bracelet, or a custom ring, we tailor pearl quality, metal tone, and design proportion to your personal style.'
  const introTitle =
    "Whether you envision a unique necklace, elegant earrings, or a statement piece, we'll bring your vision to life with the finest pearls and expert craftsmanship."

  return (
    <main style={pageHeroStyles.main}>
      <PageHero
        eyebrow="Custom Services"
        title="Design Your Dream Jewelry"
        description={introTitle}
      />

      <section style={{ padding: `${spacing['3xl']} ${spacing.xl}` }}>
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing['2xl'],
          }}
        >
          <article>
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                color: colors.darkGray,
                marginBottom: spacing.md,
              }}
            >
              What We Can Customize
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.md,
              }}
            >
              {customNote}
            </p>
          </article>

          <aside
            style={{
              backgroundColor: colors.pearl,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '10px',
              padding: spacing.lg,
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                color: colors.darkGray,
                marginBottom: spacing.sm,
              }}
            >
              Typical Timeline
            </h3>
            <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed }}>
              Most custom projects are completed within 3-8 weeks depending on complexity,
              pearl availability, matching requirements, and revision rounds.
            </p>
            <p
              style={{
                marginTop: spacing.md,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              For event deadlines, we recommend contacting us as early as possible.
            </p>
          </aside>
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl} ${spacing['4xl']}`,
          backgroundColor: '#fcfbf8',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: typography.fontSize['3xl'],
              color: colors.darkGray,
              textAlign: 'center',
              marginBottom: spacing['2xl'],
            }}
          >
            Custom Process
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: spacing.lg,
            }}
          >
            {processSteps.map((item) => (
              <article
                key={item.step}
                style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '10px',
                  padding: spacing.lg,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    letterSpacing: '0.2em',
                    color: colors.gold,
                    marginBottom: spacing.sm,
                  }}
                >
                  STEP {item.step}
                </p>
                <h3
                  style={{
                    fontSize: typography.fontSize.xl,
                    color: colors.darkGray,
                    marginBottom: spacing.sm,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.textSecondary,
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  {item.description}
                </p>
              </article>
            ))}
          </div>
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
          Ready to Begin?
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
          Tell us your style direction, pearl preference, and timeline. We&apos;ll reply with focused
          recommendations and clear next steps for your custom piece.
        </p>
        <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/custom/inquiry"
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
            Start Your Custom Design Journey 
          </Link>
        </div>
        <p style={{ marginTop: spacing.sm }}>
          <Link href="/products" style={{ color: colors.textSecondary }}>
            Prefer ready-to-wear first? Shop collection.
          </Link>
        </p>
      </section>
    </main>
  )
}
