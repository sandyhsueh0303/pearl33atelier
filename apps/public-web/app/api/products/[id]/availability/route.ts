import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '../../../../lib/supabaseAdmin'
import { fetchProductMaterialInputs } from '../../../../lib/materialInventory'
import { computeProductInventorySummary, resolveProductAvailability } from '@pearl33atelier/shared'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseAdminClient()

    const { data: product, error } = await supabase
      .from('catalog_products')
      .select('id, published, availability')
      .eq('id', id)
      .single()

    if (error || !product || !product.published) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const materials = await fetchProductMaterialInputs(supabase, id)
    const inventorySummary = computeProductInventorySummary(materials, product.availability)
    const availability = resolveProductAvailability(product.availability, inventorySummary)

    return NextResponse.json(
      {
        availability,
        inventorySummary,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load availability' },
      { status: 500 }
    )
  }
}
