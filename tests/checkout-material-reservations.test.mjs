import assert from 'node:assert/strict'
import test from 'node:test'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_TEST_URL
const serviceRoleKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  test('checkout reservations require an explicitly configured test database', { skip: true }, () => {})
} else {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  async function requireSuccess(result, context) {
    if (result.error) {
      throw new Error(`${context}: ${result.error.message}`)
    }
    return result.data
  }

  async function createPendingOrder(productId, suffix) {
    const orderId = randomUUID()
    await requireSuccess(
      await supabase.from('orders').insert({
        id: orderId,
        order_number: `CONCURRENCY-${suffix}`,
        status: 'pending',
        currency: 'usd',
        subtotal_amount_cents: 100,
        shipping_fee_cents: 0,
        tax_amount_cents: 0,
        total_amount_cents: 100,
        order_source: 'concurrency_test',
        metadata: {},
      }),
      'create pending order'
    )
    await requireSuccess(
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: productId,
        product_title_snapshot: 'Concurrency test product',
        product_slug_snapshot: `concurrency-test-${suffix}`,
        unit_price_amount_cents: 100,
        quantity: 1,
        line_total_amount_cents: 100,
      }),
      'create pending order item'
    )
    return orderId
  }

  test('only one concurrent checkout can reserve the final material unit', async () => {
    const testId = randomUUID()
    const productId = randomUUID()
    const inventoryItemId = randomUUID()
    const firstOrderId = randomUUID()
    const secondOrderId = randomUUID()

    try {
      await requireSuccess(
        await supabase.from('inventory_items').insert({
          id: inventoryItemId,
          name: `Concurrency material ${testId}`,
          cost: 1,
          total_quantity: 1,
          allocated_quantity: 0,
          reserved_quantity: 0,
        }),
        'create inventory fixture'
      )

      await requireSuccess(
        await supabase.from('catalog_products').insert({
          id: productId,
          title: `Concurrency test product ${testId}`,
          slug: `concurrency-test-${testId}`,
          pearl_type: 'WhiteAkoya',
          sell_price: 1,
          availability: 'IN_STOCK',
        }),
        'create product fixture'
      )

      await requireSuccess(
        await supabase.from('product_materials').insert({
          product_id: productId,
          inventory_item_id: inventoryItemId,
          quantity_per_unit: 1,
        }),
        'create product material fixture'
      )

      for (const [orderId, suffix] of [[firstOrderId, 'A'], [secondOrderId, 'B']]) {
        await requireSuccess(
          await supabase.from('orders').insert({
            id: orderId,
            order_number: `CONCURRENCY-${testId}-${suffix}`,
            status: 'pending',
            currency: 'usd',
            subtotal_amount_cents: 100,
            shipping_fee_cents: 0,
            tax_amount_cents: 0,
            total_amount_cents: 100,
            order_source: 'concurrency_test',
            metadata: {},
          }),
          'create pending order'
        )
        await requireSuccess(
          await supabase.from('order_items').insert({
            order_id: orderId,
            product_id: productId,
            product_title_snapshot: 'Concurrency test product',
            product_slug_snapshot: `concurrency-test-${testId}`,
            unit_price_amount_cents: 100,
            quantity: 1,
            line_total_amount_cents: 100,
          }),
          'create pending order item'
        )
      }

      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      const results = await Promise.all([
        supabase.rpc('reserve_order_materials', {
          p_order_id: firstOrderId,
          p_expires_at: expiresAt,
        }),
        supabase.rpc('reserve_order_materials', {
          p_order_id: secondOrderId,
          p_expires_at: expiresAt,
        }),
      ])

      const successCount = results.filter((result) => !result.error).length
      const inventoryError = results.find((result) => result.error)?.error
      assert.equal(successCount, 1)
      assert.match(inventoryError?.message || '', /INSUFFICIENT_INVENTORY/)

      const inventory = await requireSuccess(
        await supabase
          .from('inventory_items')
          .select('total_quantity, allocated_quantity, reserved_quantity')
          .eq('id', inventoryItemId)
          .single(),
        'read inventory result'
      )
      assert.deepEqual(inventory, {
        total_quantity: 1,
        allocated_quantity: 0,
        reserved_quantity: 1,
      })

      const reservations = await requireSuccess(
        await supabase
          .from('order_material_reservations')
          .select('order_id, status')
          .in('order_id', [firstOrderId, secondOrderId]),
        'read reservation result'
      )
      assert.equal(reservations.length, 1)
      assert.equal(reservations[0].status, 'active')
    } finally {
      await supabase.from('orders').delete().in('id', [firstOrderId, secondOrderId])
      await supabase.from('product_materials').delete().eq('product_id', productId)
      await supabase.from('catalog_products').delete().eq('id', productId)
      await supabase.from('inventory_items').delete().eq('id', inventoryItemId)
    }
  })
}
