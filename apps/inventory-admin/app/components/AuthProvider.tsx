'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { SessionUser } from '@pearl33atelier/shared/types'

interface AuthContextType {
  user: SessionUser | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simple logger for client-side (only in development)
const isDevelopment = process.env.NODE_ENV === 'development'
const clientLogger = {
  error(message: string, error?: unknown) {
    if (isDevelopment) {
      console.error(`[AUTH ERROR] ${message}`, error)
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      clientLogger.error('Session check failed', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Clear client-side state
      setUser(null)
      
      // Clear any client-side cookies (backup cleanup)
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
      }
      
      // Redirect to login and force refresh
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      clientLogger.error('Logout failed', error)
      // Even if API fails, still clear local state and redirect
      setUser(null)
      router.push('/admin/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
