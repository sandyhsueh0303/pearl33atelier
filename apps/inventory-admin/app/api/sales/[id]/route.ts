import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase';

// GET /api/sales/[id] - Get a single sale record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAdminClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: sale, error } = await supabase
    .from('sales_records')
    .select(`
      *,
      catalog_products (
        id,
        title,
        slug
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!sale) {
    return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
  }

  return NextResponse.json(sale);
}

// PUT /api/sales/[id] - Update a sale record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAdminClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const {
    quantity,
    unit_price,
    unit_cost,
    sale_date,
    customer_name,
    order_number,
    platform,
    notes
  } = body;

  // Recalculate totals and profit if price/cost/quantity changed
  const updateData: any = {};

  if (quantity !== undefined && unit_price !== undefined && unit_cost !== undefined) {
    const total_price = parseFloat((quantity * unit_price).toFixed(2));
    const total_cost = parseFloat((quantity * unit_cost).toFixed(2));
    const profit = parseFloat((total_price - total_cost).toFixed(2));
    const profit_margin = total_price > 0 
      ? parseFloat(((profit / total_price) * 100).toFixed(2))
      : 0;

    updateData.quantity = parseInt(quantity);
    updateData.unit_price = parseFloat(unit_price);
    updateData.unit_cost = parseFloat(unit_cost);
    updateData.total_price = total_price;
    updateData.total_cost = total_cost;
    updateData.profit = profit;
    updateData.profit_margin = profit_margin;
  }

  if (sale_date !== undefined) updateData.sale_date = sale_date;
  if (customer_name !== undefined) updateData.customer_name = customer_name || null;
  if (order_number !== undefined) updateData.order_number = order_number || null;
  if (platform !== undefined) updateData.platform = platform || null;
  if (notes !== undefined) updateData.notes = notes || null;

  const { data: sale, error } = await supabase
    .from('sales_records')
    .update(updateData)
    .eq('id', id)
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
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(sale);
}

// DELETE /api/sales/[id] - Delete a sale record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAdminClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('sales_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
