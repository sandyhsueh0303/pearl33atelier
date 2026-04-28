import { createSupabaseAdminClient } from './supabaseAdmin'
import { applyMaterialInventoryDelta } from './materialInventory'

interface OrderRow {
  id: string
  customer_name: string | null
  created_at: string
  metadata: unknown
}

interface OrderItemRow {
  id: string
  order_id: string
  product_id: string | null
  product_title_snapshot: string
  unit_price_amount_cents: number
  quantity: number
  line_total_amount_cents: number
}

interface PendingCheckoutItem {
  product_id: string
  product_slug_snapshot: string | null
  product_title_snapshot: string
  unit_price_amount_cents: number
  quantity: number
  line_total_amount_cents: number
}

function extractPendingCheckoutItems(metadata: unknown): PendingCheckoutItem[] {
  if (!metadata || typeof metadata !== 'object') {
    return []
  }

  const checkoutItems = (metadata as { checkout_items?: unknown }).checkout_items

  if (!Array.isArray(checkoutItems)) {
    return []
  }

  return checkoutItems
    .map((item): PendingCheckoutItem | null => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const candidate = item as Partial<PendingCheckoutItem>

      if (
        typeof candidate.product_id !== 'string' ||
        typeof candidate.product_title_snapshot !== 'string' ||
        typeof candidate.unit_price_amount_cents !== 'number' ||
        typeof candidate.quantity !== 'number' ||
        typeof candidate.line_total_amount_cents !== 'number'
      ) {
        return null
      }

      return {
        product_id: candidate.product_id,
        product_slug_snapshot:
          typeof candidate.product_slug_snapshot === 'string'
            ? candidate.product_slug_snapshot
            : null,
        product_title_snapshot: candidate.product_title_snapshot,
        unit_price_amount_cents: candidate.unit_price_amount_cents,
        quantity: candidate.quantity,
        line_total_amount_cents: candidate.line_total_amount_cents,
      }
    })
    .filter((item): item is PendingCheckoutItem => Boolean(item))
}

async function loadPendingCheckoutItems(orderId: string) {
  const supabase = createSupabaseAdminClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, metadata')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new Error(`Order ${orderId} not found for item sync: ${orderError?.message || 'unknown error'}`)
  }

  const checkoutItems = extractPendingCheckoutItems(order.metadata)

  if (checkoutItems.length === 0) {
    throw new Error(`Order ${orderId} is missing checkout item snapshots`)
  }

  return checkoutItems
}

async function getUnitCost(productId: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('product_materials')
    .select('quantity_per_unit, unit_cost_snapshot')
    .eq('product_id', productId)

  if (error) {
    throw new Error(`Failed to fetch unit cost for product ${productId}: ${error.message}`)
  }

  return ((data || []) as Array<{ quantity_per_unit: number; unit_cost_snapshot: number | null }>)
    .reduce((sum, material) => {
      return sum + (material.quantity_per_unit * (material.unit_cost_snapshot || 0))
    }, 0)
}

export async function ensureOrderItemsForPaidOrder(orderId: string) {
  const supabase = createSupabaseAdminClient()

  const { data: existingItems, error: existingItemsError } = await supabase
    .from('order_items')
    .select('id')
    .eq('order_id', orderId)
    .limit(1)

  if (existingItemsError) {
    throw new Error(`Failed to check existing order items for ${orderId}: ${existingItemsError.message}`)
  }

  if ((existingItems || []).length > 0) {
    return
  }

  const checkoutItems = await loadPendingCheckoutItems(orderId)

  const { error: insertError } = await supabase.from('order_items').insert(
    checkoutItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_slug_snapshot: item.product_slug_snapshot,
      product_title_snapshot: item.product_title_snapshot,
      unit_price_amount_cents: item.unit_price_amount_cents,
      quantity: item.quantity,
      line_total_amount_cents: item.line_total_amount_cents,
    }))
  )

  if (insertError) {
    throw new Error(`Failed to create paid order items for ${orderId}: ${insertError.message}`)
  }
}

export async function syncPaidOrderToSales(orderId: string) {
  const supabase = createSupabaseAdminClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, customer_name, created_at, metadata')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new Error(`Order ${orderId} not found: ${orderError?.message || 'unknown error'}`)
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_title_snapshot, unit_price_amount_cents, quantity, line_total_amount_cents')
    .eq('order_id', orderId)

  if (itemsError) {
    throw new Error(`Failed to load order items for ${orderId}: ${itemsError.message}`)
  }

  for (const item of (orderItems || []) as OrderItemRow[]) {
    if (!item.product_id) {
      continue
    }

    const { data: existingSale, error: existingSaleError } = await supabase
      .from('sales_records')
      .select('id')
      .eq('source_order_item_id', item.id)
      .maybeSingle()

    if (existingSaleError) {
      throw new Error(`Failed to check sales sync for order item ${item.id}: ${existingSaleError.message}`)
    }

    if (existingSale) {
      continue
    }

    const unitCost = Number((await getUnitCost(item.product_id)).toFixed(2))
    const unitPrice = Number((item.unit_price_amount_cents / 100).toFixed(2))
    const totalPrice = Number((item.line_total_amount_cents / 100).toFixed(2))
    const totalCost = Number((unitCost * item.quantity).toFixed(2))
    const profit = Number((totalPrice - totalCost).toFixed(2))
    const profitMargin = totalPrice > 0 ? Number(((profit / totalPrice) * 100).toFixed(2)) : 0

    await applyMaterialInventoryDelta(supabase, item.product_id, item.quantity)

    const { error: insertError } = await supabase.from('sales_records').insert({
      product_id: item.product_id,
      source_order_item_id: item.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      unit_cost: unitCost,
      total_cost: totalCost,
      profit,
      profit_margin: profitMargin,
      sale_date: order.created_at.split('T')[0],
      customer_name: order.customer_name,
      platform: 'Stripe',
      notes: `Synced from order ${order.id}`,
    })

    if (insertError) {
      await applyMaterialInventoryDelta(supabase, item.product_id, -item.quantity)
      throw new Error(`Failed to create sales record for order item ${item.id}: ${insertError.message}`)
    }
  }
}
