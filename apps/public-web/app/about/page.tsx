import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about 33 Pearl Atelier, our pearl sourcing standards, craftsmanship approach, and custom pearl jewelry philosophy.',
}

export default function AboutPage() {
  const values = [
    {
      title: 'Pearl Selection',
      description: 'We hand-select pearls for luster, surface quality, and shape harmony before design begins.',
    },
    {
      title: 'Craftsmanship',
      description: 'Every piece is finished with careful handwork to balance elegance, comfort, and long-term wear.',
    },
    {
      title: 'Timeless Design',
      description: 'We create refined silhouettes that feel contemporary today and remain beautiful for years.',
    },
  ]

  return (
    <main style={{ backgroundColor: colors.white }}>
      <section
        style={{
          padding: `${spacing['4xl']} ${spacing.xl} ${spacing['3xl']}`,
          background: 'linear-gradient(180deg, #f9f7f1 0%, #ffffff 100%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: spacing.md,
            }}
          >
            About Us
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 7vw, 4.4rem)',
              fontWeight: typography.fontWeight.normal,
              lineHeight: typography.lineHeight.tight,
              letterSpacing: '0.03em',
              color: colors.darkGray,
              marginBottom: spacing.lg,
            }}
          >
            33 Pearl Atelier
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
            33 Pearl Atelier is dedicated to handcrafted pearl jewelry that blends quiet luxury,
            modern femininity, and artisanal precision.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['3xl']} ${spacing.xl}`,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing['2xl'],
            alignItems: 'start',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.normal,
                letterSpacing: '0.02em',
                color: colors.darkGray,
                marginBottom: spacing.md,
              }}
            >
              Our Story
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.md,
              }}
            >
              What started as a passion for exceptional pearls became a studio focused on thoughtful,
              wearable pieces with character.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              From sourcing to final polish, each design is treated as a small work of art,
              created to celebrate personal style and meaningful moments.
            </p>
          </div>

          <div
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
                fontWeight: typography.fontWeight.medium,
                color: colors.darkGray,
                marginBottom: spacing.md,
              }}
            >
              Studio Focus
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.sm,
              }}
            >
              Custom pearl jewelry, curated ready-to-wear pieces, and one-on-one design consultation.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              We work closely with each client to ensure proportion, material choices, and finishing details
              feel distinctly personal.
            </p>
          </div>
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
            gridTemplateColumns: 'minmax(260px, 360px) 1fr',
            gap: spacing['2xl'],
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '10px',
              padding: spacing.sm,
            }}
          >
            <img
              src="/images/founder.jpg"
              alt="Sandy, founder of 33 Pearl Atelier and certified pearl appraiser"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                display: 'block',
              }}
            />
          </div>

          <article>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: colors.gold,
                marginBottom: spacing.xs,
              }}
            >
              Founder
            </p>
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                color: colors.darkGray,
                marginBottom: spacing.md,
              }}
            >
              From the Founder
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.sm,
              }}
            >
              I&apos;m Sandy, the founder of 33 Pearl Atelier and a certified pearl appraiser.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.sm,
              }}
            >
              My journey with pearls began with a simple fascination - their soft glow, quiet elegance,
              and the fact that no two are ever the same.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.sm,
              }}
            >
              Before founding 33 Pearl Atelier, I studied gemology and pearl grading, which shaped my approach to selecting pearls meant to be worn and loved.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.sm,
              }}
            >
              <strong>Every pearl you see at 33 Pearl Atelier is hand-selected by me.</strong> I look beyond measurements and
              grades - I pay attention to how it reflects light, how it sits against the skin, and how it feels
              as part of everyday life.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              My hope is to offer more than fine jewelry - to share a sense of confidence and refined beauty
              you can carry every day.
            </p>
          </article>
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
              fontWeight: typography.fontWeight.normal,
              color: colors.darkGray,
              textAlign: 'center',
              marginBottom: spacing['2xl'],
            }}
          >
            What We Value
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: spacing.lg,
            }}
          >
            {values.map((value) => (
              <article
                key={value.title}
                style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '10px',
                  padding: spacing.lg,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <h3
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.darkGray,
                    marginBottom: spacing.sm,
                  }}
                >
                  {value.title}
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.textSecondary,
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  {value.description}
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
          Discover The Collection
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.textSecondary,
            lineHeight: typography.lineHeight.relaxed,
            marginBottom: spacing.xl,
            maxWidth: '620px',
            margin: `0 auto ${spacing.xl}`,
          }}
        >
          Explore handcrafted pieces or start a custom design journey with us.
        </p>
        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/products"
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              backgroundColor: colors.darkGray,
              color: colors.white,
              textDecoration: 'none',
              border: `1px solid ${colors.darkGray}`,
              transition: transitions.fast,
              letterSpacing: '0.08em',
            }}
          >
            Shop Collection
          </Link>
        </div>
        <p style={{ marginTop: spacing.sm }}>
          <Link href="/custom-services" style={{ color: colors.textSecondary }}>
            Looking for bespoke work? Start custom inquiry.
          </Link>
        </p>
      </section>
    </main>
  )
}
