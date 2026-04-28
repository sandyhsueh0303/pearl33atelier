'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  return (
    <nav className={styles.navbar}>
      <div className={styles.topRow}>
        <Link href="/admin/products" className={styles.brand}>
          33 Pearl Atelier
        </Link>
        <div className={styles.navLinks}>
          <Link href="/admin/products" className={styles.navLink}>
            Products
          </Link>
          <Link href="/admin/inventory" className={styles.navLink}>
            Inventory
          </Link>
          <Link href="/admin/sales" className={styles.navLink}>
            Sales
          </Link>
          <Link href="/admin/orders" className={styles.navLink}>
            Orders
          </Link>
          <Link href="/admin/crm" className={styles.navLink}>
            CRM
          </Link>
          <Link href="/admin/blog" className={styles.navLink}>
            Blog
          </Link>
        </div>

        <div className={styles.rightGroup}>
          <span className={styles.userName}>{user.name || user.email}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.badge}>
            Admin
          </span>
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>

        <div className={styles.mobileActions}>
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-admin-menu"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-admin-menu" className={styles.mobileMenu}>
          <Link href="/admin/products" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
            Products
          </Link>
          <Link href="/admin/inventory" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
            Inventory
          </Link>
          <Link href="/admin/sales" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
            Sales
          </Link>
          <Link href="/admin/orders" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
            Orders
          </Link>
          <Link href="/admin/crm" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
            CRM
          </Link>
          <Link href="/admin/blog" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
            Blog
          </Link>
        <div className={styles.mobileMetaRow}>
            <span className={styles.mobileUserName}>{user.name || user.email}</span>
            <button onClick={logout} className={styles.mobileLogoutButton}>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
