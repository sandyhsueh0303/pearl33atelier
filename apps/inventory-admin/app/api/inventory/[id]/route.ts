import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'
import type { Database } from '@pearl33atelier/shared/types'

type InventoryUpdate = Database['public']['Tables']['inventory_items']['Update']

/**
 * GET /api/inventory/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await _request.json()
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
    const updates: InventoryUpdate = {}

    const { data: currentItem, error: currentItemError } = await supabase
      .from('inventory_items')
      .select('total_quantity, allocated_quantity')
      .eq('id', id)
      .single()

    if (currentItemError || !currentItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }
    
    if ('name' in body) updates.name = body.name ?? null
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

    const nextTotalQuantity = updates.total_quantity ?? currentItem.total_quantity ?? 0
    const nextAllocatedQuantity = updates.allocated_quantity ?? currentItem.allocated_quantity ?? 0
    if (nextAllocatedQuantity > nextTotalQuantity) {
      return NextResponse.json(
        { error: 'allocated_quantity cannot be greater than total_quantity' },
        { status: 400 }
      )
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
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
