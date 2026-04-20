import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { generateProductSeo, type ProductSeoDraftInput } from '../../seo'

type ProductImageRecord = {
  storage_path: string
  is_primary: boolean
  published: boolean
  sort_order: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const body = (await request.json()) as ProductSeoDraftInput
    if (!String(body.title || '').trim()) {
      return NextResponse.json({ error: 'title is required to generate SEO' }, { status: 400 })
    }

    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('storage_path, is_primary, published, sort_order')
      .eq('product_id', id)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })
      .returns<ProductImageRecord[]>()

    if (imagesError) throw imagesError

    const preferredImage =
      (images || []).find((image) => image.is_primary && image.published) ||
      (images || []).find((image) => image.published) ||
      (images || [])[0] ||
      null

    const seo = await generateProductSeo(body, preferredImage?.storage_path || null)

    return NextResponse.json({ seo })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate SEO' },
      { status: 500 }
    )
  }
}
