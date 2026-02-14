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
      {/* Hero Section with Ocean Background */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing['4xl']} ${spacing.xl}`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 50%), url('/images/ocean-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Subtitle */}
          <div style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            color: colors.gold,
            letterSpacing: '0.25em',
            marginBottom: spacing.xl,
            textTransform: 'uppercase',
          }}>
            Fine Pearl Jewelry
          </div>

          {/* Main Heading - Elegant Serif Font */}
          <h1 style={{
            fontSize: typography.fontSize['7xl'],
            fontFamily: typography.fontFamily.serif,
            fontWeight: typography.fontWeight.light,
            color: colors.darkGray,
            letterSpacing: '0.05em',
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
            maxWidth: '700px',
            letterSpacing: '0.02em',
            margin: `0 auto ${spacing['3xl']} auto`,
          }}>
            Handcrafted Pearl Jewelry Collection
            <br />
            <span style={{ 
              fontSize: typography.fontSize.lg,
              fontStyle: 'italic',
              opacity: 0.95
            }}>
              Each piece is a unique work of art
            </span>
          </p>

          {/* CTA Button */}
          <Link
            href="/products"
            onMouseEnter={() => setHoveredCTA(true)}
            onMouseLeave={() => setHoveredCTA(false)}
            style={{
              display: 'inline-block',
              padding: `${spacing.md} ${spacing['2xl']}`,
              backgroundColor: hoveredCTA ? 'rgba(212, 175, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              color: hoveredCTA ? colors.white : colors.darkGray,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              letterSpacing: '0.15em',
              textDecoration: 'none',
              transition: transitions.normal,
              border: hoveredCTA ? 'none' : `2px solid ${colors.white}`,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(4px)',
            }}
          >
            Explore Collection
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: spacing['2xl'],
          fontSize: typography.fontSize.xs,
          color: colors.textLight,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          zIndex: 1,
          animation: 'bounce 2s infinite',
        }}>
          <div style={{ marginBottom: spacing.xs }}>Scroll to Discover</div>
          <div style={{ 
            fontSize: typography.fontSize.lg,
            animation: 'bounce 2s infinite'
          }}>
            ↓
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </section>

      {/* Featured Section */}
      <section style={{
        padding: `${spacing['4xl']} ${spacing.xl}`,
        backgroundColor: colors.white,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: typography.fontSize['4xl'],
          fontFamily: typography.fontFamily.serif,
          fontWeight: typography.fontWeight.light,
          color: colors.darkGray,
          marginBottom: spacing.xl,
          letterSpacing: '0.03em',
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
            transition: transitions.normal,
          }}>
            <div style={{
              fontSize: typography.fontSize['4xl'],
              color: colors.gold,
              marginBottom: spacing.lg,
            }}>
              ✦
            </div>
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.darkGray,
              marginBottom: spacing.md,
              letterSpacing: '0.05em',
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
              <span style={{ fontStyle: 'italic' }}>Each professionally certified</span>
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            padding: spacing['2xl'],
            transition: transitions.normal,
          }}>
            <div style={{
              fontSize: typography.fontSize['4xl'],
              color: colors.gold,
              marginBottom: spacing.lg,
            }}>
              ✦
            </div>
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.darkGray,
              marginBottom: spacing.md,
              letterSpacing: '0.05em',
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
              <span style={{ fontStyle: 'italic' }}>Custom-made jewelry tailored for you</span>
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            padding: spacing['2xl'],
            transition: transitions.normal,
          }}>
            <div style={{
              fontSize: typography.fontSize['4xl'],
              color: colors.gold,
              marginBottom: spacing.lg,
            }}>
              ✦
            </div>
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.darkGray,
              marginBottom: spacing.md,
              letterSpacing: '0.05em',
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
              <span style={{ fontStyle: 'italic' }}>Ensuring lasting beauty</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: `${spacing['4xl']} ${spacing.xl}`,
        backgroundColor: colors.pearl,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: typography.fontSize['4xl'],
          fontFamily: typography.fontFamily.serif,
          fontWeight: typography.fontWeight.light,
          color: colors.darkGray,
          marginBottom: spacing.lg,
          letterSpacing: '0.03em',
        }}>
          Begin Your Custom Journey
        </h2>
        <p style={{
          fontSize: typography.fontSize.lg,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
          marginBottom: spacing['2xl'],
          maxWidth: '700px',
          margin: `0 auto ${spacing['2xl']} auto`,
        }}>
          We offer complete customization services, from pearl selection to design
          <br />
          <span style={{ fontStyle: 'italic' }}>Every step is carefully crafted for you</span>
        </p>
        <Link
          href="/custom-services"
          style={{
            display: 'inline-block',
            padding: `${spacing.md} ${spacing['2xl']}`,
            backgroundColor: 'transparent',
            color: colors.darkGray,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            letterSpacing: '0.15em',
            textDecoration: 'none',
            border: `2px solid ${colors.darkGray}`,
            transition: transitions.normal,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.darkGray
            e.currentTarget.style.color = colors.white
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = colors.darkGray
          }}
        >
          Learn About Custom Services
        </Link>
      </section>
    </div>
  )
}
