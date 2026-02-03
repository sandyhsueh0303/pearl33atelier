/**
 * Auth Login API
 * 
 * Endpoint:
 * - POST /api/auth/login - Admin 登入
 *   驗證 Supabase Auth + admin_users 表
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { logger } from '@/app/utils/logger'
import type { Database } from '@pearl33atelier/shared/types'

type AdminUser = Database['public']['Tables']['admin_users']['Row']

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Attempt to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is in admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single<AdminUser>()

    if (adminError || !adminUser) {
      // User authenticated but not an admin
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Session cookies are automatically set by createServerClient
    return NextResponse.json({
      success: true,
      user: {
        user_id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || null,
        role: 'admin' // Hardcoded until role column is added to admin_users table
      }
    })
  } catch (error) {
    logger.error('Login failed', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}