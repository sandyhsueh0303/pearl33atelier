import { createSupabaseAdminClient } from './supabaseAdmin'
import { applyMaterialInventoryDelta } from './materialInventory'

interface OrderRow {
  id: string
  customer_name: string | null
  created_at: string
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

export async function syncPaidOrderToSales(orderId: string) {
  const supabase = createSupabaseAdminClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, customer_name, created_at')
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
