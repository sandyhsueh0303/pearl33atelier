'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearSessionPage() {
  const [status, setStatus] = useState('正在清除 session...')
  const router = useRouter()

  useEffect(() => {
    async function clearSession() {
      try {
        // Call logout API
        await fetch('/api/auth/logout', { method: 'POST' })
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
        
        setStatus('✅ Session 已清除！正在導向登入頁面...')
        
        setTimeout(() => {
          router.push('/admin/login')
        }, 1500)
      } catch (error) {
        setStatus('❌ 清除失敗，請手動刪除瀏覽器 cookies')
      }
    }
    
    clearSession()
  }, [router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '1rem', color: '#333' }}>清除 Session</h1>
        <p style={{ fontSize: '1.125rem', color: '#666' }}>{status}</p>
      </div>
    </div>
  )
}
