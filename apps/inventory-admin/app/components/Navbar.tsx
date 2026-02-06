'use client'

import { useAuth } from './AuthProvider'
import Link from 'next/link'

export default function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <nav style={{
      backgroundColor: '#1976d2',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link 
          href="/admin/products" 
          style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.25rem', 
            fontWeight: 'bold' 
          }}
        >
          33 Pearl Atelier
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/admin/products" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            產品管理
          </Link>
          <Link 
            href="/admin/inventory" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            庫存管理
          </Link>
          <Link 
            href="/admin/sales" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            銷售管理
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem' }}>
          {user.name || user.email}
        </span>
        <span style={{ 
          padding: '0.25rem 0.5rem', 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          borderRadius: '12px',
          fontSize: '0.75rem'
        }}>
          Admin
        </span>
        <button
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        >
          登出
        </button>
      </div>
    </nav>
  )
}
