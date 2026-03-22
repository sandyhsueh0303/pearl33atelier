import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'

export async function GET(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse || !supabase) return errorResponse

  const search = (request.nextUrl.searchParams.get('search') || '').trim()

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      customer_name,
      customer_email,
      total_amount_cents,
      currency,
      tracking_number,
      shipping_carrier,
      shipped_at,
      confirmation_email_sent_at,
      shipping_email_sent_at,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or([
      `order_number.ilike.%${search}%`,
      `customer_name.ilike.%${search}%`,
      `customer_email.ilike.%${search}%`,
      `tracking_number.ilike.%${search}%`,
    ].join(','))
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders: data || [] })
}
