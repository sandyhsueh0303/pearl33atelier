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
        'Share your style, occasion, and budget. We align pearl type, size range, and setting direction.',
    },
    {
      step: '02',
      title: 'Select Your Pearl',
      description:
        'Choose pearl variety and quality level. We provide curated options for matching, metal tone, and silhouette.',
    },
    {
      step: '03',
      title: 'Finalize the Artistry',
      description:
        'Confirm measurements, clasp or setting style, and final finishing details before production.',
    },
    {
      step: '04',
      title: 'Handcraft & Delivery',
      description:
        'Your piece is handcrafted, matched for symmetry, and quality-checked before delivery.',
    },
  ]

  const customNote =
    'From first pearl selection to final setting, our custom service is focused on precision, proportion, and long-term wearability.'
  const customizableItems = ['Necklace', 'Earrings', 'Bracelet', 'Ring', 'Restringing']
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: spacing['2xl'],
            alignItems: 'stretch',
          }}
        >
          <article
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '12px',
              padding: spacing.lg,
              boxShadow: '0 8px 18px rgba(24, 24, 24, 0.04)',
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.sm,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: colors.gold,
                marginBottom: spacing.xs,
              }}
            >
              Bespoke options
            </p>
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
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.1rem',
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: 0,
              }}
            >
              {customizableItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <aside
            style={{
              background:
                'linear-gradient(180deg, rgba(250,247,241,1) 0%, rgba(246,242,235,1) 100%)',
              border: `1px solid ${colors.lightGray}`,
              borderTop: `3px solid rgba(212, 175, 55, 0.5)`,
              borderRadius: '12px',
              padding: spacing.lg,
              boxShadow: '0 8px 18px rgba(24, 24, 24, 0.04)',
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.sm,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: colors.gold,
                marginBottom: spacing.xs,
              }}
            >
              Typical lead time
            </p>
            <h3
              style={{
                fontSize: typography.fontSize['2xl'],
                color: colors.darkGray,
                marginBottom: spacing.sm,
              }}
            >
              3-8 weeks
            </h3>
            <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed }}>
              Most custom projects are completed within this window depending on complexity,
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
              <br />
              <span
                style={{
                  display: 'inline-block',
                  marginTop: spacing.sm,
                  fontSize: typography.fontSize.sm,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: colors.gold,
                }}
              >
                Need It Sooner?
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: spacing.xs,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.normal,
                  color: colors.darkGray,
                }}
              >
                Rush inquiry welcome.
              </span>
            </p>
          </aside>
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl} ${spacing['3xl']}`,
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
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: spacing.sm,
              flexWrap: 'wrap',
              marginBottom: spacing.lg,
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.08em',
            }}
          >
            <span>01</span>
            <span style={{ color: colors.gold }}>→</span>
            <span>02</span>
            <span style={{ color: colors.gold }}>→</span>
            <span>03</span>
            <span style={{ color: colors.gold }}>→</span>
            <span>04</span>
          </div>
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
                  padding: spacing.md,
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
                    lineHeight: 1.65,
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
          padding: `${spacing['2xl']} ${spacing.xl}`,
          textAlign: 'center',
          borderTop: `1px solid ${colors.lightGray}`,
        }}
      >
        <p
          style={{
            fontSize: typography.fontSize.sm,
            letterSpacing: '0.08em',
            color: colors.textSecondary,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
          }}
        >
          GIA-guided consultation · Personalized design · Clear timeline
        </p>
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
