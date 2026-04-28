import { stripe } from './stripe'

export const PEARL_FINDER_COUPON_ID = 'pearl_finder_20_usd'
export const PEARL_FINDER_AMOUNT_OFF_CENTS = 2_000
export const PEARL_FINDER_COUPON_VALID_DAYS = 7

export function generatePearlFinderCode() {
  return `PEARL20-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

export function getPearlFinderCouponExpiresAt() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + PEARL_FINDER_COUPON_VALID_DAYS)
  return expiresAt
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

export async function createSingleUsePearlFinderPromotionCode({
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
