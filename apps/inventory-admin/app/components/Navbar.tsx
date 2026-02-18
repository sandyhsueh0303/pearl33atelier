'use client'

import { useAuth } from './AuthProvider'
import Link from 'next/link'

export default function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <nav style={{
      backgroundColor: '#1E3A5F',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      height: '64px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <Link 
          href="/admin/products" 
          style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.25rem', 
            fontWeight: '600',
            letterSpacing: '0.02em'
          }}
        >
          33 Pearl Atelier
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link 
            href="/admin/products" 
            style={{ 
              color: 'rgba(255,255,255,0.8)', 
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          >
            Products
          </Link>
          <Link 
            href="/admin/inventory" 
            style={{ 
              color: 'rgba(255,255,255,0.8)', 
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          >
            Inventory
          </Link>
          <Link 
            href="/admin/sales" 
            style={{ 
              color: 'rgba(255,255,255,0.8)', 
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          >
            Sales
          </Link>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.875rem'
      }}>
        <span>
          {user.name || user.email}
        </span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span style={{ 
          padding: '0.35rem 0.75rem', 
          backgroundColor: 'rgba(255,255,255,0.15)', 
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          Admin
        </span>
        <button
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
