import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'

/**
 * GET /api/inventory
 * List all inventory items with summary
 */
export async function GET(_request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const searchParams = _request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize') || '30')))
    const search = searchParams.get('search')?.trim() || ''
    const category = searchParams.get('category') || 'all'
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const ascending = sortOrder === 'asc'

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const escapedSearch = search ? search.replace(/[%_]/g, '\\$&') : ''

    let query = supabase
      .from('inventory_items')
      .select('*', { count: 'exact' })

    if (escapedSearch) {
      query = query.or(`name.ilike.%${escapedSearch}%,internal_note.ilike.%${escapedSearch}%`)
    }

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    if (sortBy === 'quantity') {
      query = query.order('total_quantity', { ascending })
    } else if (sortBy === 'value') {
      query = query.order('cost', { ascending })
    } else {
      query = query
        .order('purchase_date', { ascending, nullsFirst: false })
        .order('created_at', { ascending: false })
    }

    // Build filtered summary with lightweight columns only.
    let summaryQuery = supabase
      .from('inventory_items')
      .select('total_quantity,allocated_quantity,cost')

    if (escapedSearch) {
      summaryQuery = summaryQuery.or(`name.ilike.%${escapedSearch}%,internal_note.ilike.%${escapedSearch}%`)
    }
    if (category !== 'all') {
      summaryQuery = summaryQuery.eq('category', category)
    }

    const [itemsResult, summaryResult] = await Promise.all([
      query.range(from, to),
      summaryQuery,
    ])

    const { data: items, error, count } = itemsResult
    const { data: summaryRows, error: summaryError } = summaryResult

    if (error) throw error
    if (summaryError) throw summaryError

    // Transform and calculate stats
    const transformed = items?.map(item => {
      const quantity_total = item.total_quantity || 0  // total = total inventory quantity (purchased quantity)
      const quantity_available = (item.total_quantity || 0) - (item.allocated_quantity || 0)  // available = total - allocated
      const unit_cost = item.cost || 0
      
      return {
        ...item,
        quantity_total,
        quantity_available,
        quantity_used: item.allocated_quantity || 0,
        unit_cost,
        total_value: quantity_total * unit_cost,  // total value = total x unit cost
        remaining_value: quantity_available * unit_cost  // remaining value = available x unit cost
      }
    }) || []
    
    // Summary stats
    const summaryBase = summaryRows || []
    const summary = {
      total_items: count || summaryBase.length,
      total_quantity: summaryBase.reduce((sum, i) => sum + (i.total_quantity || 0), 0),
      available_quantity: summaryBase.reduce(
        (sum, i) => sum + ((i.total_quantity || 0) - (i.allocated_quantity || 0)),
        0
      ),
      total_value: summaryBase.reduce((sum, i) => sum + ((i.total_quantity || 0) * (i.cost || 0)), 0),
      remaining_value: summaryBase.reduce(
        (sum, i) => sum + (((i.total_quantity || 0) - (i.allocated_quantity || 0)) * (i.cost || 0)),
        0
      )
    }

    const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

    return NextResponse.json({
      items: transformed,
      summary,
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages,
      },
    })
    
  } catch (error) {
    logger.error('Failed to fetch inventory', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory
 * Create new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    
    // Validate
    if (body.cost == null || body.total_quantity == null) {
      return NextResponse.json(
        { error: 'Missing required fields: cost, total_quantity' },
        { status: 400 }
      )
    }
    
    const totalQuantity = Number(body.total_quantity ?? 0)
    const allocatedQuantity = Number(body.allocated_quantity ?? 0)

    if (totalQuantity < 0 || !Number.isFinite(totalQuantity)) {
      return NextResponse.json(
        { error: 'total_quantity must be a non-negative number' },
        { status: 400 }
      )
    }

    if (allocatedQuantity < 0 || !Number.isFinite(allocatedQuantity)) {
      return NextResponse.json(
        { error: 'allocated_quantity must be a non-negative number' },
        { status: 400 }
      )
    }

    if (allocatedQuantity > totalQuantity) {
      return NextResponse.json(
        { error: 'allocated_quantity cannot be greater than total_quantity' },
        { status: 400 }
      )
    }

    const data = {
      name: body.name || null,
      category: body.category || 'pearl',
      purchase_date: body.purchase_date || null,
      cost: body.cost,
      total_quantity: totalQuantity,
      allocated_quantity: allocatedQuantity,
      internal_note: body.internal_note || null
    }
    
    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(item, { status: 201 })
    
  } catch (error) {
    logger.error('Failed to create inventory', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create inventory' },
      { status: 500 }
    )
  }
}
