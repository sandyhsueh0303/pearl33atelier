/**
 * Single Product API
 * 
 * Endpoints:
 * - GET    /api/products/[id]     - 取得單一產品（包含圖片）
 * - PATCH  /api/products/[id]     - 更新產品資料
 * - DELETE /api/products/[id]     - 刪除產品
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@33pearlatelier/shared/supabase'
import type { Database } from '@33pearlatelier/shared/types'

type ProductUpdate = Database['public']['Tables']['catalog_products']['Update']

// GET /api/products/[id] - Get single product with images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: product, error: productError } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('id', id)
      .single()

    if (productError) throw productError

    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true })

    if (imagesError) throw imagesError

    return NextResponse.json({ product, images })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const updates: ProductUpdate = {
      title: body.title,
      description: body.description || null,
      pearl_type: body.pearl_type,
      size_mm: body.size_mm || null,
      shape: body.shape || null,
      material: body.material || null,
      sell_price: body.sell_price || null,
      original_price: body.original_price || null,
      availability: body.availability,
      preorder_note: body.preorder_note || null,
      inventory_item_id: body.inventory_item_id || null
    }

    const { data, error } = await (supabase as any)
      .from('catalog_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product
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

    const { error } = await (supabase as any)
      .from('catalog_products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    )
  }
}
