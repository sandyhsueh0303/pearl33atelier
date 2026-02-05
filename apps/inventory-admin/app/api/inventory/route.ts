import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { logger } from '@/app/utils/logger'

/**
 * GET /api/inventory
 * List all inventory items with summary
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('purchase_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Transform and calculate stats
    const transformed = items?.map(item => {
      const quantity_total = (item.on_hand || 0) + (item.reserved || 0)
      const unit_cost = item.cost || 0
      
      return {
        ...item,
        quantity_total,
        quantity_available: item.on_hand || 0,
        quantity_used: item.reserved || 0,
        unit_cost,
        total_value: quantity_total * unit_cost,
        remaining_value: (item.on_hand || 0) * unit_cost
      }
    }) || []
    
    // Summary stats
    const summary = {
      total_items: transformed.length,
      total_quantity: transformed.reduce((sum, i) => sum + i.quantity_total, 0),
      available_quantity: transformed.reduce((sum, i) => sum + i.quantity_available, 0),
      total_value: transformed.reduce((sum, i) => sum + i.total_value, 0),
      remaining_value: transformed.reduce((sum, i) => sum + i.remaining_value, 0)
    }
    
    return NextResponse.json({ items: transformed, summary })
    
  } catch (error) {
    logger.error('Failed to fetch inventory', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory
 * Create new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createAdminClient()
    
    // Validate
    if (!body.cost || !body.on_hand) {
      return NextResponse.json(
        { error: 'Missing required fields: cost, on_hand' },
        { status: 400 }
      )
    }
    
    const data = {
      vendor: body.vendor || null,
      purchase_date: body.purchase_date || null,
      cost: body.cost,
      on_hand: body.on_hand,
      reserved: 0,
      internal_note: body.internal_note || null
    }
    
    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(item, { status: 201 })
    
  } catch (error) {
    logger.error('Failed to create inventory', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create inventory' },
      { status: 500 }
    )
  }
}