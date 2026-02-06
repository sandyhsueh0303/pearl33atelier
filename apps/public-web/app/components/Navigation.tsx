'use client'

import { useState } from 'react'
import Link from 'next/link'
import { colors, typography, transitions, spacing } from '../constants/design'

export default function Navigation() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Collection', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Care Guide', href: '/care-guide' },
    { label: 'Custom', href: '/custom-services' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Journal', href: '/blog' },
    { label: 'Contact', href: '/contact' },
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
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
