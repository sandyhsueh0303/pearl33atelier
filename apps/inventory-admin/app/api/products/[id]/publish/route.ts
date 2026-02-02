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
import { createSupabaseClient } from '@33pearlatelier/shared/supabase'

// POST /api/products/[id]/publish - Publish product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Update product to published
    const { data: product, error: productError } = await (supabase as any)
      .from('catalog_products')
      .update({
        published: true,
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (productError) {
      console.error('Publish error:', productError)
      throw new Error(`Database error: ${productError.message || JSON.stringify(productError)}`)
    }

    if (!product || product.length === 0) {
      throw new Error('Product not found')
    }

    return NextResponse.json({ 
      success: true, 
      product: product[0],
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
    
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if product exists
    const { data: existingProduct, error: checkError } = await (supabase as any)
      .from('catalog_products')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError || !existingProduct) {
      throw new Error('Product not found')
    }

    // Update product to unpublished
    const { data: product, error: productError } = await (supabase as any)
      .from('catalog_products')
      .update({
        published: false,
        published_at: null
      })
      .eq('id', id)
      .select()

    if (productError) {
      console.error('Unpublish error:', productError)
      throw new Error(`Database error: ${productError.message || JSON.stringify(productError)}`)
    }

    if (!product || product.length === 0) {
      throw new Error('Product not found')
    }

    return NextResponse.json({ 
      success: true, 
      product: product[0],
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
