/**
 * Auth Logout API
 * 
 * Endpoint:
 * - POST /api/auth/logout - Admin 登出，完整清除 session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle middleware context where cookies cannot be set
            }
          },
        },
      }
    )

    // Sign out from Supabase (this will clear all auth-related cookies)
    await supabase.auth.signOut()

    // Additional cleanup: explicitly delete any remaining auth cookies
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
