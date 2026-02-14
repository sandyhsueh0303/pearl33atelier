'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { colors, typography, transitions, spacing } from '../constants/design'

export default function Navigation() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900
      setIsMobile(mobile)
      if (!mobile) {
        setIsMenuOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        padding: `${spacing.md} ${isMobile ? spacing.md : spacing.lg}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <Link 
          href="/"
          style={{
            fontSize: isMobile ? typography.fontSize.base : typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.darkGray,
            letterSpacing: '0.05em',
            textDecoration: 'none',
          }}
        >
          33 PEARL ATELIER
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            style={{
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: colors.white,
              color: colors.darkGray,
              padding: `${spacing.xs} ${spacing.sm}`,
              cursor: 'pointer',
              fontSize: typography.fontSize.base,
            }}
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        ) : (
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
        )}
      </div>

      {isMobile && isMenuOpen && (
        <div
          style={{
            borderTop: `1px solid ${colors.lightGray}`,
            backgroundColor: colors.white,
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
                color: colors.textSecondary,
                padding: `${spacing.xs} 0`,
                borderBottom: `1px solid ${colors.lightGray}`,
                fontSize: typography.fontSize.base,
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
