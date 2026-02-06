import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase';

// GET /api/sales/product-cost/[productId] - Get current cost for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
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

  // Get product with its materials to calculate cost
  const { data: product, error: productError } = await supabase
    .from('catalog_products')
    .select(`
      id,
      title,
      sell_price,
      product_materials (
        quantity_per_unit,
        unit_cost_snapshot
      )
    `)
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Calculate total cost from materials
  let totalCost = 0;
  if (product.product_materials && Array.isArray(product.product_materials)) {
    totalCost = product.product_materials.reduce((sum: number, material: any) => {
      return sum + (material.quantity_per_unit * material.unit_cost_snapshot);
    }, 0);
  }

  return NextResponse.json({
    product_id: product.id,
    title: product.title,
    sell_price: product.sell_price,
    unit_cost: parseFloat(totalCost.toFixed(2)),
  });
}
