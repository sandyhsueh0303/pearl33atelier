import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { logger } from '@/app/utils/logger'

/**
 * POST /api/products/[id]/produce
 * 生產產品（扣減原料，增加成品庫存）
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
    
    // 呼叫 database function
    const { data, error } = await supabase.rpc('produce_product', {
      prod_id: productId,
      produce_quantity: quantity
    })
    
    if (error) throw error
    
    return NextResponse.json(data)
    
  } catch (error) {
    logger.error('Failed to produce product', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to produce product' },
      { status: 500 }
    )
  }
}