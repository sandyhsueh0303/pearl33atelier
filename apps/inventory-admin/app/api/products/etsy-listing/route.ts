import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const page = positiveInteger(request.nextUrl.searchParams.get('page'), 1)
    const pageSize = Math.min(
      positiveInteger(request.nextUrl.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE
    )
    const search = (request.nextUrl.searchParams.get('search') || '').trim().slice(0, 100)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('catalog_products')
      .select('id,sku,title,category,published', { count: 'exact' })

    if (search) {
      const escaped = search.replace(/[%_]/g, '\\$&')
      query = query.or(`title.ilike.%${escaped}%,sku.ilike.%${escaped}%`)
    }

    const { data, error, count } = await query
      .order('title', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to)

    if (error) throw error

    const totalItems = count || 0
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    return NextResponse.json({
      products: data || [],
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    })
  } catch (error) {
    console.error('GET /api/products/etsy-listing failed:', error)
    return NextResponse.json(
      { error: 'Failed to load products for Etsy Listing.' },
      { status: 500 }
    )
  }
}
