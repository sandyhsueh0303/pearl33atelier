import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about 33 Pearl Atelier, our pearl sourcing standards, craftsmanship approach, and custom pearl jewelry philosophy.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  const unifiedCardStyle = {
    background: '#FFFFFF',
    border: `1px solid ${colors.lightGray}`,
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  }

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
    <main style={pageHeroStyles.main}>
      <PageHero
        eyebrow="About Us"
        title="33 Pearl Atelier"
        description="33 Pearl Atelier is dedicated to handcrafted pearl jewelry that blends quiet luxury, modern femininity, and artisanal precision."
      />

      <section
        className="founder-section"
        style={{
          padding: `clamp(1rem, 4vw, ${spacing['4xl']})`,
          backgroundColor: '#fcfbf8',
        }}
      >
        <div
          className="founder-grid"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: spacing['4xl'],
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            justifySelf: 'center',
            width: '100%',
            maxWidth: '360px',
            padding: '2.5%',
            background: 'rgba(201, 169, 97, 0.06)',
            borderRadius: '28px',
            overflow: 'hidden',
          }}>
            <img
              src="/images/sandy.png"
              alt="Sandy, Founder"
              style={{
                width: '100%',
                margin: '0 auto',
                borderRadius: '24px',
                display: 'block',
              }}
            />
          </div>

          <article
            className="founder-copy"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              maxWidth: '640px',
              margin: '0 auto',
              textAlign: 'left',
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
              FOUNDER
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: typography.fontWeight.normal,
                color: colors.darkGray,
                lineHeight: typography.lineHeight.tight,
                letterSpacing: '0.02em',
                marginBottom: spacing.xs,
              }}
            >
              From the Founder
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: colors.textSecondary,
                marginBottom: spacing.md,
              }}
            >
              GIA Certified Gemologist
            </p>
            <div
              style={{
                width: '72px',
                height: '2px',
                marginBottom: spacing.lg,
                background:
                  'linear-gradient(90deg, rgba(212, 175, 55, 0.85) 0%, rgba(212, 175, 55, 0.15) 100%)',
              }}
            />
            <p
              style={{
                fontSize: 'clamp(1.06rem, 1.8vw, 1.2rem)',
                fontWeight: typography.fontWeight.medium,
                color: colors.darkGray,
                lineHeight: 1.72,
                marginBottom: spacing.sm,
                maxWidth: '62ch',
              }}
            >
              I&apos;m Sandy, founder of 33 Pearl Atelier and a GIA Certified Gemologist.
            </p>
            <p
              style={{
                fontSize: 'clamp(1.03rem, 1.6vw, 1.14rem)',
                color: '#4a4338',
                lineHeight: 1.72,
                marginBottom: spacing.sm,
                maxWidth: '62ch',
              }}
            >
              I founded 33 Pearl Atelier to offer pearl jewelry that feels personal, wearable, and quietly refined. Every pearl is selected with attention to luster, proportion, and how it will live with the wearer over time.
            </p>
            <p
              style={{
                fontSize: 'clamp(1.03rem, 1.6vw, 1.14rem)',
                color: '#4a4338',
                lineHeight: 1.72,
                marginBottom: spacing.sm,
                maxWidth: '62ch',
              }}
            >
              Beyond technical grading, I focus on character, balance, and everyday elegance. My goal is to create pieces that feel timeless, modern, and easy to wear with confidence.
            </p>
          </article>
        </div>
      </section>
      <section
        style={{
          padding: `${spacing.sm} ${spacing.xl}`,
          background: '#fffdf9',
          borderTop: `1px solid ${colors.lightGray}`,
          borderBottom: `1px solid ${colors.lightGray}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
            maxWidth: '980px',
            margin: '0 auto',
            fontSize: typography.fontSize.base,
            color: colors.textSecondary,
            letterSpacing: '0.02em',
          }}
        >
          <span>✓ GIA Certified Gemologist</span>
          <span style={{ color: colors.gold }}>•</span>
          <span>✓ Pearl Grading Specialist</span>
          <span style={{ color: colors.gold }}>•</span>
          <span>✓ Curated Pearl Styling &amp; Design</span>
        </div>
      </section>

      <section
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0) 45%), linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%)',
          padding: `${spacing['3xl']} ${spacing.xl}`,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: colors.gold,
                marginBottom: spacing.sm,
              }}
            >
              Our Values
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: typography.fontWeight.normal,
                color: colors.darkGray,
                marginBottom: spacing.sm,
              }}
            >
              What We Value
            </h2>
            <p
              style={{
                maxWidth: '720px',
                margin: '0 auto',
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              The standards behind every piece we curate and create.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: spacing.lg,
            }}
          >
            {values.map((value) => (
              <article
                key={value.title}
                style={{
                  ...unifiedCardStyle,
                  padding: `${spacing.lg} ${spacing.lg}`,
                  textAlign: 'left',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  borderTop: '3px solid rgba(212, 175, 55, 0.55)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    background: 'rgba(212, 175, 55, 0.12)',
                    color: colors.darkGray,
                    marginBottom: spacing.md,
                  }}
                >
                  ✦
                </div>
                <h3
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.semibold,
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
                    lineHeight: 1.65,
                  }}
                >
                  {value.description}
                </p>
              </article>
            ))}
          </div>
          <p
            style={{
              maxWidth: '960px',
              margin: `${spacing.xl} auto 0`,
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: typography.fontSize.base,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            33 Pearl Atelier specializes in handcrafted pearl jewelry, offers one-on-one custom pearl design,
            and is led by a GIA certified gemologist to ensure trusted quality and refined craftsmanship.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
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
                marginBottom: spacing.sm,
              }}
            >
              We started in 2025 with one goal: create pearl jewelry that feels personal and wearable every day.
            </p>
            <ul
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                margin: 0,
                paddingLeft: spacing.md,
                display: 'grid',
                gap: spacing.xs,
              }}
            >
              <li>Pearls are selected from trusted sources for luster, harmony, and character.</li>
              <li>Each design is refined by hand from sourcing to final finish.</li>
              <li>We focus on pieces that move easily from special moments to everyday life.</li>
            </ul>
          </div>

          <div
            style={{
              ...unifiedCardStyle,
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
              We specialize in:
            </p>
            <ul
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                margin: 0,
                paddingLeft: spacing.md,
                display: 'grid',
                gap: spacing.xs,
              }}
            >
              <li>Custom pearl jewelry and one-on-one design guidance.</li>
              <li>Curated ready-to-wear pieces with balanced proportions.</li>
              <li>Material and finishing choices tailored to your personal style.</li>
            </ul>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['3xl']} ${spacing.xl}`,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F4EE 100%)',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: spacing['2xl'],
          }}
        >
          What Clients Say
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing.lg,
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              ...unifiedCardStyle,
              padding: spacing.lg,
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.base,
                fontStyle: 'italic',
                lineHeight: 1.55,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}
            >
              &quot;The attention to detail and quality is exceptional. My pearl necklace has become my everyday piece.&quot;
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.gold,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              — Emma L.
            </p>
          </div>

          <div
            style={{
              ...unifiedCardStyle,
              padding: spacing.lg,
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.base,
                fontStyle: 'italic',
                lineHeight: 1.55,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}
            >
              &quot;Sandy guided me through every step of the custom process. The final earrings are elegant and timeless.&quot;
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.gold,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              — Grace W.
            </p>
          </div>

          <div
            style={{
              ...unifiedCardStyle,
              padding: spacing.lg,
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.base,
                fontStyle: 'italic',
                lineHeight: 1.55,
                marginBottom: spacing.md,
                color: colors.textPrimary,
              }}
            >
              &quot;I love that each pearl is personally selected. You can really see the difference in luster and harmony.&quot;
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.gold,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              — Chloe T.
            </p>
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
