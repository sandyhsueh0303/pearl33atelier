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
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%)',
      }}>
        {/* Organic Blob Animations */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '1000px',
          height: '1000px',
          background: 'radial-gradient(circle, rgba(201, 169, 97, 0.7), rgba(201, 169, 97, 0.2))',
          filter: 'blur(80px)',
          opacity: 0.9,
          borderRadius: '70% 30% 20% 80% / 70% 20% 80% 30%',
          animation: 'morph-1 20s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '1000px',
          height: '1000px',
          background: 'radial-gradient(circle, rgba(250, 210, 190, 0.6), rgba(250, 225, 210, 0.25))',
          filter: 'blur(80px)',
          opacity: 0.7,
          borderRadius: '30% 70% 70% 30% / 70% 20% 80% 30%',
          animation: 'morph-2 25s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          opacity: 0.4,
          background: 'radial-gradient(circle, rgba(201, 169, 97, 0.35), rgba(201, 169, 97, 0.08))',
          filter: 'blur(40px)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Subtitle */}
          <div style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.gold,
            letterSpacing: '0.3em',
            marginBottom: spacing.xl,
            textTransform: 'uppercase',
          }}>
            Fine Pearl Jewelry
          </div>

          {/* Main Heading - Elegant Serif Font */}
          <h1 style={{
            fontSize: typography.fontSize['8xl'],
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
              backgroundColor: hoveredCTA ? '#C9A961' : 'rgba(201, 169, 97, 0.15)',
              color: hoveredCTA ? colors.white : colors.darkGray,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              letterSpacing: '0.15em',
              textDecoration: 'none',
              transition: transitions.normal,
              border: '2px solid #C9A961',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
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
          color: '#C9A961',
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

          @keyframes morph-1 {
            0%, 100% {
              border-radius: 70% 30% 20% 80% / 70% 20% 80% 30%;
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            25% {
              border-radius: 20% 80% 80% 20% / 30% 70% 20% 80%;
              transform: translate(50px, -60px) rotate(90deg) scale(1.2);
            }
            50% {
              border-radius: 80% 20% 30% 70% / 20% 80% 20% 80%;
              transform: translate(30px, -90px) rotate(180deg) scale(0.8);
            }
            75% {
              border-radius: 30% 70% 70% 30% / 80% 20% 60% 40%;
              transform: translate(-30px, -60px) rotate(270deg) scale(1.15);
            }
          }

          @keyframes morph-2 {
            0%, 100% {
              border-radius: 30% 70% 70% 30% / 70% 20% 80% 30%;
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            33% {
              border-radius: 70% 30% 20% 80% / 30% 70% 20% 80%;
              transform: translate(-50px, 50px) rotate(120deg) scale(1.18);
            }
            66% {
              border-radius: 20% 80% 60% 40% / 60% 40% 80% 20%;
              transform: translate(-60px, 30px) rotate(240deg) scale(0.85);
            }
          }
        `}</style>
      </section>

      {/* Intent Section */}
      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
          backgroundColor: '#FFFFFF',
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
              fontSize: typography.fontSize['5xl'],
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
              fontSize: typography.fontSize['5xl'],
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
              fontSize: typography.fontSize['5xl'],
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
            gridTemplateColumns: 'repeat(auto-fit, minmin(220px, 1fr))',
            gap: spacing.lg,
            textAlign: 'left',
          }}
        >
          <article
            style={{
              backgroundColor: colors.white,
              padding: spacing.lg,
              border: `1px solid ${colors.lightGray}`,
              transition: transitions.normal,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
              e.currentTarget.style.borderColor = colors.gold
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = colors.lightGray
            }}
          >
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
          <article
            style={{
              backgroundColor: colors.white,
              padding: spacing.lg,
              border: `1px solid ${colors.lightGray}`,
              transition: transitions.normal,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
              e.currentTarget.style.borderColor = colors.gold
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = colors.lightGray
            }}
          >
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
          <article
            style={{
              backgroundColor: colors.white,
              padding: spacing.lg,
              border: `1px solid ${colors.lightGray}`,
              transition: transitions.normal,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
              e.currentTarget.style.borderColor = colors.gold
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = colors.lightGray
            }}
          >
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
