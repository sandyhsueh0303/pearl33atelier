'use client'

import type { MouseEvent } from 'react'
import { colors, typography, spacing } from '../constants/design'

type ContactCard = {
  id: string
  title: string
  description: string
  href: string
  icon: JSX.Element
  target?: string
  rel?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export default function ContactMethods() {
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

  const iconWrapStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    backgroundColor: '#fff6e6',
    flexShrink: 0,
  } as const

  const cards: ContactCard[] = [
    {
      id: 'email',
      title: 'Email',
      description: 'Send us an email',
      href: 'mailto:33pearlatelier@gmail.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11Z"
            stroke={colors.gold}
            strokeWidth="1.6"
          />
          <path d="M4.8 7.2 12 12.8l7.2-5.6" stroke={colors.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      title: 'Instagram',
      description: 'Message us on Instagram',
      href: 'https://www.instagram.com/33_pearl_atelier/',
      target: '_blank',
      rel: 'noreferrer',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke={colors.gold} strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke={colors.gold} strokeWidth="1.8" />
          <circle cx="17.25" cy="6.75" r="1.1" fill={colors.gold} />
        </svg>
      ),
    },
    {
      id: 'line',
      title: 'LINE',
      description: 'Chat with us on LINE',
      href: lineUrl,
      target: '_blank',
      rel: 'noreferrer',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.1c-5.52 0-10 3.66-10 8.16 0 4.03 3.52 7.4 8.28 8.03l-.37 2.7 2.77-2.59c6-.03 10.32-3.69 10.32-8.14 0-4.5-4.48-8.16-10-8.16Z"
            fill={colors.gold}
          />
          <text x="12" y="14.25" textAnchor="middle" fontSize="5.8" fontWeight="700" fontFamily="Arial, sans-serif" fill="#fffdfa">
            LINE
          </text>
        </svg>
      ),
    },
    {
      id: 'wechat',
      title: 'WeChat',
      description: 'Open WeChat to contact us',
      href: 'weixin://',
      onClick: handleOpenWeChat,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9.2 4.2C5.22 4.2 2 6.86 2 10.14c0 1.9 1.07 3.6 2.74 4.7l-.55 2.16 2.4-1.25c.85.2 1.72.3 2.61.3 3.98 0 7.2-2.66 7.2-5.91S13.18 4.2 9.2 4.2Z"
            fill={colors.gold}
          />
          <path
            d="M15.8 9.4c-3.43 0-6.2 2.2-6.2 4.92 0 1.58.94 3 2.4 3.94l-.42 1.74 1.95-1.01c.72.17 1.46.25 2.27.25 3.43 0 6.2-2.2 6.2-4.92 0-2.71-2.77-4.92-6.2-4.92Z"
            fill={colors.gold}
            opacity="0.78"
          />
          <circle cx="7.1" cy="9.95" r="0.95" fill="#fffdfa" />
          <circle cx="11.2" cy="9.95" r="0.95" fill="#fffdfa" />
          <circle cx="14.3" cy="14.1" r="0.85" fill="#fffdfa" />
          <circle cx="17.7" cy="14.1" r="0.85" fill="#fffdfa" />
        </svg>
      ),
    },
  ]

  return (
    <section
      style={{
        padding: `0 ${spacing.xl} ${spacing.xl}`,
      }}
    >
      <div
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: spacing.md,
        }}
      >
        {cards.map((card) => (
          <a
            key={card.id}
            href={card.href}
            target={card.target}
            rel={card.rel}
            onClick={card.onClick}
            style={{
              textDecoration: 'none',
              color: colors.darkGray,
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: '#fffdfa',
              borderRadius: '12px',
              padding: `${spacing.md} ${spacing.lg}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.lg,
              transition: 'transform 180ms ease, border-color 180ms ease, background-color 180ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.borderColor = '#e0d4bf'
              e.currentTarget.style.backgroundColor = '#fffefb'
              const arrow = e.currentTarget.querySelector('[data-arrow]') as HTMLElement | null
              if (arrow) arrow.style.transform = 'translateX(2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = colors.lightGray
              e.currentTarget.style.backgroundColor = '#fffdfa'
              const arrow = e.currentTarget.querySelector('[data-arrow]') as HTMLElement | null
              if (arrow) arrow.style.transform = 'translateX(0)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, minWidth: 0 }}>
              <span aria-hidden="true" style={iconWrapStyle}>
                {card.icon}
              </span>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.fontSize.sm,
                    color: colors.gold,
                    letterSpacing: '0.11em',
                    textTransform: 'uppercase',
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    margin: `${spacing.xs} 0 0`,
                    fontSize: typography.fontSize.base,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.description}
                </p>
              </div>
            </div>
            <span
              data-arrow
              style={{
                color: 'rgba(201, 169, 97, 0.55)',
                fontSize: typography.fontSize.base,
                flexShrink: 0,
                transition: 'transform 180ms ease',
              }}
              aria-hidden="true"
            >
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
