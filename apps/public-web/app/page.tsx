'use client'

import { useState } from 'react'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from './constants/design'

export default function HomePage() {
  const [hoveredCTA, setHoveredCTA] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing['4xl']} ${spacing.xl}`,
        backgroundColor: colors.white,
        textAlign: 'center',
      }}>
        {/* Subtitle */}
        <div style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.normal,
          color: colors.gold,
          letterSpacing: '0.2em',
          marginBottom: spacing.lg,
          textTransform: 'uppercase',
        }}>
          Fine Pearl Jewelry
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: typography.fontSize['7xl'],
          fontWeight: typography.fontWeight.light,
          color: colors.darkGray,
          letterSpacing: '0.02em',
          marginBottom: spacing.xl,
          lineHeight: typography.lineHeight.tight,
          maxWidth: '900px',
        }}>
          33 Pearl Atelier
        </h1>

        {/* Description */}
        <p style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.normal,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
          marginBottom: spacing['3xl'],
          maxWidth: '600px',
          letterSpacing: '0.01em',
        }}>
          Handcrafted Pearl Jewelry Collection
          <br />
          Each piece is a unique work of art
        </p>

        {/* CTA Button */}
        <Link
          href="/products"
          onMouseEnter={() => setHoveredCTA(true)}
          onMouseLeave={() => setHoveredCTA(false)}
          style={{
            display: 'inline-block',
            padding: `${spacing.md} ${spacing['2xl']}`,
            backgroundColor: hoveredCTA ? colors.gold : colors.darkGray,
            color: colors.white,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            letterSpacing: '0.1em',
            textDecoration: 'none',
            transition: transitions.normal,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Explore Collection
        </Link>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: spacing.xl,
          fontSize: typography.fontSize.xs,
          color: colors.textLight,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Scroll to Discover
        </div>
      </section>

      {/* Featured Section */}
      <section style={{
        padding: `${spacing['4xl']} ${spacing.xl}`,
        backgroundColor: colors.pearl,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.light,
          color: colors.darkGray,
          marginBottom: spacing.xl,
          letterSpacing: '0.02em',
        }}>
          The Art of Pearls
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing['2xl'],
          maxWidth: '1200px',
          margin: '0 auto',
          marginTop: spacing['3xl'],
        }}>
          {/* Feature 1 */}
          <div style={{
            padding: spacing['2xl'],
          }}>
            <div style={{
              fontSize: typography.fontSize['3xl'],
              color: colors.gold,
              marginBottom: spacing.lg,
            }}>
              ✦
            </div>
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.md,
            }}>
              Selected Pearls
            </h3>
            <p style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
            }}>
              Carefully selected premium pearls from around the world
              <br />
              Each professionally certified
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            padding: spacing['2xl'],
          }}>
            <div style={{
              fontSize: typography.fontSize['3xl'],
              color: colors.gold,
              marginBottom: spacing.lg,
            }}>
              ✦
            </div>
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.md,
            }}>
              Handcrafted
            </h3>
            <p style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
            }}>
              Crafted by master artisans
              <br />
              Custom-made jewelry tailored for you
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            padding: spacing['2xl'],
          }}>
            <div style={{
              fontSize: typography.fontSize['3xl'],
              color: colors.gold,
              marginBottom: spacing.lg,
            }}>
              ✦
            </div>
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.md,
            }}>
              Timeless Quality
            </h3>
            <p style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
            }}>
              Premium materials and craftsmanship
              <br />
              Ensuring lasting beauty
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: `${spacing['4xl']} ${spacing.xl}`,
        backgroundColor: colors.white,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.light,
          color: colors.darkGray,
          marginBottom: spacing.lg,
          letterSpacing: '0.02em',
        }}>
          Begin Your Custom Journey
        </h2>
        <p style={{
          fontSize: typography.fontSize.lg,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
          marginBottom: spacing['2xl'],
          maxWidth: '600px',
          margin: `0 auto ${spacing['2xl']} auto`,
        }}>
          We offer complete customization services, from pearl selection to design,
          <br />
          every step is carefully crafted for you
        </p>
        <Link
          href="/custom-services"
          style={{
            display: 'inline-block',
            padding: `${spacing.md} ${spacing['2xl']}`,
            backgroundColor: 'transparent',
            color: colors.darkGray,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            letterSpacing: '0.1em',
            textDecoration: 'none',
            border: `1px solid ${colors.darkGray}`,
            transition: transitions.normal,
          }}
        >
          Learn About Custom Services
        </Link>
      </section>
    </div>
  )
}