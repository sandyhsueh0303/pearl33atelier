import type { Metadata } from 'next'
import Link from 'next/link'
import { colors, typography, spacing } from '../constants/design'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact 33 Pearl Atelier for handcrafted pearl jewelry, custom pearl design inquiries, timeline planning, and product guidance.',
}

export default function ContactPage() {
  return (
    <main style={{ backgroundColor: colors.white }}>
      <section
        style={{
          padding: `${spacing['4xl']} ${spacing.xl} ${spacing['3xl']}`,
          background: 'linear-gradient(180deg, #f7f4ee 0%, #ffffff 100%)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: spacing.sm,
            }}
          >
            Contact
          </p>
          <h1 style={{ fontSize: 'clamp(2.1rem, 6vw, 4rem)', color: colors.darkGray, marginBottom: spacing.md }}>
            Start Your Inquiry
          </h1>
          <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed }}>
            Share your pearl type preference, budget range, occasion, and preferred timeline. We will reply with
            clear next steps for collection purchase or custom design.
          </p>
        </div>
      </section>

      <section style={{ padding: `${spacing['2xl']} ${spacing.xl} ${spacing['4xl']}` }}>
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            border: `1px solid ${colors.lightGray}`,
            backgroundColor: '#fcfbf8',
            borderRadius: '10px',
            padding: spacing.xl,
          }}
        >
          <h2 style={{ fontSize: typography.fontSize['2xl'], color: colors.darkGray, marginBottom: spacing.sm }}>
            What to include
          </h2>
          <ul style={{ color: colors.textSecondary, lineHeight: 1.9, paddingLeft: '1.2rem', marginBottom: spacing.lg }}>
            <li>Product style (necklace, earrings, bracelet, ring)</li>
            <li>Pearl type preference (Akoya, South Sea, Tahitian, Freshwater)</li>
            <li>Budget range and deadline</li>
            <li>Reference photos or inspiration</li>
          </ul>
          <div style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed, marginBottom: spacing.lg }}>
            <p style={{ marginBottom: spacing.xs }}>We offer 3 ways to connect:</p>
            <p style={{ marginBottom: spacing.xs }}>
              Instagram: <a href="https://instagram.com/33_pearl_atelier" target="_blank" rel="noreferrer">@33_pearl_atelier</a>
            </p>
            <p style={{ marginBottom: spacing.xs }}>WeChat: _33pearlatelier</p>
            <p>
              Email: <a href="mailto:33pearlatelier@gmail.com">33pearlatelier@gmail.com</a>
            </p>
          </div>
          <Link
            href="/custom-services"
            style={{
              display: 'inline-block',
              padding: `${spacing.xs} ${spacing.md}`,
              backgroundColor: colors.darkGray,
              color: colors.white,
              textDecoration: 'none',
              border: `1px solid ${colors.darkGray}`,
              letterSpacing: '0.08em',
            }}
          >
            Start Custom Inquiry
          </Link>
        </div>
      </section>
    </main>
  )
}
