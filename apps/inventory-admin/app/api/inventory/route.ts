import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'

/**
 * GET /api/inventory
 * List all inventory items with summary
 */
export async function GET(_request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('purchase_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Transform and calculate stats
    const transformed = items?.map(item => {
      const quantity_total = item.total_quantity || 0  // total = total inventory quantity (purchased quantity)
      const quantity_available = (item.total_quantity || 0) - (item.allocated_quantity || 0)  // available = total - allocated
      const unit_cost = item.cost || 0
      
      return {
        ...item,
        quantity_total,
        quantity_available,
        quantity_used: item.allocated_quantity || 0,
        unit_cost,
        total_value: quantity_total * unit_cost,  // total value = total x unit cost
        remaining_value: quantity_available * unit_cost  // remaining value = available x unit cost
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
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
    // Validate
    if (body.cost == null || body.total_quantity == null) {
      return NextResponse.json(
        { error: 'Missing required fields: cost, total_quantity' },
        { status: 400 }
      )
    }
    
    const totalQuantity = Number(body.total_quantity ?? 0)
    const allocatedQuantity = Number(body.allocated_quantity ?? 0)

    if (totalQuantity < 0 || !Number.isFinite(totalQuantity)) {
      return NextResponse.json(
        { error: 'total_quantity must be a non-negative number' },
        { status: 400 }
      )
    }

    if (allocatedQuantity < 0 || !Number.isFinite(allocatedQuantity)) {
      return NextResponse.json(
        { error: 'allocated_quantity must be a non-negative number' },
        { status: 400 }
      )
    }

    if (allocatedQuantity > totalQuantity) {
      return NextResponse.json(
        { error: 'allocated_quantity cannot be greater than total_quantity' },
        { status: 400 }
      )
    }

    const data = {
      vendor: body.vendor || null,
      category: body.category || 'pearl',
      purchase_date: body.purchase_date || null,
      cost: body.cost,
      total_quantity: totalQuantity,
      allocated_quantity: allocatedQuantity,
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
