import { colors, typography, spacing } from '../constants/design'

export default function Footer() {
  return (
    <footer
      style={{
        padding: `${spacing.xl} ${spacing.lg}`,
        backgroundColor: colors.darkGray,
        color: colors.white,
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: typography.fontSize.base, margin: 0 }}>
        © 2026 33 Pearl Atelier. All rights reserved.
      </p>
      <div
        style={{
          marginTop: spacing.sm,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.sm,
          flexWrap: 'wrap',
        }}
      >
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
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '999px',
            color: colors.white,
            textDecoration: 'none',
            backgroundColor: 'transparent',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke={colors.white} strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4" stroke={colors.white} strokeWidth="1.8" />
            <circle cx="17.25" cy="6.75" r="1.1" fill={colors.white} />
          </svg>
        </a>
        <a
          href="weixin://"
          aria-label="Open WeChat"
          style={{
            display: 'inline-flex',
            width: '36px',
            height: '36px',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '999px',
            color: colors.white,
            backgroundColor: 'transparent',
            textDecoration: 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9.2 4.2C5.22 4.2 2 6.86 2 10.14c0 1.9 1.07 3.6 2.74 4.7l-.55 2.16 2.4-1.25c.85.2 1.72.3 2.61.3 3.98 0 7.2-2.66 7.2-5.91S13.18 4.2 9.2 4.2Z"
              fill={colors.white}
            />
            <path
              d="M15.8 9.4c-3.43 0-6.2 2.2-6.2 4.92 0 1.58.94 3 2.4 3.94l-.42 1.74 1.95-1.01c.72.17 1.46.25 2.27.25 3.43 0 6.2-2.2 6.2-4.92 0-2.71-2.77-4.92-6.2-4.92Z"
              fill={colors.white}
              opacity="0.78"
            />
            <circle cx="7.1" cy="9.95" r="0.95" fill={colors.darkGray} />
            <circle cx="11.2" cy="9.95" r="0.95" fill={colors.darkGray} />
            <circle cx="14.3" cy="14.1" r="0.85" fill={colors.darkGray} />
            <circle cx="17.7" cy="14.1" r="0.85" fill={colors.darkGray} />
          </svg>
        </a>
        <a
          href="mailto:33pearlatelier@gmail.com"
          aria-label="Email"
          style={{
            display: 'inline-flex',
            width: '36px',
            height: '36px',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '999px',
            color: colors.white,
            textDecoration: 'none',
            backgroundColor: 'transparent',
          }}
        >
          ✉️
        </a>
      </div>
    </footer>
  )
}
