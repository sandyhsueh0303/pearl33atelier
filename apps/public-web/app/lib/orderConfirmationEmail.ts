import { Resend } from 'resend'
import { createSupabaseAdminClient } from './supabaseAdmin'

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
  status: string
  customer_email: string | null
  customer_name: string | null
  currency: string | null
  subtotal_amount_cents: number
  shipping_fee_cents: number
  tax_amount_cents: number
  total_amount_cents: number
  shipping_address: ShippingAddress
  confirmation_email_sent_at: string | null
  created_at: string
}

interface OrderItemRow {
  product_title_snapshot: string
  quantity: number
  unit_price_amount_cents: number
  line_total_amount_cents: number
}

const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL
const resendReplyToEmail = process.env.RESEND_REPLY_TO_EMAIL

export function isOrderConfirmationEmailConfigured() {
  return Boolean(resendApiKey && resendFromEmail)
}

function requireResendConfig() {
  const missing: string[] = []

  if (!resendApiKey) missing.push('RESEND_API_KEY')
  if (!resendFromEmail) missing.push('RESEND_FROM_EMAIL')

  if (missing.length > 0) {
    throw new Error(`Missing Resend environment variables: ${missing.join(', ')}`)
  }

  return {
    resend: new Resend(resendApiKey),
    from: resendFromEmail as string,
    replyTo: resendReplyToEmail || undefined,
  }
}

function isResendTestingModeRecipientError(message: string) {
  return message.includes('You can only send testing emails to your own email address')
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
  const itemRows = items
    .map((item) => {
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee5d6;">${escapeHtml(item.product_title_snapshot)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee5d6;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee5d6;text-align:right;">${formatUsd(item.line_total_amount_cents, order.currency || 'usd')}</td>
        </tr>
      `
    })
    .join('')

  return `
    <div style="font-family:Georgia, serif;color:#2c2c2c;line-height:1.7;max-width:640px;margin:0 auto;padding:32px 20px;background:#fffdf9;">
      <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#b28a3e;margin:0 0 12px;">33 Pearl Atelier</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;font-weight:400;">Thank you for your order</h1>
      <p style="margin:0 0 18px;">Hi ${escapeHtml(order.customer_name || 'there')}, your order has been received and payment has been confirmed.</p>
      <p style="margin:0 0 24px;">Order number: <strong>${escapeHtml(order.order_number || order.id)}</strong></p>

      <table style="width:100%;border-collapse:collapse;font-size:15px;margin:0 0 24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:0 0 10px;border-bottom:1px solid #d8c8a4;">Item</th>
            <th style="text-align:center;padding:0 0 10px;border-bottom:1px solid #d8c8a4;">Qty</th>
            <th style="text-align:right;padding:0 0 10px;border-bottom:1px solid #d8c8a4;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin:0 0 24px;padding:18px 20px;background:#faf6ee;border:1px solid #eee5d6;border-radius:14px;">
        <p style="margin:0 0 8px;"><strong>Subtotal:</strong> ${formatUsd(order.subtotal_amount_cents, order.currency || 'usd')}</p>
        <p style="margin:0 0 8px;"><strong>Shipping:</strong> ${formatUsd(order.shipping_fee_cents, order.currency || 'usd')}</p>
        <p style="margin:0 0 8px;"><strong>Tax:</strong> ${formatUsd(order.tax_amount_cents, order.currency || 'usd')}</p>
        <p style="margin:0;"><strong>Total:</strong> ${formatUsd(order.total_amount_cents, order.currency || 'usd')}</p>
      </div>

      <div style="margin:0 0 24px;">
        <p style="margin:0 0 8px;"><strong>Shipping address</strong></p>
        <p style="margin:0;white-space:pre-line;">${escapeHtml(formatAddress(order.shipping_address))}</p>
      </div>

      <p style="margin:0 0 12px;">We will email you again once your order is prepared for shipment.</p>
      <p style="margin:0;color:#6f6758;">If you have any questions, just reply to this email or contact us at 33pearlatelier@gmail.com.</p>
    </div>
  `
}

function buildEmailText(order: OrderRow, items: OrderItemRow[]) {
  const itemsText = items
    .map((item) => `- ${item.product_title_snapshot} x${item.quantity}: ${formatUsd(item.line_total_amount_cents, order.currency || 'usd')}`)
    .join('\n')

  return [
    'Thank you for your order from 33 Pearl Atelier.',
    '',
    `Order number: ${order.order_number || order.id}`,
    '',
    'Items:',
    itemsText,
    '',
    `Subtotal: ${formatUsd(order.subtotal_amount_cents, order.currency || 'usd')}`,
    `Shipping: ${formatUsd(order.shipping_fee_cents, order.currency || 'usd')}`,
    `Tax: ${formatUsd(order.tax_amount_cents, order.currency || 'usd')}`,
    `Total: ${formatUsd(order.total_amount_cents, order.currency || 'usd')}`,
    '',
    'Shipping address:',
    formatAddress(order.shipping_address),
    '',
    'We will email you again once your order is prepared for shipment.',
  ].join('\n')
}

export async function sendOrderConfirmationEmail(orderId: string) {
  if (!isOrderConfirmationEmailConfigured()) {
    return { skipped: true, reason: 'missing_config' as const }
  }

  const supabase = createSupabaseAdminClient()
  const { resend, from, replyTo } = requireResendConfig()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      customer_email,
      customer_name,
      currency,
      subtotal_amount_cents,
      shipping_fee_cents,
      tax_amount_cents,
      total_amount_cents,
      shipping_address,
      confirmation_email_sent_at,
      created_at
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new Error(`Failed to load order ${orderId} for confirmation email: ${orderError?.message || 'unknown error'}`)
  }

  if (!order.customer_email) {
    throw new Error(`Order ${orderId} does not have a customer email address`)
  }

  if (order.confirmation_email_sent_at) {
    return { skipped: true, reason: 'already_sent' as const }
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_title_snapshot, quantity, unit_price_amount_cents, line_total_amount_cents')
    .eq('order_id', orderId)

  if (itemsError) {
    throw new Error(`Failed to load order items for confirmation email: ${itemsError.message}`)
  }

  const emailSubject = `Your 33 Pearl Atelier order confirmation${order.order_number ? ` (${order.order_number})` : ''}`

  const sendResult = await resend.emails.send({
    from,
    to: order.customer_email,
    replyTo,
    subject: emailSubject,
    html: buildEmailHtml(order as OrderRow, (items || []) as OrderItemRow[]),
    text: buildEmailText(order as OrderRow, (items || []) as OrderItemRow[]),
  })

  if (sendResult.error) {
    if (isResendTestingModeRecipientError(sendResult.error.message)) {
      return {
        skipped: true,
        reason: 'resend_testing_mode_recipient_restriction' as const,
        detail: sendResult.error.message,
      }
    }

    throw new Error(`Failed to send order confirmation email: ${sendResult.error.message}`)
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      confirmation_email_sent_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    throw new Error(`Email sent but failed to record confirmation_email_sent_at: ${updateError.message}`)
  }

  return { skipped: false, emailId: sendResult.data?.id ?? null }
}
