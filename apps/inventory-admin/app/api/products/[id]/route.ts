/**
 * Single Product API
 * 
 * Endpoints:
 * - GET    /api/products/[id]     - 取得單一產品（包含圖片）
 * - PATCH  /api/products/[id]     - 更新產品資料
 * - DELETE /api/products/[id]     - 刪除產品
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@33pearlatelier/shared/types'

type ProductUpdate = Database['public']['Tables']['catalog_products']['Update']

// GET /api/products/[id] - Get single product with images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
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
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const updates: ProductUpdate = {
      title: body.title,
      note: body.note || null,
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
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Step 1: Get all product images to delete from storage
    const { data: images } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', id)

    // Step 2: Delete images from storage
    if (images && images.length > 0) {
      const paths = images.map(img => img.storage_path)
      const { error: storageError } = await supabase
        .storage
        .from('product_image')
        .remove(paths)
      
      if (storageError) {
        console.error('Failed to delete images from storage:', storageError)
        // Continue anyway, we'll delete the DB records
      }
    }

    // Step 3: Delete image records from database
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)

    if (imagesError) {
      console.error('Failed to delete image records:', imagesError)
      // Continue anyway, we'll delete the product
    }

    // Step 4: Delete product
    const { error } = await (supabase as any)
      .from('catalog_products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Product and all related images deleted successfully' 
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    )
  }
}
