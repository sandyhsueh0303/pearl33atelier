/**
 * Auth Session API
 * 
 * Endpoint:
 * - GET /api/auth/session - 取得當前登入狀態
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { logger } from '@/app/utils/logger'
import type { Database } from '@33pearlatelier/shared/types'

type AdminUser = Database['public']['Tables']['admin_users']['Row']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ user: null })
    }

    // Get admin user info
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single<AdminUser>()

    if (adminError || !adminUser) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        role: 'admin' // Hardcoded until role column is added to admin_users table
      }
    })
  } catch (error) {
    logger.error('Session check failed', error)
    return NextResponse.json({ user: null })
  }
}