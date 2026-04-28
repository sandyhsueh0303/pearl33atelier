import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/lib/supabaseAdmin'

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const emailNormalized = normalizeEmail(email)
    const message = String(body?.message || '').trim()
    const inquiryType = String(body?.inquiryType || 'contact_form').trim() || 'contact_form'
    const subject = String(body?.subject || '').trim()

    if (!name || !emailNormalized || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('crm_leads').insert({
      name,
      email,
      email_normalized: emailNormalized,
      source: inquiryType,
      subject: subject || null,
      message,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      },
    })

    if (error) {
      console.error('[contact] Failed to save CRM lead:', error)
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request payload' },
      { status: 400 }
    )
  }
}
