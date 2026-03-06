import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'

export const metadata: Metadata = {
  title: 'Pearl Care Guide',
  description:
    'Learn how to care for pearl jewelry with daily wear, storage, cleaning, and maintenance tips from 33 Pearl Atelier.',
}

export default function CareGuidePage() {
  const essentials = [
    {
      title: 'Last On, First Off',
      detail: 'Put on pearl jewelry after makeup, perfume, and hairspray. Remove pearls first before cleansing.',
    },
    {
      title: 'Avoid Chemicals',
      detail: 'Keep pearls away from acids, alcohol-based products, chlorine, and strong detergents.',
    },
    {
      title: 'Wipe After Wearing',
      detail: 'Use a soft, clean cloth to remove oils and moisture from skin contact after every wear.',
    },
  ]

  const dos = [
    'Wear pearls regularly; natural skin humidity helps maintain their glow.',
    'Store each piece separately to avoid scratches from metals or gemstones.',
    'Use a soft pouch or lined jewelry box compartment for daily storage.',
    'Restring frequently worn pearl strands every 1-2 years.',
  ]

  const donts = [
    'Do not soak pearls in water, soap, vinegar, or ultrasonic cleaners.',
    'Do not use abrasive cloths, toothpaste, or polishing compounds.',
    'Do not store pearls in airtight plastic bags for long periods.',
    'Do not tug strand necklaces by one side when removing them.',
  ]

  return (
    <main style={pageHeroStyles.main}>
      <PageHero
        eyebrow="Care Guide"
        title="Keep Your Pearls Luminous"
        description="Pearls are organic and delicate. With consistent, gentle care, they retain their glow and elegance for many years."
      />

      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
          background: colors.white,
        }}
      >
        <div style={{ maxWidth: '1100px', margin: `0 auto ${spacing.xl}` }}>
          <p
            style={{
              textAlign: 'center',
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: spacing.xs,
            }}
          >
            Everyday Essentials
          </p>
          <h2
            style={{
              textAlign: 'center',
              fontSize: typography.fontSize['3xl'],
              color: colors.darkGray,
              marginBottom: spacing.sm,
            }}
          >
            Daily Habits That Protect Pearl Luster
          </h2>
        </div>
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: spacing.lg,
          }}
        >
          {essentials.map((item) => (
            <article
              key={item.title}
              style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.lightGray}`,
                borderTop: '3px solid rgba(212, 175, 55, 0.55)',
                borderRadius: '12px',
                padding: spacing.lg,
                boxShadow: '0 6px 16px rgba(24, 24, 24, 0.05)',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: '28px',
                  height: '28px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(212, 175, 55, 0.16)',
                  color: colors.darkGray,
                  fontSize: typography.fontSize.sm,
                  marginBottom: spacing.sm,
                }}
              >
                ✓
              </span>
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.darkGray,
                  marginBottom: spacing.sm,
                }}
              >
                {item.title}
              </h2>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
          background:
            'linear-gradient(180deg, #ffffff 0%, #fcfaf6 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing['2xl'],
            alignItems: 'start',
          }}
        >
          <article
            style={{
              backgroundColor: '#fff',
              border: `1px solid #d8ead8`,
              borderRadius: '12px',
              borderLeft: '4px solid #4b7f54',
              padding: spacing.lg,
              boxShadow: '0 6px 16px rgba(24, 24, 24, 0.04)',
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                color: '#2f5a37',
                marginBottom: spacing.md,
              }}
            >
              Do
            </h3>
            <ul style={{ paddingLeft: '1.25rem', color: colors.textSecondary, lineHeight: 1.9 }}>
              {dos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article
            style={{
              backgroundColor: '#fff',
              border: `1px solid #efd7d4`,
              borderRadius: '12px',
              borderLeft: '4px solid #9a3d37',
              padding: spacing.lg,
              boxShadow: '0 6px 16px rgba(24, 24, 24, 0.04)',
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                color: '#8a332e',
                marginBottom: spacing.md,
              }}
            >
              Don&apos;t
            </h3>
            <ul style={{ paddingLeft: '1.25rem', color: colors.textSecondary, lineHeight: 1.9 }}>
              {donts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section style={{ padding: `${spacing['2xl']} ${spacing.xl}`, textAlign: 'center' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: typography.fontSize['3xl'],
              color: colors.darkGray,
              marginBottom: spacing.md,
            }}
          >
            Cleaning & Maintenance
          </h2>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
              marginBottom: spacing.md,
            }}
          >
            For deeper maintenance, wipe pearls gently with a cloth slightly dampened with clean water.
            Then lay flat to air dry completely before storing.
          </p>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            If your strand feels loose or shows stretching between knots, schedule restringing to prevent loss.
          </p>
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
        <h2
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.normal,
            color: colors.darkGray,
            marginBottom: spacing.md,
          }}
        >
          Need Personal Care Advice?
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          Contact us with your piece details and we&apos;ll recommend the best care approach.
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
          <a
            href="https://www.instagram.com/33_pearl_atelier/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              backgroundColor: colors.white,
              color: colors.darkGray,
              textDecoration: 'none',
              border: `1px solid ${colors.darkGray}`,
              letterSpacing: '0.06em',
              transition: transitions.fast,
            }}
          >
            Instagram
          </a>
          <a
            href="weixin://"
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              backgroundColor: colors.white,
              color: colors.darkGray,
              textDecoration: 'none',
              border: `1px solid ${colors.darkGray}`,
              letterSpacing: '0.06em',
              transition: transitions.fast,
            }}
          >
            WeChat
          </a>
        </div>
        <p
          style={{
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
          }}
        >
          WeChat ID: <strong>_33pearlatelier</strong>
        </p>
        <p style={{ marginTop: spacing.sm }}>
          <Link href="/faq#daily-care" style={{ color: colors.textSecondary }}>
            Need quick answers? Read care FAQ.
          </Link>
        </p>
      </section>
    </main>
  )
}
