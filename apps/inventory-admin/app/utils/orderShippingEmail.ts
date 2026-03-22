import { Resend } from 'resend'
import type { Database } from '@pearl33atelier/shared/types'

type SupabaseClientLike = {
  from: <T extends keyof Database['public']['Tables'] & string>(table: T) => any
}

type ShippingAddress = {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
} | null

interface OrderRow {
  id: string
  order_number: string | null
  customer_email: string | null
  customer_name: string | null
  currency: string | null
  total_amount_cents: number
  shipping_address: ShippingAddress
  shipping_carrier: string | null
  tracking_number: string | null
  shipping_email_sent_at: string | null
}

interface OrderItemRow {
  product_title_snapshot: string
  quantity: number
}

const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL
const resendReplyToEmail = process.env.RESEND_REPLY_TO_EMAIL
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'

function isConfigured() {
  return Boolean(resendApiKey && resendFromEmail)
}

function getResend() {
  if (!isConfigured()) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL')
  }

  return {
    resend: new Resend(resendApiKey),
    from: resendFromEmail as string,
    replyTo: resendReplyToEmail || undefined,
  }
}

function formatUsd(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatAddress(address: ShippingAddress) {
  if (!address) return 'No shipping address provided.'

  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ]
    .filter(Boolean)
    .join('\n')
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildEmailHtml(order: OrderRow, items: OrderItemRow[]) {
  const itemsHtml = items
    .map((item) => `<li>${escapeHtml(item.product_title_snapshot)} x${item.quantity}</li>`)
    .join('')

  return `
    <div style="font-family:Georgia, serif;color:#2c2c2c;line-height:1.7;max-width:640px;margin:0 auto;padding:32px 20px;background:#fffdf9;">
      <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#b28a3e;margin:0 0 12px;">33 Pearl Atelier</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;font-weight:400;">Your order is on the way</h1>
      <p style="margin:0 0 16px;">Hi ${escapeHtml(order.customer_name || 'there')}, your order has shipped.</p>
      <p style="margin:0 0 8px;"><strong>Order number:</strong> ${escapeHtml(order.order_number || order.id)}</p>
      <p style="margin:0 0 8px;"><strong>Carrier:</strong> ${escapeHtml(order.shipping_carrier || 'Shipping carrier')}</p>
      <p style="margin:0 0 20px;"><strong>Tracking number:</strong> ${escapeHtml(order.tracking_number || '')}</p>

      <div style="margin:0 0 20px;padding:18px 20px;background:#faf6ee;border:1px solid #eee5d6;border-radius:14px;">
        <p style="margin:0 0 10px;"><strong>Order total:</strong> ${formatUsd(order.total_amount_cents, order.currency || 'usd')}</p>
        <p style="margin:0;"><strong>Shipping address:</strong><br />${escapeHtml(formatAddress(order.shipping_address)).replaceAll('\n', '<br />')}</p>
      </div>

      <div style="margin:0 0 20px;">
        <p style="margin:0 0 8px;"><strong>Items</strong></p>
        <ul style="margin:0;padding-left:1.25rem;">${itemsHtml}</ul>
      </div>

      <p style="margin:0 0 12px;">If you have any questions, reply to this email or contact us at hello@33pearlatelier.com.</p>
      <p style="margin:0;color:#6f6758;">Thank you for shopping with 33 Pearl Atelier.</p>
    </div>
  `
}

function buildEmailText(order: OrderRow, items: OrderItemRow[]) {
  return [
    'Your 33 Pearl Atelier order is on the way.',
    '',
    `Order number: ${order.order_number || order.id}`,
    `Carrier: ${order.shipping_carrier || 'Shipping carrier'}`,
    `Tracking number: ${order.tracking_number || ''}`,
    `Order total: ${formatUsd(order.total_amount_cents, order.currency || 'usd')}`,
    '',
    'Items:',
    ...items.map((item) => `- ${item.product_title_snapshot} x${item.quantity}`),
    '',
    'Shipping address:',
    formatAddress(order.shipping_address),
    '',
    `Website: ${siteUrl}`,
  ].join('\n')
}

export async function sendOrderShippingEmail(supabase: SupabaseClientLike, orderId: string) {
  if (!isConfigured()) {
    return { skipped: true, reason: 'missing_config' as const }
  }

  const { resend, from, replyTo } = getResend()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_email,
      customer_name,
      currency,
      total_amount_cents,
      shipping_address,
      shipping_carrier,
      tracking_number,
      shipping_email_sent_at
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new Error(`Failed to load order ${orderId}: ${orderError?.message || 'unknown error'}`)
  }

  if (!order.customer_email) {
    throw new Error(`Order ${orderId} does not have a customer email address`)
  }

  if (!order.tracking_number) {
    throw new Error(`Order ${orderId} does not have a tracking number`)
  }

  if (order.shipping_email_sent_at) {
    return { skipped: true, reason: 'already_sent' as const }
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_title_snapshot, quantity')
    .eq('order_id', orderId)

  if (itemsError) {
    throw new Error(`Failed to load order items for shipping email: ${itemsError.message}`)
  }

  const subject = `Your 33 Pearl Atelier order has shipped${order.order_number ? ` (${order.order_number})` : ''}`
  const sendResult = await resend.emails.send({
    from,
    to: order.customer_email,
    replyTo,
    subject,
    html: buildEmailHtml(order as OrderRow, (items || []) as OrderItemRow[]),
    text: buildEmailText(order as OrderRow, (items || []) as OrderItemRow[]),
  })

  if (sendResult.error) {
    throw new Error(`Failed to send shipping email: ${sendResult.error.message}`)
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      shipping_email_sent_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    throw new Error(`Shipping email sent but failed to record shipping_email_sent_at: ${updateError.message}`)
  }

  return { skipped: false, emailId: sendResult.data?.id ?? null }
}
