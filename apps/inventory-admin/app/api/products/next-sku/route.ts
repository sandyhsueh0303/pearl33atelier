import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { getNextProductSku } from '../route'

export async function GET() {
  try {
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const sku = await getNextProductSku(supabase)
    return NextResponse.json({ sku })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate next sku' },
      { status: 500 }
    )
  }
}
