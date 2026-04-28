import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'

export async function GET(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse || !supabase) return errorResponse

  const search = (request.nextUrl.searchParams.get('search') || '').trim()
  const status = (request.nextUrl.searchParams.get('status') || '').trim()

  let query = supabase
    .from('crm_leads')
    .select(`
      id,
      name,
      email,
      phone,
      source,
      subject,
      message,
      quiz_result,
      coupon_code,
      coupon_amount_off_cents,
      stripe_coupon_id,
      stripe_promotion_code_id,
      quiz_answers,
      status,
      metadata,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    const normalizedSearch = search.replace(/,/g, ' ')
    query = query.or([
      `name.ilike.%${normalizedSearch}%`,
      `email.ilike.%${normalizedSearch}%`,
      `phone.ilike.%${normalizedSearch}%`,
      `source.ilike.%${normalizedSearch}%`,
      `quiz_result.ilike.%${normalizedSearch}%`,
      `subject.ilike.%${normalizedSearch}%`,
    ].join(','))
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching CRM leads:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads: data || [] })
}
