'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { colors, typography, transitions, spacing } from '../constants/design'
import styles from './Navigation.module.css'
import { useCart } from './CartProvider'

const aboutItems = [
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/blog' },
  { label: 'Care Guide', href: '/care-guide' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
]

const shopItems = [
  { label: 'Akoya Pearls', href: '/products?pearlType=Akoya' },
  { label: 'South Sea Pearls', href: '/products?pearlType=South Sea' },
  { label: 'Tahitian Pearls', href: '/products?pearlType=Tahitian' },
  { label: 'More', href: '/products?pearlType=More' },
]

const shopFeaturedItems = [
  { label: 'All Pearl Jewelry', href: '/products' },
  { label: 'Sales', href: '/products?sale=true&sortBy=price-low' },
]

const shopCategoryItems = [
  { label: 'Earrings', href: '/products?category=Earrings' },
  { label: 'Rings', href: '/products?category=Rings' },
  { label: 'Necklace', href: '/products?category=Necklaces' },
  { label: 'Bracelet', href: '/products?category=Bracelets' },
  { label: 'Others', href: '/products?category=Others' },
]

export default function Navigation() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false)
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false)
  const aboutCloseTimerRef = useRef<number | null>(null)
  const shopCloseTimerRef = useRef<number | null>(null)
  const { itemCount } = useCart()

  const navItems = [
    { label: 'Custom', href: '/custom-services' },
  ]

  const cancelCloseTimer = (timerRef: { current: number | null }) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const scheduleClose = (
    timerRef: { current: number | null },
    close: () => void
  ) => {
    cancelCloseTimer(timerRef)
    timerRef.current = window.setTimeout(() => {
      close()
      timerRef.current = null
    }, 180)
  }

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
          onClick={() => {
            setIsMenuOpen((prev) => {
              const next = !prev
              if (!next) {
                setIsMobileShopOpen(false)
                setIsMobileAboutOpen(false)
              }
              return next
            })
          }}
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
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => {
              cancelCloseTimer(shopCloseTimerRef)
              setIsShopOpen(true)
            }}
            onMouseLeave={() => scheduleClose(shopCloseTimerRef, () => setIsShopOpen(false))}
          >
            <button
              type="button"
              className={styles.dropdownTrigger}
              onFocus={() => setIsShopOpen(true)}
              aria-expanded={isShopOpen}
              aria-haspopup="true"
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.normal,
                color: '#3A3328',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: transitions.fast,
                position: 'relative',
                padding: '0 0 4px',
                borderBottom: isShopOpen
                  ? '2px solid #C9A961'
                  : '2px solid transparent',
              }}
            >
              Shop ▾
            </button>

            {isShopOpen && (
              <div className={`${styles.dropdownMenu} ${styles.shopDropdownMenu}`}>
                <div className={`${styles.dropdownColumn} ${styles.dropdownFeaturedColumn}`}>
                  {shopFeaturedItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.dropdownItem} ${styles.dropdownFeaturedItem}`}
                      onClick={() => setIsShopOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className={styles.dropdownColumn}>
                  <div className={styles.dropdownSectionLabel}>By Type</div>
                  {shopItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles.dropdownItem}
                      onClick={() => setIsShopOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className={styles.dropdownColumn}>
                  <div className={styles.dropdownSectionLabel}>By Category</div>
                  {shopCategoryItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles.dropdownItem}
                      onClick={() => setIsShopOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

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
              {item.href === '/cart' && itemCount > 0 && (
                <span
                  style={{
                    marginLeft: '0.4rem',
                    display: 'inline-flex',
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    borderRadius: '999px',
                    backgroundColor: colors.gold,
                    color: colors.white,
                    fontSize: '0.72rem',
                    lineHeight: '20px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          ))}

          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => {
              cancelCloseTimer(aboutCloseTimerRef)
              setIsAboutOpen(true)
            }}
            onMouseLeave={() => scheduleClose(aboutCloseTimerRef, () => setIsAboutOpen(false))}
          >
            <button
              type="button"
              className={styles.dropdownTrigger}
              onFocus={() => setIsAboutOpen(true)}
              aria-expanded={isAboutOpen}
              aria-haspopup="true"
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.normal,
                color: '#3A3328',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: transitions.fast,
                position: 'relative',
                padding: '0 0 4px',
                borderBottom: isAboutOpen
                  ? '2px solid #C9A961'
                  : '2px solid transparent',
              }}
            >
              About ▾
            </button>

            {isAboutOpen && (
              <div className={styles.dropdownMenu}>
                {aboutItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={styles.dropdownItem}
                    onClick={() => setIsAboutOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/cart"
            onMouseEnter={() => setHoveredItem('/cart')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.normal,
              color: '#3A3328',
              textDecoration: 'none',
              transition: transitions.fast,
              position: 'relative',
              paddingBottom: '4px',
              borderBottom: hoveredItem === '/cart'
                ? '2px solid #C9A961'
                : '2px solid transparent',
            }}
          >
            Cart
            {itemCount > 0 && (
              <span
                style={{
                  marginLeft: '0.4rem',
                  display: 'inline-flex',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  borderRadius: '999px',
                  backgroundColor: colors.gold,
                  color: colors.white,
                  fontSize: '0.72rem',
                  lineHeight: '20px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>
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
          <div
            className={styles.mobileSection}
          >
            <button
              type="button"
              className={styles.mobileSectionTrigger}
              onClick={() => setIsMobileShopOpen((prev) => !prev)}
              aria-expanded={isMobileShopOpen}
            >
              <span>Shop</span>
              <span>{isMobileShopOpen ? '−' : '+'}</span>
            </button>
            {isMobileShopOpen && (
              <div className={styles.mobileSubmenu}>
                <div className={styles.mobileSubmenuLabel}>Featured</div>
                {shopFeaturedItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsMobileShopOpen(false)
                    }}
                    className={styles.mobileSubmenuLink}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className={styles.mobileSubmenuLabel}>By Type</div>
                {shopItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsMobileShopOpen(false)
                    }}
                    className={styles.mobileSubmenuLink}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className={styles.mobileSubmenuLabel}>By Category</div>
                {shopCategoryItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsMobileShopOpen(false)
                    }}
                    className={styles.mobileSubmenuLink}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
                {item.href === '/cart' && itemCount > 0 && (
                  <span
                    style={{
                      marginLeft: '0.4rem',
                      display: 'inline-flex',
                      minWidth: '20px',
                      height: '20px',
                      padding: '0 6px',
                      borderRadius: '999px',
                      backgroundColor: colors.gold,
                      color: colors.white,
                      fontSize: '0.72rem',
                      lineHeight: '20px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
          ))}

          <div className={styles.mobileSection}>
            <button
              type="button"
              className={styles.mobileSectionTrigger}
              onClick={() => setIsMobileAboutOpen((prev) => !prev)}
              aria-expanded={isMobileAboutOpen}
            >
              <span>About</span>
              <span>{isMobileAboutOpen ? '−' : '+'}</span>
            </button>
            {isMobileAboutOpen && (
              <div className={styles.mobileSubmenu}>
                <div className={styles.mobileSubmenuLabel}>Pages</div>
                {aboutItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsMobileAboutOpen(false)
                    }}
                    className={styles.mobileSubmenuLink}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/cart"
            onClick={() => setIsMenuOpen(false)}
            style={{
              color: '#3A3328',
              padding: `${spacing.xs} 0`,
              borderBottom: '1px solid #E9E1D3',
              fontSize: typography.fontSize.lg,
            }}
          >
            Cart
            {itemCount > 0 && (
              <span
                style={{
                  marginLeft: '0.4rem',
                  display: 'inline-flex',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  borderRadius: '999px',
                  backgroundColor: colors.gold,
                  color: colors.white,
                  fontSize: '0.72rem',
                  lineHeight: '20px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  )
}
