import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types'

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string
) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}
