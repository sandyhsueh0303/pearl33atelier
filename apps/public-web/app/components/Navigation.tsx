'use client'

import { useState } from 'react'
import Link from 'next/link'
import { colors, typography, transitions, spacing } from '../constants/design'
import styles from './Navigation.module.css'

export default function Navigation() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Collection', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Care Guide', href: '/care-guide' },
    { label: 'Custom', href: '/custom-services' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact Us', href: '/contact' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFEFB',
      borderBottom: '1px solid #E9E1D3',
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
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.semibold,
            color: '#3A3328',
            letterSpacing: '0.05em',
            textDecoration: 'none',
          }}
        >
          33 PEARL ATELIER
        </Link>

        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          style={{
            border: '1px solid #E9E1D3',
            backgroundColor: '#FFFEFB',
            color: '#3A3328',
            padding: `${spacing.xs} ${spacing.sm}`,
            cursor: 'pointer',
            fontSize: typography.fontSize.lg,
          }}
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>

        <div
          className={styles.desktopLinks}
          style={{
            display: 'flex',
            gap: spacing.lg,
            alignItems: 'center',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.normal,
                color: '#3A3328',
                textDecoration: 'none',
                transition: transitions.fast,
                position: 'relative',
                paddingBottom: '4px',
                borderBottom: hoveredItem === item.href
                  ? '2px solid #C9A961'
                  : '2px solid transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {isMenuOpen && (
        <div
          className={styles.mobileMenu}
          style={{
            borderTop: '1px solid #E9E1D3',
            backgroundColor: '#FFFEFB',
            padding: `${spacing.sm} ${spacing.md}`,
            display: 'grid',
            gap: spacing.xs,
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              style={{
                color: '#3A3328',
                padding: `${spacing.xs} 0`,
                borderBottom: '1px solid #E9E1D3',
                fontSize: typography.fontSize.lg,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
