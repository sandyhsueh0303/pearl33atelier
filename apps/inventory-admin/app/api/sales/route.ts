import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/utils/adminAuth';

const parseOptionalOrderNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? NaN : parsed;
};

// GET /api/sales - List all sales records
export async function GET(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse || !supabase) return errorResponse;

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get('sortBy') || 'order_number';
  const order = searchParams.get('order') || 'desc';
  const search = (searchParams.get('search') || '').trim();
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize') || '30')));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const ascending = order === 'asc';
  const allowedSortFields = new Set(['order_number', 'total_price', 'profit', 'customer_name', 'sale_date']);
  const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : 'order_number';

  let baseQuery = supabase
    .from('sales_records')
    .select(`
      *,
      catalog_products (
        id,
        title,
        slug
      )
    `, { count: 'exact' });

  // Without search, keep DB-level filtering/pagination for performance.
  if (!search) {
    const query = baseQuery.order(safeSortBy, { ascending });
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

  // With search, fetch full set then filter in-memory so search can include related product title/slug.
  const { data: allSales, error } = await baseQuery.order(safeSortBy, { ascending });

  if (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const q = search.toLowerCase();
  const filtered = (allSales || []).filter((sale: any) => {
    const customer = String(sale.customer_name || '').toLowerCase();
    const platform = String(sale.platform || '').toLowerCase();
    const orderNumber = String(sale.order_number ?? '').toLowerCase();
    const productTitle = String(sale.catalog_products?.title || '').toLowerCase();
    const productSlug = String(sale.catalog_products?.slug || '').toLowerCase();

    return (
      customer.includes(q) ||
      platform.includes(q) ||
      orderNumber.includes(q) ||
      productTitle.includes(q) ||
      productSlug.includes(q)
    );
  });

  const paginated = filtered.slice(from, to + 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  return NextResponse.json({
    sales: paginated,
    pagination: {
      page,
      pageSize,
      totalItems: filtered.length,
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
  const parsedOrderNumber = parseOptionalOrderNumber(order_number);

  if (Number.isNaN(parsedOrderNumber)) {
    return NextResponse.json({ error: 'order_number must be a valid number' }, { status: 400 });
  }

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
      order_number: parsedOrderNumber,
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
