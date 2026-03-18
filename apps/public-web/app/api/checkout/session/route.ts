import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import { computeProductInventorySummary, resolveProductAvailability } from '@pearl33atelier/shared'
import { stripe } from '../../../lib/stripe'
import { createSupabaseAdminClient } from '../../../lib/supabaseAdmin'
import { fetchProductMaterialInputs } from '../../../lib/materialInventory'

interface CheckoutItemInput {
  id: string
  quantity: number
}

interface ProductRow {
  id: string
  title: string
  slug: string
  sell_price: number | null
  published: boolean
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER'
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'

export async function POST(request: NextRequest) {
  let createdOrderId: string | null = null

  try {
    const body = (await request.json()) as { items?: unknown[] }
    const rawItems: unknown[] = Array.isArray(body?.items) ? body.items : []

    const items = rawItems
      .map((item): CheckoutItemInput | null => {
        if (!item || typeof item !== 'object') return null
        const candidate = item as Partial<CheckoutItemInput>
        const id = typeof candidate.id === 'string' ? candidate.id.trim() : ''
        const quantity =
          typeof candidate.quantity === 'number' ? Math.floor(candidate.quantity) : Number.NaN
        if (!id || !Number.isFinite(quantity) || quantity <= 0) return null
        return { id, quantity }
      })
      .filter((item): item is CheckoutItemInput => Boolean(item))

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 })
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const productIds = [...new Set(items.map((item) => item.id))]
    const { data: products, error } = await supabase
      .from('catalog_products')
      .select('id, title, slug, sell_price, published, availability')
      .in('id', productIds)

    if (error) {
      return NextResponse.json({ error: 'Failed to load cart products.' }, { status: 500 })
    }

    const productById = new Map(
      ((products || []) as ProductRow[]).map((product) => [product.id, product] as const)
    )

    const normalizedItems = items.map((item) => {
      const product = productById.get(item.id)

      if (!product || !product.published) {
        throw new Error('One or more cart items are unavailable.')
      }

      if (typeof product.sell_price !== 'number' || product.sell_price <= 0) {
        throw new Error(`"${product.title}" does not have a valid online checkout price.`)
      }

      if (product.availability === 'OUT_OF_STOCK') {
        throw new Error(`"${product.title}" is sold out.`)
      }

      const unitAmount = Math.round(product.sell_price * 100)

      return {
        product,
        quantity: item.quantity,
        unitAmount,
        lineTotalAmount: unitAmount * item.quantity,
      }
    })

    const adminSupabase = createSupabaseAdminClient()

    for (const item of normalizedItems) {
      if (item.product.availability === 'PREORDER') {
        continue
      }

      const materials = await fetchProductMaterialInputs(adminSupabase, item.product.id)
      const inventorySummary = computeProductInventorySummary(materials, item.product.availability)
      const effectiveAvailability = resolveProductAvailability(item.product.availability, inventorySummary)

      if (effectiveAvailability === 'OUT_OF_STOCK') {
        throw new Error(`"${item.product.title}" is sold out.`)
      }

      if (
        inventorySummary.tracked &&
        inventorySummary.availableQuantity !== null &&
        item.quantity > inventorySummary.availableQuantity
      ) {
        const limitingMessage = inventorySummary.limitingMaterialName
          ? ` Limited by ${inventorySummary.limitingMaterialName}.`
          : ''
        throw new Error(
          `"${item.product.title}" only has ${inventorySummary.availableQuantity} available for checkout.${limitingMessage}`
        )
      }
    }

    const lineItems = normalizedItems.map((item) => {
      return {
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: item.unitAmount,
          product_data: {
            name: item.product.title,
            metadata: {
              product_id: item.product.id,
              slug: item.product.slug,
            },
          },
        },
      }
    })

    const subtotalAmount = normalizedItems.reduce((sum, item) => sum + item.lineTotalAmount, 0)
    const orderId = crypto.randomUUID()
    createdOrderId = orderId

    const { error: orderError } = await adminSupabase.from('orders').insert({
      id: orderId,
      status: 'pending',
      currency: 'usd',
      subtotal_amount_cents: subtotalAmount,
      total_amount_cents: subtotalAmount,
      order_source: 'public_web',
      metadata: {
        source: 'public-web-cart',
      },
    })

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    const { error: orderItemsError } = await adminSupabase.from('order_items').insert(
      normalizedItems.map((item) => ({
        order_id: orderId,
        product_id: item.product.id,
        product_slug_snapshot: item.product.slug,
        product_title_snapshot: item.product.title,
        unit_price_amount_cents: item.unitAmount,
        quantity: item.quantity,
        line_total_amount_cents: item.lineTotalAmount,
      }))
    )

    if (orderItemsError) {
      throw new Error(`Failed to create order items: ${orderItemsError.message}`)
    }

    const headersList = await headers()
    const origin = headersList.get('origin') || SITE_URL

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?checkout=cancelled`,
      automatic_tax: { enabled: true },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        source: 'public-web-cart',
        order_id: orderId,
        cart_item_count: String(items.length),
      },
    })

    const { error: sessionUpdateError } = await adminSupabase
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq('id', orderId)

    if (sessionUpdateError) {
      throw new Error(`Failed to store checkout session: ${sessionUpdateError.message}`)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[checkout/session] Failed to create checkout session', error)

    if (createdOrderId) {
      try {
        const adminSupabase = createSupabaseAdminClient()
        await adminSupabase.from('orders').delete().eq('id', createdOrderId)
      } catch {
        // Ignore cleanup errors and return the original checkout failure.
      }
    }

    const safeMessage =
      error instanceof Error &&
      (
        error.message === 'Cart is empty.' ||
        error.message === 'One or more cart items are unavailable.' ||
        error.message.includes('does not have a valid online checkout price') ||
        error.message.includes('is sold out.') ||
        error.message.includes('available for checkout')
      )
        ? error.message
        : 'Unable to start checkout right now. Please try again shortly.'

    return NextResponse.json({ error: safeMessage }, { status: 500 })
  }
}
