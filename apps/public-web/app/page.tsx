import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing, transitions } from './constants/design'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing['3xl']} ${spacing.xl}`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%)',
      }}>
        {/* Organic Blob Animations */}
        <div
          className="homeBlobOne"
          style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(201, 169, 97, 0.7), rgba(201, 169, 97, 0.2))',
          opacity: 0.9,
          borderRadius: '70% 30% 20% 80% / 70% 20% 80% 30%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        />
        
        <div
          className="homeBlobTwo"
          style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(250, 210, 190, 0.6), rgba(250, 225, 210, 0.25))',
          opacity: 0.7,
          borderRadius: '30% 70% 70% 30% / 70% 20% 80% 30%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        />

        <div
          className="homeBlobCenter"
          style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.4,
          background: 'radial-gradient(circle, rgba(201, 169, 97, 0.35), rgba(201, 169, 97, 0.08))',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        />

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
            prefetch
            className="heroCta"
            style={{
              display: 'inline-block',
              padding: `${spacing.md} ${spacing['2xl']}`,
              backgroundColor: 'rgba(201, 169, 97, 0.15)',
              color: colors.darkGray,
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
        <div
          className="homeScrollIndicator"
          style={{
          position: 'absolute',
          bottom: spacing['2xl'],
          fontSize: typography.fontSize.xs,
          color: '#C9A961',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          zIndex: 1,
        }}
        >
          <div style={{ marginBottom: spacing.xs }}>Scroll to Discover</div>
          <div
            className="homeScrollArrow"
            style={{ fontSize: typography.fontSize.lg }}
          >
            ↓
          </div>
        </div>
      </section>

      {/* Trust Signal Bar */}
      <section
        style={{
          padding: `${spacing.sm} ${spacing.xl}`,
          borderTop: `1px solid ${colors.lightGray}`,
          borderBottom: `1px solid ${colors.lightGray}`,
          backgroundColor: '#fffdf9',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.md,
            flexWrap: 'wrap',
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
            letterSpacing: '0.03em',
          }}
        >
          <span>GIA Certified Gemologist</span>
          <span style={{ color: colors.gold }}>•</span>
          <span>Restringing &amp; Selected Repairs</span>
          <span style={{ color: colors.gold }}>•</span>
          <span>Personalized Consultation</span>
        </div>
      </section>

      {/* Intent Section */}
      <section
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
          background: 'linear-gradient(180deg, #fffefc 0%, #fbf8f2 100%)',
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
          <p style={{ marginTop: spacing.xs }}>
            <Link
              href="/custom-services"
              style={{
                display: 'inline-block',
                border: `1px solid ${colors.darkGray}`,
                padding: `${spacing.xs} ${spacing.lg}`,
                color: colors.darkGray,
                textDecoration: 'none',
                letterSpacing: '0.08em',
              }}
            >
              Start Custom Inquiry
            </Link>
          </p>
        </div>
      </section>

      {/* Featured Section */}
      <section style={{
        padding: `${spacing['3xl']} ${spacing.xl}`,
        background: 'linear-gradient(180deg, #ffffff 0%, #fdfbf7 100%)',
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['4xl'],
            fontFamily: typography.fontFamily.serif,
            fontWeight: typography.fontWeight.light,
            color: colors.darkGray,
            marginBottom: spacing.sm,
            letterSpacing: '0.03em',
            textAlign: 'center',
          }}>
            Before You Order
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: colors.textSecondary,
              marginBottom: spacing['2xl'],
            }}
          >
            The most important details customers ask before purchasing.
          </p>

          <div
            style={{
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '14px',
              backgroundColor: '#fff',
              boxShadow: '0 12px 28px rgba(44, 44, 44, 0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: `${spacing.lg} ${spacing.lg}`, borderBottom: `1px solid ${colors.lightGray}`, borderLeft: '3px solid #d4af37' }}>
              <h3 style={{ color: colors.darkGray, marginBottom: spacing.xs }}>How Ordering Works</h3>
              <ul
                style={{
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                  margin: 0,
                  paddingLeft: spacing.md,
                }}
              >
                <li>Ready-to-wear: choose from available pieces in the collection.</li>
                <li>Custom: request a tailored design based on your style and budget.</li>
              </ul>
            </div>

            <div style={{ padding: `${spacing.lg} ${spacing.lg}`, borderBottom: `1px solid ${colors.lightGray}`, borderLeft: '3px solid #d4af37' }}>
              <h3 style={{ color: colors.darkGray, marginBottom: spacing.xs }}>Production & Timeline</h3>
              <ul
                style={{
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                  margin: 0,
                  paddingLeft: spacing.md,
                }}
              >
                <li>In-stock: ships quickly after order confirmation.</li>
                <li>Custom lead time: usually 2-6 weeks depending on complexity.</li>
              </ul>
            </div>

            <div style={{ padding: `${spacing.lg} ${spacing.lg}`, borderBottom: `1px solid ${colors.lightGray}`, borderLeft: '3px solid #d4af37' }}>
              <h3 style={{ color: colors.darkGray, marginBottom: spacing.xs }}>Aftercare & Support</h3>
              <ul
                style={{
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                  margin: 0,
                  paddingLeft: spacing.md,
                }}
              >
                <li>Restringing service for pearl jewelry purchased from us.</li>
                <li>Selected repair services available after purchase.</li>
              </ul>
            </div>

            <div
              style={{
                padding: `${spacing.lg} ${spacing.lg}`,
                display: 'flex',
                gap: spacing.lg,
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              }}
            >
              <p
                style={{
                  color: colors.textSecondary,
                  marginBottom: 0,
                  lineHeight: typography.lineHeight.relaxed,
                  flex: '1 1 560px',
                }}
              >
                Contact us when you want help choosing between ready-to-wear options, need custom design advice,
                or have timeline and aftercare questions before placing your order.
              </p>
              <Link
                href="/contact"
                style={{
                  display: 'inline-block',
                  border: `1px solid ${colors.darkGray}`,
                  padding: `${spacing.xs} ${spacing.lg}`,
                  color: colors.darkGray,
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  marginLeft: 'auto',
                }}
              >
                Contact Us
              </Link>
            </div>
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
        padding: `${spacing['3xl']} ${spacing.xl}`,
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
          <Link
            href="/blog/pearl-types-guide"
            className="journalCardLink"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              height: '100%',
            }}
          >
            <article
              className="journalCard"
              style={{
                backgroundColor: colors.white,
                padding: spacing.lg,
                border: `1px solid ${colors.lightGray}`,
                transition: transitions.normal,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{ fontSize: typography.fontSize.xl, color: colors.darkGray, marginBottom: spacing.xs }}>
                Pearl Types Guide
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed, marginBottom: spacing.sm }}>
                Understand the subtle differences between Akoya, South Sea, Tahitian, and Freshwater pearls.
              </p>
              <span
                className="journalCardCta"
                style={{ color: colors.darkGray, textDecoration: 'underline', alignSelf: 'flex-end', marginTop: 'auto' }}
              >
                Read Guide →
              </span>
            </article>
          </Link>

          <Link
            href="/blog/how-to-care-for-pearl-jewelry-daily"
            className="journalCardLink"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              height: '100%',
            }}
          >
            <article
              className="journalCard"
              style={{
                backgroundColor: colors.white,
                padding: spacing.lg,
                border: `1px solid ${colors.lightGray}`,
                transition: transitions.normal,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{ fontSize: typography.fontSize.xl, color: colors.darkGray, marginBottom: spacing.xs }}>
                Daily Pearl Care
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed, marginBottom: spacing.sm }}>
                Simple habits to keep your pearl jewelry luminous and beautifully maintained.
              </p>
              <span
                className="journalCardCta"
                style={{ color: colors.darkGray, textDecoration: 'underline', alignSelf: 'flex-end', marginTop: 'auto' }}
              >
                Read Journal →
              </span>
            </article>
          </Link>

          <Link
            href="/blog/pearl-quality-factors-shape-luster-surface-color-overtone"
            className="journalCardLink"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              height: '100%',
            }}
          >
            <article
              className="journalCard"
              style={{
                backgroundColor: colors.white,
                padding: spacing.lg,
                border: `1px solid ${colors.lightGray}`,
                transition: transitions.normal,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{ fontSize: typography.fontSize.xl, color: colors.darkGray, marginBottom: spacing.xs }}>
                Pearl Quality Factors
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed, marginBottom: spacing.sm }}>
                Learn how luster, shape, surface, and overtone influence a pearl's beauty and character.
              </p>
              <span
                className="journalCardCta"
                style={{ color: colors.darkGray, textDecoration: 'underline', alignSelf: 'flex-end', marginTop: 'auto' }}
              >
                Read Guide →
              </span>
            </article>
          </Link>
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
