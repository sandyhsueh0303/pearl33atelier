'use client'

import type { MouseEvent } from 'react'
import styles from './ContactMethods.module.css'

type ContactCard = {
  id: string
  title: string
  description: string
  href: string
  icon: JSX.Element
  target?: string
  rel?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function ContactMethods() {
  const lineUrl = 'https://line.me/R/ti/p/~sandyhsiue0303'

  const handleOpenWeChat = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const wechatId = '_33pearlatelier'

    try {
      await navigator.clipboard.writeText(wechatId)
      window.alert(`WeChat ID copied: ${wechatId}`)
    } catch {
      window.alert(`Unable to copy automatically. Please search WeChat ID: ${wechatId}`)
    }

    window.location.href = 'weixin://'
  }

  const cards: ContactCard[] = [
    {
      id: 'email',
      title: 'Email',
      description: 'Send us an email',
      href: 'mailto:hello@33pearlatelier.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M4.8 7.2 12 12.8l7.2-5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.25" cy="6.75" r="1.1" fill="currentColor" />
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
            fill="currentColor"
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
            fill="currentColor"
          />
          <path
            d="M15.8 9.4c-3.43 0-6.2 2.2-6.2 4.92 0 1.58.94 3 2.4 3.94l-.42 1.74 1.95-1.01c.72.17 1.46.25 2.27.25 3.43 0 6.2-2.2 6.2-4.92 0-2.71-2.77-4.92-6.2-4.92Z"
            fill="currentColor"
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
    <section className={styles.contactMethods}>
      <div className={styles.grid}>
        {cards.map((card) => (
          <a
            key={card.id}
            href={card.href}
            target={card.target}
            rel={card.rel}
            onClick={card.onClick}
            className={styles.card}
          >
            <div className={styles.cardContent}>
              <span aria-hidden="true" className={styles.iconWrap}>
                {card.icon}
              </span>
              <div className={styles.textWrap}>
                <p className={styles.cardTitle}>{card.title}</p>
                <p className={styles.cardDescription}>{card.description}</p>
              </div>
            </div>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
