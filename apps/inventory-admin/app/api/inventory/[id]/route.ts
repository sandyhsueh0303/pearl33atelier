import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { logger } from '@/app/utils/logger'

/**
 * GET /api/inventory/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createAdminClient()
    
    const { data: item, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    // Get products using this inventory
    const { data: costs } = await supabase
      .from('product_costs')
      .select(`
        product_id,
        pearl_quantity,
        pearl_unit_cost,
        catalog_products (
          id,
          title,
          slug
        )
      `)
      .eq('inventory_item_id', id)
    
    return NextResponse.json({
      ...item,
      products_using: costs || []
    })
    
  } catch (error) {
    logger.error('Failed to fetch inventory item', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/inventory/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createAdminClient()
    
    const updates: any = {}
    
    if ('vendor' in body) updates.vendor = body.vendor ?? null
    if ('purchase_date' in body) updates.purchase_date = body.purchase_date ?? null
    if ('cost' in body) updates.cost = body.cost ?? null
    if ('internal_note' in body) updates.internal_note = body.internal_note ?? null
    
    // Handle quantity updates carefully
    if ('on_hand' in body) {
      const { data: current } = await supabase
        .from('inventory_items')
        .select('reserved')
        .eq('id', id)
        .single()
      
      const newOnHand = body.on_hand
      const reserved = current?.reserved || 0
      
      if (newOnHand < 0) {
        return NextResponse.json(
          { error: 'on_hand cannot be negative' },
          { status: 400 }
        )
      }
      
      updates.on_hand = newOnHand
    }
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
    
  } catch (error) {
    logger.error('Failed to update inventory', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update inventory' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/inventory/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createAdminClient()
    
    // Check if used by products
    const { data: costs } = await supabase
      .from('product_costs')
      .select('product_id')
      .eq('inventory_item_id', id)
      .limit(1)
    
    if (costs && costs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete inventory used by products' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    logger.error('Failed to delete inventory', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory' },
      { status: 500 }
    )
  }
}