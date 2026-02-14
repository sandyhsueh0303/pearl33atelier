import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'

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
    <main style={{ backgroundColor: colors.white }}>
      <section
        style={{
          padding: `${spacing['4xl']} ${spacing.xl} ${spacing['3xl']}`,
          background: 'linear-gradient(180deg, #f7f5ef 0%, #ffffff 100%)',
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
            Care Guide
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
            Keep Your Pearls Luminous
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
            Pearls are organic and delicate. With consistent, gentle care, they retain their glow
            and elegance for many years.
          </p>
        </div>
      </section>

      <section style={{ padding: `${spacing['3xl']} ${spacing.xl}` }}>
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
                borderRadius: '10px',
                padding: spacing.lg,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
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
          padding: `${spacing['2xl']} ${spacing.xl} ${spacing['4xl']}`,
          backgroundColor: '#fcfbf8',
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
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '10px',
              padding: spacing.lg,
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                color: colors.darkGray,
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
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '10px',
              padding: spacing.lg,
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                color: colors.darkGray,
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

      <section style={{ padding: `${spacing['3xl']} ${spacing.xl}`, textAlign: 'center' }}>
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
            For deeper maintenance, wipe pearls gently with a cloth slightly dampened with clean water,
            then lay flat to air dry completely before storing.
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
          <Link
            href="/products"
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
            View Collection
          </Link>
        </div>
      </section>
    </main>
  )
}
