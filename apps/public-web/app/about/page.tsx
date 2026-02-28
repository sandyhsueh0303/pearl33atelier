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
    <main
      style={{
        background: 'linear-gradient(180deg, #fffdf8 0%, #ffffff 32%, #faf7f1 100%)',
      }}
    >
      <section
        style={{
          padding: `${spacing['4xl']} ${spacing.xl} ${spacing['3xl']}`,
          background: 'linear-gradient(180deg, #f2e9da 0%, #ffffff 100%)',
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
              fontSize: 'clamp(2.2rem, 6.5vw, 4rem)',
              fontWeight: typography.fontWeight.normal,
              lineHeight: typography.lineHeight.tight,
              letterSpacing: '0.03em',
              color: colors.darkGray,
              marginBottom: spacing.lg,
              textShadow: '0 6px 16px rgba(212, 175, 55, 0.14)',
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
          <div
            style={{
              width: '96px',
              height: '2px',
              margin: `${spacing.lg} auto 0`,
              background:
                'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.85) 50%, rgba(212, 175, 55, 0.08) 100%)',
            }}
          />
        </div>
      </section>

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
                marginBottom: spacing.lg,
              }}
            >
              From the Founder
            </h2>
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
              I&apos;m Sandy — founder of 33 Pearl Atelier and certified pearl appraiser.
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
              My fascination with pearls began with their quiet elegance and the simple truth that no two are ever alike.
              After studying gemology and pearl grading, I founded 33 Pearl Atelier to share pearls that feel personal,
              wearable, and timeless.
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
              Every pearl here is hand-selected by me. Beyond measurements and grades, I focus on how each pearl catches light,
              sits against skin, and becomes part of daily life.
            </p>
            <p
              style={{
                fontSize: 'clamp(1.03rem, 1.6vw, 1.14rem)',
                color: '#4a4338',
                lineHeight: 1.72,
                maxWidth: '62ch',
              }}
            >
              My goal isn&apos;t just to create fine jewelry — it&apos;s to offer pieces that bring confidence and refined
              beauty to your everyday.
            </p>
          </article>
        </div>
      </section>
      <section
        style={{
          textAlign: 'center',
          padding: `${spacing['3xl']} ${spacing.xl}`,
          background: '#FAFAF8',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            marginBottom: spacing['2xl'],
          }}
        >
          Certifications & Expertise
        </h2>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md,
            maxWidth: '600px',
            margin: '0 auto',
            fontSize: typography.fontSize.lg,
          }}
        >
          <div>✓ GIA Certified Gemologist</div>
          <div>✓ Pearl Grading Specialist</div>
          <div>✓ Curated Pearl Styling & Design</div>
        </div>
      </section>

      <section
        style={{
          background: 'linear-gradient(180deg, #FAFAF8 0%, #FFFFFF 100%)',
          padding: `${spacing['4xl']} ${spacing.xl}`,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: typography.fontWeight.normal,
              color: colors.darkGray,
              marginBottom: spacing['3xl'],
            }}
          >
            What We Value
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: spacing['2xl'],
            }}
          >
            {values.map((value) => (
              <article
                key={value.title}
                style={{
                  background: '#F8F6F0',
                  padding: spacing.xl,
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                }}
              >
                <div
                  style={{
                    fontSize: '3rem',
                    marginBottom: spacing.lg,
                  }}
                >
                  ✦
                </div>
                <h3
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.darkGray,
                    marginBottom: spacing.md,
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
              What started as a passion for exceptional pearls in 2025 became a studio dedicated to creating jewelry that tells a story.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.md,
              }}
            >
              Every piece begins with careful pearl selection from trusted sources worldwide. From sourcing to final polish,
              we treat each design as a small work of art — created to celebrate your personal style and life&apos;s meaningful moments.
            </p>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              We believe pearls aren&apos;t just for special occasions. They&apos;re for every day, every moment, every you.
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
          padding: `${spacing['4xl']} ${spacing.xl}`,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F4EE 100%)',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: spacing['3xl'],
          }}
        >
          What Clients Say
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing['2xl'],
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              padding: spacing.xl,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.base,
                fontStyle: 'italic',
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.lg,
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
              padding: spacing.xl,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.base,
                fontStyle: 'italic',
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.lg,
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
              padding: spacing.xl,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.base,
                fontStyle: 'italic',
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing.lg,
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
