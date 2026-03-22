'use client'

import type { MouseEvent } from 'react'
import { colors, typography, spacing } from '../constants/design'

export default function Footer() {
  const lineUrl = 'https://line.me/R/ti/p/~sandyhsiue0303'

  const handleOpenWeChat = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const wechatId = '_33pearlatelier'

    try {
      await navigator.clipboard.writeText(wechatId)
      window.alert(`WeChat ID copied: ${wechatId}`)
    } catch {
      window.alert(`Unable to copy automatically. Please search WeChat ID: ${wechatId}`)
    }

    window.location.href = 'weixin://'
  }

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
          onClick={handleOpenWeChat}
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
          href={lineUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="LINE"
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
            <path
              d="M12 3.1c-5.52 0-10 3.66-10 8.16 0 4.03 3.52 7.4 8.28 8.03l-.37 2.7 2.77-2.59c6-.03 10.32-3.69 10.32-8.14 0-4.5-4.48-8.16-10-8.16Z"
              fill={colors.white}
            />
            <text
              x="12"
              y="14.25"
              textAnchor="middle"
              fontSize="5.8"
              fontWeight="700"
              fontFamily="Arial, sans-serif"
              fill={colors.darkGray}
            >
              LINE
            </text>
          </svg>
        </a>
        <a
          href="mailto:hello@33pearlatelier.com"
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
