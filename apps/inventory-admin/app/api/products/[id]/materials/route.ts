import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'

/**
 * GET /api/products/[id]/materials
 * Get product materials list
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
    const { data, error } = await supabase
      .from('product_materials')
      .select(`
        *,
        inventory_items (
          id,
          name,
          cost,
          total_quantity,
          internal_note
        )
      `)
      .eq('product_id', id)
      .order('sort_order')
    
    if (error) throw error
    
    return NextResponse.json(data || [])
    
  } catch (error) {
    logger.error('Failed to fetch product materials', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products/[id]/materials
 * Add material
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
    const data = {
      product_id: productId,
      inventory_item_id: body.inventory_item_id,
      quantity_per_unit: body.quantity_per_unit || 1,
      unit_cost_snapshot: body.unit_cost_snapshot,
      sort_order: body.sort_order || 0,
      notes: body.notes || null
    }
    
    const { data: material, error } = await supabase
      .from('product_materials')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(material, { status: 201 })
    
  } catch (error) {
    logger.error('Failed to add material', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add material' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]/materials/[materialId]
 * Delete material
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('materialId')
    
    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID required' },
        { status: 400 }
      )
    }
    
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
    const { error } = await supabase
      .from('product_materials')
      .delete()
      .eq('id', materialId)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    logger.error('Failed to delete material', error)
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    )
  }
}
