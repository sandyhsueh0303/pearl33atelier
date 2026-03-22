import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { sendOrderShippingEmail } from '@/app/utils/orderShippingEmail'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse || !supabase) return errorResponse

  const { id } = await context.params
  const body = await request.json()
  const trackingNumber = String(body?.tracking_number || '').trim()
  const shippingCarrier = String(body?.shipping_carrier || '').trim()
  const shippedAtInput = String(body?.shipped_at || '').trim()

  if (!trackingNumber) {
    return NextResponse.json({ error: 'tracking_number is required' }, { status: 400 })
  }

  const shippedAt = shippedAtInput || new Date().toISOString()

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      tracking_number: trackingNumber,
      shipping_carrier: shippingCarrier || null,
      shipped_at: shippedAt,
      status: 'shipped',
    })
    .eq('id', id)

  if (updateError) {
    console.error('Error updating order shipping info:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  try {
    const emailResult = await sendOrderShippingEmail(supabase as any, id)
    return NextResponse.json({
      success: true,
      email: emailResult,
    })
  } catch (error) {
    console.error('Error sending shipping email:', error)
    return NextResponse.json({
      success: true,
      email: {
        skipped: true,
        reason: 'send_failed',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
}
