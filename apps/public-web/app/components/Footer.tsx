import Link from 'next/link'
import { colors, typography, spacing } from '../constants/design'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${colors.lightGray}`,
        backgroundColor: '#faf8f3',
        marginTop: spacing['2xl'],
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: `${spacing.xl} ${spacing.lg}`,
          display: 'grid',
          gap: spacing.lg,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <div>
          <h3 style={{ fontSize: typography.fontSize.lg, color: colors.darkGray, marginBottom: spacing.xs }}>
            33 Pearl Atelier
          </h3>
          <p style={{ color: colors.textSecondary, lineHeight: typography.lineHeight.relaxed }}>
            Handcrafted pearl jewelry and custom pearl design services.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: typography.fontSize.base, color: colors.darkGray, marginBottom: spacing.xs }}>
            Policies
          </h3>
          <Link href="/faq" scroll style={{ color: colors.textSecondary, textDecoration: 'none' }}>
            Shipping, Returns, Care, and Timeline FAQ
          </Link>
        </div>

        <div>
          <h3 style={{ fontSize: typography.fontSize.base, color: colors.darkGray, marginBottom: spacing.xs }}>
            Primary Action
          </h3>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: `${spacing.xs} ${spacing.md}`,
              backgroundColor: colors.darkGray,
              color: colors.white,
              textDecoration: 'none',
              letterSpacing: '0.08em',
              border: `1px solid ${colors.darkGray}`,
            }}
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </footer>
  )
}
