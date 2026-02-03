/**
 * Debug API - Check Admin User Setup
 * Temporary endpoint to diagnose admin_users table setup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Step 1: Check if user can authenticate
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      return NextResponse.json({
        step: 'auth',
        success: false,
        error: authError?.message || 'Authentication failed',
        details: 'User cannot authenticate with Supabase Auth'
      })
    }

    // Step 2: Check admin_users table
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')

    if (adminError) {
      return NextResponse.json({
        step: 'admin_table',
        success: false,
        error: adminError.message,
        details: 'Cannot query admin_users table'
      })
    }

    // Step 3: Check if user exists in admin_users
    const { data: adminUser, error: adminUserError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    // Step 4: Check by email
    const { data: adminByEmail, error: emailError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    // Clean up
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      diagnostics: {
        auth_user_id: authData.user.id,
        auth_email: authData.user.email,
        total_admin_users: adminUsers?.length || 0,
        admin_users_list: adminUsers?.map(u => ({
          id: u.id,
          email: u.email,
          user_id: u.user_id,
          is_active: u.is_active,
          role: u.role
        })),
        found_by_user_id: !!adminUser,
        admin_by_user_id: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          user_id: adminUser.user_id,
          is_active: adminUser.is_active,
          role: adminUser.role
        } : null,
        found_by_email: !!adminByEmail,
        admin_by_email: adminByEmail ? {
          id: adminByEmail.id,
          email: adminByEmail.email,
          user_id: adminByEmail.user_id,
          is_active: adminByEmail.is_active,
          role: adminByEmail.role
        } : null,
        issue: !adminUser ? 
          'User authenticated but not found in admin_users table by user_id' : 
          !adminUser.is_active ? 
            'User found but is_active is false' : 
            'No issues detected'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Debug failed',
        details: error
      },
      { status: 500 }
    )
  }
}
