'use client'

import { useState } from 'react'
import Link from 'next/link'
import { colors, typography, transitions, spacing } from '../constants/design'
import { useLanguage } from '../i18n'

export default function Navigation() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { lang, setLang, t } = useLanguage()

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'products', href: '/products' },
    { key: 'about', href: '/about' },
    { key: 'careGuide', href: '/care-guide' },
    { key: 'customServices', href: '/custom-services' },
    { key: 'faq', href: '/faq' },
    { key: 'blog', href: '/blog' },
    { key: 'contact', href: '/contact' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.white,
      borderBottom: `1px solid ${colors.lightGray}`,
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: `${spacing.md} ${spacing.lg}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <Link 
          href="/"
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.darkGray,
            letterSpacing: '0.05em',
            textDecoration: 'none',
          }}
        >
          33 PEARL ATELIER
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: spacing.lg,
          alignItems: 'center',
        }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.normal,
                color: colors.textSecondary,
                textDecoration: 'none',
                transition: transitions.fast,
                position: 'relative',
                paddingBottom: '4px',
                borderBottom: hoveredItem === item.href 
                  ? `2px solid ${colors.gold}` 
                  : '2px solid transparent',
              }}
            >
              {t('nav', item.key)}
            </Link>
          ))}

          {/* Language Switcher */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginLeft: spacing.md,
            paddingLeft: spacing.md,
            borderLeft: `1px solid ${colors.lightGray}`,
          }}>
            <button
              onClick={() => setLang('zh')}
              style={{
                padding: '4px 8px',
                fontSize: typography.fontSize.xs,
                fontWeight: lang === 'zh' ? typography.fontWeight.semibold : typography.fontWeight.normal,
                color: lang === 'zh' ? colors.gold : colors.textLight,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: transitions.fast,
              }}
            >
              中
            </button>
            <span style={{ color: colors.lightGray }}>|</span>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '4px 8px',
                fontSize: typography.fontSize.xs,
                fontWeight: lang === 'en' ? typography.fontWeight.semibold : typography.fontWeight.normal,
                color: lang === 'en' ? colors.gold : colors.textLight,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: transitions.fast,
              }}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
