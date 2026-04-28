import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL
const couponResendFromEmail = process.env.COUPON_RESEND_FROM_EMAIL || resendFromEmail
const resendReplyToEmail = process.env.RESEND_REPLY_TO_EMAIL

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

export async function sendPearlFinderCouponEmail({
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
    console.error('[pearl-finder] Failed to send coupon email:', sendResult.error)
    return { sent: false, reason: 'send_failed' as const }
  }

  return { sent: true, emailId: sendResult.data?.id ?? null }
}
