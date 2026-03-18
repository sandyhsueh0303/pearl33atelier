import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

export function createSupabaseAdminClient() {
  const missing: string[] = []

  if (!supabaseUrl) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!serviceRoleKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  if (missing.length > 0) {
    throw new Error(`Missing Supabase admin environment variables: ${missing.join(', ')}`)
  }

  const resolvedSupabaseUrl = supabaseUrl as string
  const resolvedServiceRoleKey = serviceRoleKey as string

  return createClient(resolvedSupabaseUrl, resolvedServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
