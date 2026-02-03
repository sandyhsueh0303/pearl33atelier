/**
 * Product Publish Management API
 * 
 * Endpoints:
 * - POST   /api/products/[id]/publish - 發布產品
 *   設定 published=true, published_at=now()
 * 
 * - DELETE /api/products/[id]/publish - 取消發布產品
 *   設定 published=false, published_at=null
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'
import { logger } from '@/app/utils/logger'

// POST /api/products/[id]/publish - Publish product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createAdminClient()

    // Update product to published
    // Use Supabase RPC to let DB set published_at with now()
    // Note: (as any) needed due to Supabase type generation limitations with rpc()
    const { data: product, error: productError } = await (supabase as any).rpc(
      'publish_product',
      { product_id: id }
    )

    if (productError) {
      logger.error('Failed to publish product', productError)
      throw productError
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      product: product,
      message: 'Product published successfully'
    })
  } catch (error) {
    logger.error('Failed to publish product', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/publish - Unpublish product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createAdminClient()

    // Update product to unpublished
    // Use RPC to let DB handle published_at
    // Note: (as any) needed due to Supabase type generation limitations with rpc()
    const { data: product, error: productError } = await (supabase as any).rpc(
      'unpublish_product',
      { product_id: id }
    )

    if (productError) {
      logger.error('Failed to unpublish product', productError)
      throw productError
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      product: product,
      message: 'Product unpublished successfully'
    })
  } catch (error) {
    logger.error('Failed to unpublish product', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unpublish product' },
      { status: 500 }
    )
  }
}
