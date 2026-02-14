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
            Shop Collection
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

      {/* Intent Section */}
      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
          backgroundColor: '#f8f6f1',
          borderTop: `1px solid ${colors.lightGray}`,
          borderBottom: `1px solid ${colors.lightGray}`,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: typography.fontSize['3xl'],
              color: colors.darkGray,
              marginBottom: spacing.md,
              lineHeight: typography.lineHeight.tight,
            }}
          >
            Pearls Chosen With Intention, Crafted for Everyday Elegance
          </h2>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
              maxWidth: '760px',
              margin: `0 auto ${spacing.lg}`,
            }}
          >
            Handcrafted pearl jewelry and custom pearl design services.
            Explore ready-to-wear pieces, request custom work, and learn through our pearl guides.
          </p>
          <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/products"
              style={{
                display: 'inline-block',
                padding: `${spacing.xs} ${spacing.lg}`,
                backgroundColor: colors.darkGray,
                color: colors.white,
                textDecoration: 'none',
                border: `1px solid ${colors.darkGray}`,
                letterSpacing: '0.08em',
                transition: transitions.fast,
              }}
            >
              Shop Collection
            </Link>
          </div>
          <p style={{ marginTop: spacing.sm }}>
            <Link href="/custom-services" style={{ color: colors.textSecondary }}>
              Need a bespoke piece? Start custom inquiry.
            </Link>
          </p>
        </div>
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
        <p
          style={{
            marginTop: spacing.sm,
            textAlign: 'center',
            color: colors.textSecondary,
            letterSpacing: '0.06em',
            fontSize: typography.fontSize.sm,
          }}
        >
          GIA Certified Gemologist · Curated Pearl Selection · Custom Design Available
        </p>

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
              Selected with Intention
            </h3>
            <p style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
            }}>
              Each pearl is chosen for its individual glow, shape, and character -
              <br />
              not just by grade, but by how it feels when worn.
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
              Crafted for Everyday Elegance
            </h3>
            <p style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
            }}>
              Designed to be part of your daily rhythm,
              <br />
              not only for special occasions but for quiet moments too.
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
              Made to Age Beautifully
            </h3>
            <p style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
            }}>
              Fine materials and thoughtful craftsmanship
              <br />
              allow each piece to evolve with you over time.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: `${spacing['3xl']} ${spacing.xl}`,
          borderTop: `1px solid ${colors.lightGray}`,
          borderBottom: `1px solid ${colors.lightGray}`,
          backgroundColor: '#fffdf9',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: typography.fontSize['3xl'], color: colors.darkGray, marginBottom: spacing.sm, textAlign: 'center' }}>
            Customer Care & FAQ
          </h2>
          <p style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }}>
            Answers and guidance to help you choose with confidence.
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/faq"
              style={{
                display: 'inline-block',
                border: `1px solid ${colors.darkGray}`,
                padding: `${spacing.xs} ${spacing.lg}`,
                color: colors.darkGray,
                textDecoration: 'none',
                letterSpacing: '0.08em',
              }}
            >
              View FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* Journal Section */}
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
          From the Journal
        </h2>
        <p style={{
          fontSize: typography.fontSize.lg,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
          marginBottom: spacing['2xl'],
          maxWidth: '700px',
          margin: `0 auto ${spacing['2xl']} auto`,
        }}>
          Discover pearl stories, care tips, and thoughtful buying guides -
          a space to explore and understand pearls beyond the surface.
        </p>

        <div
          style={{
            maxWidth: '1100px',
            margin: `0 auto ${spacing['2xl']}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: spacing.lg,
            textAlign: 'left',
          }}
        >
          <article style={{ backgroundColor: colors.white, padding: spacing.lg, border: `1px solid ${colors.lightGray}` }}>
            <h3 style={{ fontSize: typography.fontSize.xl, color: colors.darkGray, marginBottom: spacing.xs }}>
              Pearl Types Guide
            </h3>
            <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed, marginBottom: spacing.sm }}>
              Understand the subtle differences between Akoya, South Sea, Tahitian, and Freshwater pearls.
            </p>
            <Link href="/blog/pearl-types-guide" style={{ color: colors.darkGray, textDecoration: 'underline' }}>
              Read Article
            </Link>
          </article>
          <article style={{ backgroundColor: colors.white, padding: spacing.lg, border: `1px solid ${colors.lightGray}` }}>
            <h3 style={{ fontSize: typography.fontSize.xl, color: colors.darkGray, marginBottom: spacing.xs }}>
              Daily Pearl Care
            </h3>
            <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed, marginBottom: spacing.sm }}>
              Simple habits to keep your pearl jewelry luminous and beautifully maintained.
            </p>
            <Link href="/blog/how-to-care-for-pearl-jewelry-daily" style={{ color: colors.darkGray, textDecoration: 'underline' }}>
              Read Article
            </Link>
          </article>
          <article style={{ backgroundColor: colors.white, padding: spacing.lg, border: `1px solid ${colors.lightGray}` }}>
            <h3 style={{ fontSize: typography.fontSize.xl, color: colors.darkGray, marginBottom: spacing.xs }}>
              Pearl Quality Factors
            </h3>
            <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed, marginBottom: spacing.sm }}>
              Learn how luster, shape, surface, and overtone influence a pearl's beauty and character.
            </p>
            <Link href="/blog/pearl-quality-factors-shape-luster-surface-color-overtone" style={{ color: colors.darkGray, textDecoration: 'underline' }}>
              Read Article
            </Link>
          </article>
        </div>

        <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-block',
              padding: `${spacing.md} ${spacing['2xl']}`,
              backgroundColor: colors.darkGray,
              color: colors.white,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              letterSpacing: '0.1em',
              textDecoration: 'none',
              border: `1px solid ${colors.darkGray}`,
              transition: transitions.normal,
            }}
          >
            View All Journal Posts
          </Link>
        </div>
      </section>
    </div>
  )
}
