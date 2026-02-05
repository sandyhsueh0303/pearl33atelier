import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { logger } from '@/app/utils/logger'

/**
 * GET /api/products/[id]/stock
 * 取得產品庫存資訊
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('product_stock')
      .select('*')
      .eq('product_id', id)
      .maybeSingle()
    
    if (error) throw error
    
    return NextResponse.json(data || {
      quantity_produced: 0,
      quantity_available: 0,
      quantity_sold: 0,
      quantity_reserved: 0
    })
    
  } catch (error) {
    logger.error('Failed to fetch stock', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products/[id]/stock/sell
 * 銷售產品
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const supabase = await createAdminClient()
    
    const quantity = parseInt(body.quantity)
    
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase.rpc('sell_product', {
      prod_id: productId,
      sell_quantity: quantity
    })
    
    if (error) throw error
    
    return NextResponse.json(data)
    
  } catch (error) {
    logger.error('Failed to sell product', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sell product' },
      { status: 500 }
    )
  }
}