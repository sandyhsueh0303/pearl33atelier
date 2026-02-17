import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@pearl33atelier/shared/types'
import { createAdminClient } from './supabase'

type AdminUser = Database['public']['Tables']['admin_users']['Row']
type AdminSupabaseClient = Awaited<ReturnType<typeof createAdminClient>>

interface AdminAuthSuccess {
  supabase: AdminSupabaseClient
  user: User
  adminUser: AdminUser
  errorResponse?: never
}

interface AdminAuthFailure {
  supabase?: never
  user?: never
  adminUser?: never
  errorResponse: NextResponse
}

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure

export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminUser) {
    return {
      errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { supabase, user, adminUser }
}
