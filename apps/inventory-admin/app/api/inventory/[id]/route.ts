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
    
    // Get products using this inventory (through product_materials)
    const { data: materials } = await supabase
      .from('product_materials')
      .select(`
        product_id,
        quantity_per_unit,
        catalog_products (
          id,
          title,
          slug
        )
      `)
      .eq('inventory_item_id', id)
    
    return NextResponse.json({
      ...item,
      products_using: materials || []
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
    if ('category' in body) updates.category = body.category ?? 'pearl'
    if ('purchase_date' in body) updates.purchase_date = body.purchase_date ?? null
    if ('cost' in body) updates.cost = body.cost ?? null
    if ('internal_note' in body) updates.internal_note = body.internal_note ?? null
    
    // Handle quantity updates carefully
    if ('total_quantity' in body) {
      const newTotalQuantity = body.total_quantity
      
      if (newTotalQuantity < 0) {
        return NextResponse.json(
          { error: 'total_quantity cannot be negative' },
          { status: 400 }
        )
      }
      
      updates.total_quantity = newTotalQuantity
    }
    
    // Handle allocated quantity updates
    if ('allocated_quantity' in body) {
      const newAllocatedQuantity = body.allocated_quantity
      
      if (newAllocatedQuantity < 0) {
        return NextResponse.json(
          { error: 'allocated_quantity cannot be negative' },
          { status: 400 }
        )
      }
      
      updates.allocated_quantity = newAllocatedQuantity
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
    
    // Check if used by products (through product_materials)
    const { data: materials } = await supabase
      .from('product_materials')
      .select('product_id')
      .eq('inventory_item_id', id)
      .limit(1)
    
    if (materials && materials.length > 0) {
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