'use client'

import Link from 'next/link'
import { colors, typography, spacing } from '../constants/design'

export default function Footer() {
  const handleWeChatClick = async () => {
    try {
      await navigator.clipboard.writeText('_33pearlatelier')
    } catch {
      // ignore
    }
    window.location.href = 'weixin://'
    window.setTimeout(() => {
      window.alert('WeChat ID copied: _33pearlatelier. Please paste it in WeChat search.')
    }, 250)
  }

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
            Connect Us
          </h3>
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <a
              href="https://www.instagram.com/33_pearl_atelier/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              style={{
                display: 'inline-flex',
                width: '36px',
                height: '36px',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '999px',
                color: colors.darkGray,
                textDecoration: 'none',
                backgroundColor: colors.white,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke={colors.darkGray} strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4" stroke={colors.darkGray} strokeWidth="1.8" />
                <circle cx="17.25" cy="6.75" r="1.1" fill={colors.darkGray} />
              </svg>
            </a>
            <button
              type="button"
              onClick={handleWeChatClick}
              aria-label="Open WeChat and search _33pearlatelier"
              style={{
                display: 'inline-flex',
                width: '36px',
                height: '36px',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '999px',
                color: colors.darkGray,
                backgroundColor: colors.white,
                cursor: 'pointer',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9.2 4.2C5.22 4.2 2 6.86 2 10.14c0 1.9 1.07 3.6 2.74 4.7l-.55 2.16 2.4-1.25c.85.2 1.72.3 2.61.3 3.98 0 7.2-2.66 7.2-5.91S13.18 4.2 9.2 4.2Z"
                  fill={colors.darkGray}
                />
                <path
                  d="M15.8 9.4c-3.43 0-6.2 2.2-6.2 4.92 0 1.58.94 3 2.4 3.94l-.42 1.74 1.95-1.01c.72.17 1.46.25 2.27.25 3.43 0 6.2-2.2 6.2-4.92 0-2.71-2.77-4.92-6.2-4.92Z"
                  fill={colors.darkGray}
                  opacity="0.78"
                />
                <circle cx="7.1" cy="9.95" r="0.95" fill={colors.white} />
                <circle cx="11.2" cy="9.95" r="0.95" fill={colors.white} />
                <circle cx="14.3" cy="14.1" r="0.85" fill={colors.white} />
                <circle cx="17.7" cy="14.1" r="0.85" fill={colors.white} />
              </svg>
            </button>
            <a
              href="mailto:33pearlatelier@gmail.com"
              aria-label="Email"
              style={{
                display: 'inline-flex',
                width: '36px',
                height: '36px',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '999px',
                color: colors.darkGray,
                textDecoration: 'none',
                backgroundColor: colors.white,
              }}
            >
              ✉️
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
