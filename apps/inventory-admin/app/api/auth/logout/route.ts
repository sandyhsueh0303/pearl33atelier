/**
 * Auth Logout API
 * 
 * Endpoint:
 * - POST /api/auth/logout - Admin 登出，完整清除 session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient()

    // Sign out from Supabase (this will clear all auth-related cookies)
    await supabase.auth.signOut()

    // Additional cleanup: explicitly delete any remaining auth cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name)
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Successfully logged out'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
