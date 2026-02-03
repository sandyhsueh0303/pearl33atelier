/**
 * Products API
 * 
 * Endpoints:
 * - GET    /api/products          - 取得所有產品列表
 * - POST   /api/products          - 新增產品（草稿狀態）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@33pearlatelier/shared/types'

type ProductInsert = Database['public']['Tables']['catalog_products']['Insert']

// GET /api/products - List all products
export async function GET() {
  try {
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

    const { data, error } = await supabase
      .from('catalog_products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ products: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
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

    const productData: ProductInsert = {
      title: body.title,
      slug: body.slug,
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
      published: false,
      published_at: null,
      inventory_item_id: body.inventory_item_id || null
    }

    const { data, error } = await (supabase as any)
      .from('catalog_products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
