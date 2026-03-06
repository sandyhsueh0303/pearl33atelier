/**
 * Products API
 * 
 * Endpoints:
 * - GET    /api/products          - Get all products
 * - POST   /api/products          - Create product (draft status)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { slugify } from '@pearl33atelier/shared'
import type { Database } from '@pearl33atelier/shared/types'

type ProductInsert = Database['public']['Tables']['catalog_products']['Insert']
type PearlType = Database['public']['Enums']['pearl_type']
type ProductCategory = Database['public']['Enums']['product_category']

function normalizeSizeRange(value: unknown): string | null {
  if (value == null) return null
  const size = String(value).trim()
  if (!size) return null
  const isValid = /^\d+(\.\d+)?(-\d+(\.\d+)?)?$/.test(size)
  if (!isValid) {
    throw new Error('size_mm must be a number or range like 7, 7.5, 7-7.5, 3.5-8')
  }
  return size
}

function buildDefaultSlugFromFields(body: any, normalizedSize: string | null): string {
  const parts = [
    body?.pearl_type,
    normalizedSize,
    body?.shape,
    body?.material,
    body?.category,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
  return slugify(parts.join('-'))
}

const PEARL_TYPES: readonly PearlType[] = [
  'WhiteAkoya',
  'GreyAkoya',
  'WhiteSouthSea',
  'GoldenSouthSea',
  'Tahitian',
  'Freshwater',
  'Other',
]

const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  'BRACELETS',
  'NECKLACES',
  'EARRINGS',
  'STUDS',
  'RINGS',
  'PENDANTS',
  'LOOSE_PEARLS',
  'BROOCHES',
]

// GET /api/products - List products with server-side pagination and cost/profit calculations
export async function GET(request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize') || '30')))
    const search = (searchParams.get('search') || '').trim()
    const status = searchParams.get('status') || 'all'
    const pearlTypeParam = searchParams.get('pearlType') || 'all'
    const categoryParam = searchParams.get('category') || 'all'
    const pearlType =
      pearlTypeParam !== 'all' && PEARL_TYPES.includes(pearlTypeParam as PearlType)
        ? (pearlTypeParam as PearlType)
        : null
    const category =
      categoryParam !== 'all' && PRODUCT_CATEGORIES.includes(categoryParam as ProductCategory)
        ? (categoryParam as ProductCategory)
        : null
    const sortBy = searchParams.get('sortBy') || 'created'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const ascending = sortOrder === 'asc'

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('catalog_products')
      .select(
        'id, inventory_item_id, title, slug, description, note, pearl_type, size_mm, shape, material, sell_price, original_price, category, availability, preorder_note, published, published_at, created_at, updated_at',
        { count: 'exact' }
      )

    if (search) {
      const escaped = search.replace(/[%_]/g, '\\$&')
      query = query.or(`title.ilike.%${escaped}%,slug.ilike.%${escaped}%,description.ilike.%${escaped}%`)
    }

    if (status === 'published') query = query.eq('published', true)
    if (status === 'draft') query = query.eq('published', false)
    if (pearlType) query = query.eq('pearl_type', pearlType)
    if (category) query = query.eq('category', category)

    if (sortBy === 'title') {
      query = query.order('title', { ascending })
    } else if (sortBy === 'price') {
      query = query.order('sell_price', { ascending, nullsFirst: false })
    } else {
      query = query.order('created_at', { ascending })
    }

    const [productsResult, filterRowsResult] = await Promise.all([
      query.range(from, to),
      supabase.from('catalog_products').select('pearl_type,category'),
    ])

    const { data: products, error, count } = productsResult
    const { data: filterRows, error: filterError } = filterRowsResult
    if (error) throw error
    if (filterError) throw filterError

    // Fetch materials for all products to calculate costs
    const productIds = (products || []).map((p) => p.id)
    let materials: { product_id: string; quantity_per_unit: number; unit_cost_snapshot: number | null }[] = []
    if (productIds.length > 0) {
      const { data: materialsData, error: materialsError } = await supabase
        .from('product_materials')
        .select('product_id, quantity_per_unit, unit_cost_snapshot')
        .in('product_id', productIds)
      if (materialsError) throw materialsError
      materials = materialsData || []
    }

    // Calculate cost and profit for each product
    const productsWithStats = products?.map(product => {
      const productMaterials = materials?.filter(m => m.product_id === product.id) || []
      const totalCost = productMaterials.reduce((sum, m) => {
        return sum + (m.quantity_per_unit * (m.unit_cost_snapshot || 0))
      }, 0)
      const sellPrice = product.sell_price || 0
      const profit = sellPrice - totalCost
      
      return {
        ...product,
        total_cost: totalCost,
        profit: profit
      }
    }) || []

    const pearlTypes = Array.from(new Set((filterRows || []).map((r) => r.pearl_type).filter(Boolean)))
    const categories = Array.from(new Set((filterRows || []).map((r) => r.category).filter(Boolean)))
    const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

    return NextResponse.json({
      products: productsWithStats,
      filters: { pearlTypes, categories },
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages,
      },
    })
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
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    let normalizedSize: string | null = null
    try {
      normalizedSize = normalizeSizeRange(body.size_mm)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid size_mm format' },
        { status: 400 }
      )
    }

    // Auto-generate slug from pearl_type, size_mm, shape, material, category if not provided
    const providedSlug = String(body.slug || '').trim()
    const slug = providedSlug
      ? slugify(providedSlug)
      : buildDefaultSlugFromFields(body, normalizedSize)

    // Use nullish coalescing (??) to preserve falsy values like 0 and ''
    const productData: ProductInsert = {
      title: body.title,
      slug: slug,
      note: body.note ?? null,
      description: body.description ?? null,
      pearl_type: body.pearl_type,
      category: body.category ?? null,
      size_mm: normalizedSize,
      shape: body.shape ?? null,
      material: body.material ?? null,
      sell_price: body.sell_price ?? null,
      original_price: body.original_price ?? null,
      availability: body.availability,
      preorder_note: body.preorder_note ?? null,
      published: false,
      published_at: null,
      inventory_item_id: body.inventory_item_id ?? null
    }

    // Insert product with full type safety
    const { data, error } = await supabase
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
