import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getProductImageUrl } from '@pearl33atelier/shared'
import { requireAdmin } from '@/app/utils/adminAuth'
import type { EtsyListingDraftRecord } from '@/app/api/etsy/etsyClient'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, errorResponse } = await requireAdmin()
  if (errorResponse || !user || !supabase) return errorResponse

  try {
    const { id: productId } = await params
    const draftId = request.nextUrl.searchParams.get('draftId')
    if (!draftId || !/^[0-9a-f-]{36}$/i.test(draftId)) {
      return NextResponse.json({ draft: null })
    }

    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRole) return NextResponse.json({ error: 'Supabase service-role key is missing.' }, { status: 503 })
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRole,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data, error } = await (admin as any)
      .from('etsy_listing_drafts')
      .select('*')
      .eq('id', draftId)
      .eq('admin_user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ draft: null })

    const record = data as EtsyListingDraftRecord
    const payload = record.listing_payload as Record<string, unknown>
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('id, storage_path, sort_order')
      .eq('product_id', productId)
      .in('id', record.image_order)
    if (imagesError) throw imagesError
    const imagesById = new Map((images || []).map((image) => [image.id, image]))

    return NextResponse.json({
      draft: {
        id: record.id,
        status: record.status,
        etsyListingId: record.etsy_listing_id,
        listing: payload,
        images: record.image_order.flatMap((imageId) => {
          const image = imagesById.get(imageId)
          return image ? [{ id: image.id, url: getProductImageUrl(image.storage_path), sortOrder: image.sort_order }] : []
        }),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to restore the Etsy Listing draft.' },
      { status: 500 }
    )
  }
}
