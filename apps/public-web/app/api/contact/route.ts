import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseAdminClient } from '@/app/lib/supabaseAdmin'
import { stripe } from '@/app/lib/stripe'

const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL
const couponResendFromEmail = process.env.COUPON_RESEND_FROM_EMAIL || resendFromEmail
const resendReplyToEmail = process.env.RESEND_REPLY_TO_EMAIL
const PEARL_FINDER_COUPON_ID = 'pearl_finder_20_usd'
const PEARL_FINDER_AMOUNT_OFF_CENTS = 2_000
const PEARL_FINDER_COUPON_VALID_DAYS = 7

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '')
}

function generatePearlFinderCode() {
  return `PEARL20-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

function getPearlFinderCouponExpiresAt() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + PEARL_FINDER_COUPON_VALID_DAYS)
  return expiresAt
}

function formatCouponExpirationDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles',
  }).format(date)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getPearlMatchEmailCopy(quizResult: string) {
  const normalizedResult = quizResult.toLowerCase()

  if (normalizedResult.includes('akoya')) {
    return {
      headline: 'Your match: Akoya pearls',
      description:
        'Akoya pearls are known for their crisp luster, elegant round shape, and timeless white glow. They are perfect when you want something polished, refined, and easy to wear every day.',
      stylingTip:
        'Style tip: choose Akoya when you want a clean, classic finish with a little quiet sparkle.',
    }
  }

  if (normalizedResult.includes('south') || normalizedResult.includes('australian')) {
    return {
      headline: 'Your match: South Sea pearls',
      description:
        'South Sea pearls carry a soft, luxurious glow with a graceful presence. They are beautiful for old-money styling, meaningful gifts, and pieces that feel understated but special.',
      stylingTip:
        'Style tip: choose South Sea when you want warmth, softness, and a more elevated statement.',
    }
  }

  if (normalizedResult.includes('tahitian')) {
    return {
      headline: 'Your match: Tahitian pearls',
      description:
        'Tahitian pearls are loved for their deeper tones, natural drama, and modern edge. They are ideal if you want pearls that feel distinctive, confident, and a little unexpected.',
      stylingTip:
        'Style tip: choose Tahitian when you want contrast, personality, and a pearl look that stands out.',
    }
  }

  return {
    headline: 'Your pearl match is ready',
    description:
      'Your answers point toward pearls with a balance of beauty, wearability, and personal style. The right piece should feel natural on you the moment you put it on.',
    stylingTip:
      'Style tip: start with the piece you can imagine wearing most often, then build from there.',
  }
}

async function ensurePearlFinderStripeCoupon() {
  try {
    return await stripe.coupons.retrieve(PEARL_FINDER_COUPON_ID)
  } catch (error) {
    const statusCode = typeof error === 'object' && error && 'statusCode' in error
      ? (error as { statusCode?: number }).statusCode
      : null

    if (statusCode !== 404) {
      throw error
    }

    return stripe.coupons.create({
      id: PEARL_FINDER_COUPON_ID,
      name: 'Pearl Finder $20 Off',
      amount_off: PEARL_FINDER_AMOUNT_OFF_CENTS,
      currency: 'usd',
      duration: 'once',
      metadata: {
        source: 'pearl_finder_quiz',
      },
    })
  }
}

async function createSingleUsePearlFinderPromotionCode({
  code,
  email,
  phone,
  leadId,
  expiresAt,
}: {
  code: string
  email: string
  phone: string
  leadId: string
  expiresAt: Date
}) {
  const coupon = await ensurePearlFinderStripeCoupon()
  return stripe.promotionCodes.create({
    promotion: {
      type: 'coupon',
      coupon: coupon.id,
    },
    code,
    max_redemptions: 1,
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    active: true,
    metadata: {
      source: 'pearl_finder_quiz',
      crm_lead_id: leadId,
      email,
      phone,
      expires_at: expiresAt.toISOString(),
    },
  })
}

async function sendCouponEmail({
  name,
  email,
  quizResult,
  couponCode,
  couponExpiresAt,
}: {
  name: string
  email: string
  quizResult: string
  couponCode: string
  couponExpiresAt: Date
}) {
  if (!resendApiKey || !couponResendFromEmail || !couponCode) {
    return { sent: false, reason: 'missing_config' as const }
  }

  const resend = new Resend(resendApiKey)
  const subject = 'Your 33 Pearl Atelier Pearl discount code'
  const safeName = escapeHtml(name || 'there')
  const safeCouponCode = escapeHtml(couponCode)
  const couponExpirationDate = formatCouponExpirationDate(couponExpiresAt)
  const safeCouponExpirationDate = escapeHtml(couponExpirationDate)
  const matchCopy = getPearlMatchEmailCopy(quizResult)
  const safeMatchHeadline = escapeHtml(matchCopy.headline)
  const safeMatchDescription = escapeHtml(matchCopy.description)
  const safeStylingTip = escapeHtml(matchCopy.stylingTip)

  const sendResult = await resend.emails.send({
    from: couponResendFromEmail,
    to: email,
    replyTo: resendReplyToEmail || undefined,
    subject,
    html: `
      <div style="font-family:Georgia, 'Times New Roman', serif;color:#2c2c2c;line-height:1.7;max-width:640px;margin:0 auto;padding:34px 22px;background:#fffdf9;">
        <p style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#b28a3e;margin:0 0 12px;">33 Pearl Atelier</p>
        <h1 style="font-size:30px;line-height:1.18;margin:0 0 16px;font-weight:400;color:#1f1d1a;">Your Pearl Finder result is here</h1>
        <p style="margin:0 0 18px;font-size:16px;">Hi ${safeName},</p>
        <p style="margin:0 0 22px;font-size:16px;">Thank you for taking our Pearl Finder Quiz. Based on your answers, we picked a pearl direction that best matches your style, mood, and everyday wardrobe.</p>

        <div style="margin:0 0 24px;padding:22px 22px;background:#faf6ee;border:1px solid #eee5d6;border-radius:10px;">
          <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8f6f32;margin:0 0 8px;">Your recommendation</p>
          <h2 style="font-size:23px;line-height:1.25;margin:0 0 10px;font-weight:400;color:#2a241b;">${safeMatchHeadline}</h2>
          <p style="margin:0 0 12px;font-size:15px;color:#50483c;">${safeMatchDescription}</p>
          <p style="margin:0;font-size:14px;color:#6f6758;">${safeStylingTip}</p>
        </div>

        <p style="margin:0 0 12px;font-size:16px;">As a thank you, here is your one-time $20 off code:</p>
        <div style="margin:0 0 18px;padding:20px;background:#1f1d1a;color:#fffdf9;border-radius:10px;text-align:center;">
          <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#d9c28d;margin:0 0 8px;">One-time code</p>
          <div style="font-size:28px;letter-spacing:0.12em;font-weight:700;">${safeCouponCode}</div>
          <p style="margin:10px 0 0;font-size:13px;color:#d9c28d;">Valid through ${safeCouponExpirationDate}</p>
        </div>

        <div style="margin:0 0 24px;padding:0 0 0 18px;color:#50483c;font-size:15px;">
          <p style="margin:0 0 8px;">How to use it:</p>
          <p style="margin:0 0 6px;">1. Add your favorite pearl piece to cart.</p>
          <p style="margin:0 0 6px;">2. Enter the code at checkout.</p>
          <p style="margin:0;">3. Enjoy $20 off your order.</p>
        </div>

        <p style="margin:0 0 14px;font-size:15px;color:#50483c;">Not sure which piece to choose? Reply to this email with what you are shopping for, your budget, or a photo of your usual style. We would be happy to help you find the right pearl.</p>
        <p style="margin:0;color:#8a806f;font-size:13px;">With love,<br/>33 Pearl Atelier</p>
      </div>
    `,
    text: [
      `Hi ${name || 'there'},`,
      '',
      'Thank you for taking our Pearl Finder Quiz.',
      '',
      matchCopy.headline,
      matchCopy.description,
      matchCopy.stylingTip,
      '',
      `Your one-time $20 off code: ${couponCode}`,
      `Valid through ${couponExpirationDate}`,
      '',
      'How to use it:',
      '1. Add your favorite pearl piece to cart.',
      '2. Enter the code at checkout.',
      '3. Enjoy $20 off your order.',
      '',
      'Not sure which piece to choose? Reply to this email with what you are shopping for, your budget, or a photo of your usual style.',
      '',
      'With love,',
      '33 Pearl Atelier',
    ].join('\n'),
  })

  if (sendResult.error) {
    console.error('[contact] Failed to send coupon email:', sendResult.error)
    return { sent: false, reason: 'send_failed' as const }
  }

  return { sent: true, emailId: sendResult.data?.id ?? null }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const phone = String(body?.phone || '').trim()
    const emailNormalized = normalizeEmail(email)
    const phoneNormalized = normalizePhone(phone)
    const message = String(body?.message || '').trim()
    const inquiryType = String(body?.inquiryType || 'contact_form').trim() || 'contact_form'
    const subject = String(body?.subject || '').trim()
    const quizResult = String(body?.quizResult || '').trim()
    const quizAnswers = Array.isArray(body?.quizAnswers) ? body.quizAnswers : []
    const isPearlFinderCouponRequest = inquiryType === 'pearl_finder_quiz'
    const couponCode = isPearlFinderCouponRequest
      ? generatePearlFinderCode()
      : String(body?.couponCode || '').trim()
    const couponExpiresAt = isPearlFinderCouponRequest ? getPearlFinderCouponExpiresAt() : null

    if (!name || !emailNormalized || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      )
    }

    if (isPearlFinderCouponRequest && !phoneNormalized) {
      return NextResponse.json(
        { error: 'Phone number is required to receive this offer.' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    if (isPearlFinderCouponRequest) {
      const duplicateFilters = [`email_normalized.eq.${emailNormalized}`]
      if (phoneNormalized) duplicateFilters.push(`phone_normalized.eq.${phoneNormalized}`)

      const { data: existingLead, error: duplicateCheckError } = await supabase
        .from('crm_leads')
        .select('id')
        .eq('source', 'pearl_finder_quiz')
        .or(duplicateFilters.join(','))
        .limit(1)
        .maybeSingle()

      if (duplicateCheckError) {
        console.error('[contact] Failed to check duplicate coupon lead:', duplicateCheckError)
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
    }

    const baseMetadata = {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    }

    const { data: lead, error } = await supabase.from('crm_leads').insert({
      name,
      email,
      email_normalized: emailNormalized,
      phone: phone || null,
      phone_normalized: phoneNormalized || null,
      source: inquiryType,
      subject: subject || null,
      message,
      quiz_result: quizResult || null,
      coupon_code: couponCode || null,
      coupon_amount_off_cents: isPearlFinderCouponRequest ? PEARL_FINDER_AMOUNT_OFF_CENTS : null,
      quiz_answers: quizAnswers,
      metadata: {
        ...baseMetadata,
        couponExpiresAt: couponExpiresAt?.toISOString() ?? null,
        couponDelivery: isPearlFinderCouponRequest
          ? { sent: false, reason: 'pending' }
          : { sent: false, reason: 'not_coupon_request' },
      },
    }).select('id').single()

    if (error) {
      console.error('[contact] Failed to save CRM lead:', error)
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

    if (isPearlFinderCouponRequest && lead?.id && couponExpiresAt) {
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
        console.error('[contact] Failed to create Stripe promotion code:', error)
        await supabase.from('crm_leads').delete().eq('id', lead.id)
        return NextResponse.json({ error: 'Failed to create coupon code' }, { status: 500 })
      }
    }

    const couponDelivery =
      isPearlFinderCouponRequest && couponExpiresAt
        ? await sendCouponEmail({ name, email, quizResult, couponCode, couponExpiresAt })
        : { sent: false, reason: 'not_coupon_request' as const }

    if (lead?.id) {
      const { error: metadataUpdateError } = await supabase
        .from('crm_leads')
        .update({
          stripe_coupon_id: isPearlFinderCouponRequest ? PEARL_FINDER_COUPON_ID : null,
          stripe_promotion_code_id: promotionCodeId,
          metadata: {
            ...baseMetadata,
            couponExpiresAt: couponExpiresAt?.toISOString() ?? null,
            couponDelivery,
          },
        })
        .eq('id', lead.id)

      if (metadataUpdateError) {
        console.error('[contact] Failed to update coupon delivery metadata:', metadataUpdateError)
      }
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
