import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/lib/supabaseAdmin'
import {
  createSingleUsePearlFinderPromotionCode,
  generatePearlFinderCode,
  getPearlFinderCouponExpiresAt,
  PEARL_FINDER_AMOUNT_OFF_CENTS,
  PEARL_FINDER_COUPON_ID,
} from '@/app/lib/pearlFinderCoupon'
import { sendPearlFinderCouponEmail } from '@/app/lib/pearlFinderCouponEmail'

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const phone = String(body?.phone || '').trim()
    const emailNormalized = normalizeEmail(email)
    const phoneNormalized = normalizePhone(phone)
    const subject = String(body?.subject || '').trim()
    const quizResult = String(body?.quizResult || '').trim()
    const quizAnswers = Array.isArray(body?.quizAnswers) ? body.quizAnswers : []
    const message = String(body?.message || '').trim()

    if (!name || !emailNormalized || !phoneNormalized || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone, message' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()
    const duplicateFilters = [`email_normalized.eq.${emailNormalized}`, `phone_normalized.eq.${phoneNormalized}`]
    const { data: existingLead, error: duplicateCheckError } = await supabase
      .from('crm_leads')
      .select('id')
      .eq('source', 'pearl_finder_quiz')
      .or(duplicateFilters.join(','))
      .limit(1)
      .maybeSingle()

    if (duplicateCheckError) {
      console.error('[pearl-finder] Failed to check duplicate coupon lead:', duplicateCheckError)
      return NextResponse.json({ error: 'Failed to validate inquiry' }, { status: 500 })
    }

    if (existingLead) {
      return NextResponse.json(
        {
          error: 'This email or phone number has already requested this offer.',
          code: 'duplicate_coupon_claim',
        },
        { status: 409 }
      )
    }

    const couponCode = generatePearlFinderCode()
    const couponExpiresAt = getPearlFinderCouponExpiresAt()
    const baseMetadata = {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      couponExpiresAt: couponExpiresAt.toISOString(),
    }

    const { data: lead, error } = await supabase
      .from('crm_leads')
      .insert({
        name,
        email,
        email_normalized: emailNormalized,
        phone,
        phone_normalized: phoneNormalized,
        source: 'pearl_finder_quiz',
        subject: subject || null,
        message,
        quiz_result: quizResult || null,
        coupon_code: couponCode,
        coupon_amount_off_cents: PEARL_FINDER_AMOUNT_OFF_CENTS,
        quiz_answers: quizAnswers,
        metadata: {
          ...baseMetadata,
          couponDelivery: { sent: false, reason: 'pending' },
        },
      })
      .select('id')
      .single()

    if (error) {
      console.error('[pearl-finder] Failed to save CRM lead:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          {
            error: 'This email or phone number has already requested this offer.',
            code: 'duplicate_coupon_claim',
          },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 })
    }

    let promotionCodeId: string | null = null

    try {
      const promotionCode = await createSingleUsePearlFinderPromotionCode({
        code: couponCode,
        email,
        phone,
        leadId: lead.id,
        expiresAt: couponExpiresAt,
      })
      promotionCodeId = promotionCode.id
    } catch (error) {
      console.error('[pearl-finder] Failed to create Stripe promotion code:', error)
      await supabase.from('crm_leads').delete().eq('id', lead.id)
      return NextResponse.json({ error: 'Failed to create coupon code' }, { status: 500 })
    }

    const couponDelivery = await sendPearlFinderCouponEmail({
      name,
      email,
      quizResult,
      couponCode,
      couponExpiresAt,
    })

    const { error: metadataUpdateError } = await supabase
      .from('crm_leads')
      .update({
        stripe_coupon_id: PEARL_FINDER_COUPON_ID,
        stripe_promotion_code_id: promotionCodeId,
        metadata: {
          ...baseMetadata,
          couponDelivery,
        },
      })
      .eq('id', lead.id)

    if (metadataUpdateError) {
      console.error('[pearl-finder] Failed to update coupon delivery metadata:', metadataUpdateError)
    }

    return NextResponse.json({
      success: true,
      couponDelivery: couponDelivery.sent ? 'email_sent' : 'message_required',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request payload' },
      { status: 400 }
    )
  }
}
