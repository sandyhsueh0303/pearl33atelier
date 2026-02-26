import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/utils/adminAuth';

// GET /api/sales - List all sales records
export async function GET(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse || !supabase) return errorResponse;

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get('sortBy') || 'sale_date';
  const order = searchParams.get('order') || 'desc';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize') || '30')));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('sales_records')
    .select(`
      *,
      catalog_products (
        id,
        title,
        slug
      )
    `, { count: 'exact' });

  // Search by customer name, order number, or platform
  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,order_number.ilike.%${search}%,platform.ilike.%${search}%`);
  }

  // Sort
  query = query.order(sortBy, { ascending: order === 'asc' });

  const { data: sales, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  return NextResponse.json({
    sales: sales || [],
    pagination: {
      page,
      pageSize,
      totalItems: count || 0,
      totalPages,
    },
  });
}

// POST /api/sales - Create a new sale record
export async function POST(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse || !supabase) return errorResponse;

  const body = await request.json();
  const {
    product_id,
    quantity,
    unit_price,
    unit_cost,
    sale_date,
    customer_name,
    order_number,
    platform,
    notes
  } = body;

  // Validate required fields
  if (!product_id || !quantity || !unit_price || unit_cost === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: product_id, quantity, unit_price, unit_cost' },
      { status: 400 }
    );
  }

  // Calculate totals and profit
  const total_price = parseFloat((quantity * unit_price).toFixed(2));
  const total_cost = parseFloat((quantity * unit_cost).toFixed(2));
  const profit = parseFloat((total_price - total_cost).toFixed(2));
  const profit_margin = total_price > 0 
    ? parseFloat(((profit / total_price) * 100).toFixed(2))
    : 0;

  const { data: sale, error } = await supabase
    .from('sales_records')
    .insert({
      product_id,
      quantity: parseInt(quantity),
      unit_price: parseFloat(unit_price),
      total_price,
      unit_cost: parseFloat(unit_cost),
      total_cost,
      profit,
      profit_margin,
      sale_date: sale_date || new Date().toISOString().split('T')[0],
      customer_name: customer_name || null,
      order_number: order_number || null,
      platform: platform || null,
      notes: notes || null,
    })
    .select(`
      *,
      catalog_products (
        id,
        title,
        slug
      )
    `)
    .single();

  if (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(sale, { status: 201 });
}
