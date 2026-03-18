import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '../../../lib/stripe'
import { createSupabaseAdminClient } from '../../../lib/supabaseAdmin'
import { syncPaidOrderToSales } from '../../../lib/orderSync'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

function logCheckoutCompletion(session: Stripe.Checkout.Session) {
  console.log('[stripe:webhook] checkout.session.completed', {
    checkoutSessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    amountTotal: session.amount_total,
    currency: session.currency,
    status: session.payment_status,
    metadata: session.metadata,
    createdAt: new Date().toISOString(),
  })
}

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id

  console.log('[stripe:webhook] markOrderPaid:start', {
    sessionId: session.id,
    orderId,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    customerName: session.customer_details?.name ?? null,
    amountSubtotal: session.amount_subtotal,
    amountTotal: session.amount_total,
  })

  if (!orderId) {
    throw new Error('Missing order_id in checkout session metadata')
  }

  const adminSupabase = createSupabaseAdminClient()
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  const updatePayload = {
    status: 'paid',
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    customer_name: session.customer_details?.name ?? null,
    currency: session.currency || 'usd',
    subtotal_amount_cents: session.amount_subtotal ?? 0,
    total_amount_cents: session.amount_total ?? 0,
    shipping_address: session.customer_details?.address ?? null,
    metadata: {
      ...(session.metadata || {}),
      payment_status: session.payment_status,
    },
  }

  console.log('[stripe:webhook] markOrderPaid:updatePayload', {
    orderId,
    sessionId: session.id,
    updatePayload,
  })

  const { data, error } = await adminSupabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select('id, status, stripe_checkout_session_id, customer_email, customer_name')

  if (error) {
    console.error('[stripe:webhook] markOrderPaid:updateError', {
      orderId,
      sessionId: session.id,
      error,
    })
    throw new Error(`Failed to update order ${orderId}: ${error.message}`)
  }

  console.log('[stripe:webhook] markOrderPaid:updated', {
    orderId,
    sessionId: session.id,
    updatedRows: data,
  })

  try {
    await syncPaidOrderToSales(orderId)
  } catch (error) {
    console.error('[stripe:webhook] syncPaidOrderToSales failed', {
      orderId,
      sessionId: session.id,
      error,
    })
    throw error
  }
}

function logPaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('[stripe:webhook] payment_intent.succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customerId: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
    metadata: paymentIntent.metadata,
    createdAt: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('[stripe:webhook] Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json(
      { error: 'Missing STRIPE_WEBHOOK_SECRET' },
      { status: 500 }
    )
  }

  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    const payload = await request.text()
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('[stripe:webhook] Signature verification failed', error)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        logCheckoutCompletion(event.data.object as Stripe.Checkout.Session)
        try {
          await markOrderPaid(event.data.object as Stripe.Checkout.Session)
        } catch (error) {
          console.error('[stripe:webhook] checkout.session.completed failed', {
            sessionId: (event.data.object as Stripe.Checkout.Session).id,
            error,
          })
          throw error
        }
        break
      case 'payment_intent.succeeded':
        logPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        if (orderId) {
          const adminSupabase = createSupabaseAdminClient()
          await adminSupabase.from('orders').update({ status: 'canceled' }).eq('id', orderId)
        }
        break
      }
      default:
        console.log('[stripe:webhook] ignored event', {
          type: event.type,
          id: event.id,
        })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[stripe:webhook] Failed to process event', {
      eventId: event.id,
      eventType: event.type,
      error,
    })
    return NextResponse.json({ error: 'Failed to process webhook event' }, { status: 500 })
  }
}
