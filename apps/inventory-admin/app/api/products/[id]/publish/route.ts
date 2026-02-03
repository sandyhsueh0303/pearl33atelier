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
    const { data: product, error: productError } = await supabase.rpc(
      'publish_product',
      { product_id: id }
    )

    if (productError) {
      console.error('Publish error:', productError)
      throw new Error(`Database error: ${productError.message || JSON.stringify(productError)}`)
    }

    if (!product) {
      throw new Error('Product not found')
    }

    return NextResponse.json({ 
      success: true, 
      product: product,
      message: 'Product published successfully'
    })
  } catch (error) {
    console.error('Publish product error:', error)
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
    const { data: product, error: productError } = await supabase.rpc(
      'unpublish_product',
      { product_id: id }
    )

    if (productError) {
      console.error('Unpublish error:', productError)
      throw new Error(`Database error: ${productError.message || JSON.stringify(productError)}`)
    }

    if (!product) {
      throw new Error('Product not found')
    }

    return NextResponse.json({ 
      success: true, 
      product: product,
      message: 'Product unpublished successfully'
    })
  } catch (error) {
    console.error('Unpublish product error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unpublish product' },
      { status: 500 }
    )
  }
}
