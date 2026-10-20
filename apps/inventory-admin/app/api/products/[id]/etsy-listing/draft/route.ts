import { NextRequest, NextResponse } from 'next/server'
import { getProductImageUrl } from '@pearl33atelier/shared'
import { requireAdmin } from '@/app/utils/adminAuth'
import {
  getEtsyListingDraft,
  type EtsyListingDraftRecord,
} from '@/app/api/etsy/etsyClient'
import { etsyListingDraftSchema } from '../../../etsy-listing/schema'

const DRAFT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const RECOVERY_STATUSES = new Set([
  'creating',
  'partial',
  'failed',
  'draft_created',
])

type RecoveryImage = {
  id: string
  storage_path: string
  sort_order: number
}

export class EtsyDraftRecoveryValidationError extends Error {}

export function buildEtsyDraftRecoveryResponse(
  record: EtsyListingDraftRecord,
  images: RecoveryImage[]
) {
  if (!RECOVERY_STATUSES.has(record.status)) {
    throw new EtsyDraftRecoveryValidationError(
      'The stored Etsy Draft has an unsupported recovery status.'
    )
  }

  const payload = record.listing_payload
  const readinessState =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>).readinessState
      : null
  if (readinessState !== 'ready_to_ship' && readinessState !== 'made_to_order') {
    throw new EtsyDraftRecoveryValidationError(
      'The stored Etsy Draft is missing a valid readiness state.'
    )
  }

  const parsed = etsyListingDraftSchema.safeParse(payload)
  if (!parsed.success) {
    throw new EtsyDraftRecoveryValidationError(
      'The stored Etsy Draft payload is not valid for recovery.'
    )
  }

  const imagesById = new Map(images.map((image) => [image.id, image]))

  return {
    id: record.id,
    status: record.status,
    etsyListingId: record.etsy_listing_id,
    nextImageRank: record.next_image_rank,
    lastError: record.last_error,
    listing: {
      ...parsed.data,
      readinessState,
    },
    images: parsed.data.imageOrder.flatMap((imageId) => {
      const image = imagesById.get(imageId)
      return image
        ? [{
            id: image.id,
            url: getProductImageUrl(image.storage_path),
            sortOrder: image.sort_order,
          }]
        : []
    }),
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, errorResponse } = await requireAdmin()
  if (errorResponse || !user || !supabase) return errorResponse

  try {
    const { id: productId } = await params
    const draftId = request.nextUrl.searchParams.get('draftId')
    if (!draftId || !DRAFT_ID_PATTERN.test(draftId)) {
      return NextResponse.json({ draft: null })
    }

    const hasServiceRole = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)
    )
    if (!hasServiceRole) {
      return NextResponse.json(
        { error: 'Supabase service-role configuration is missing.' },
        { status: 503 }
      )
    }

    const record = await getEtsyListingDraft(draftId, user.id, productId)
    if (!record) return NextResponse.json({ draft: null })

    const payload = record.listing_payload
    const parsedPayload = etsyListingDraftSchema.safeParse(payload)
    if (!parsedPayload.success) {
      throw new EtsyDraftRecoveryValidationError(
        'The stored Etsy Draft payload is not valid for recovery.'
      )
    }
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('id, storage_path, sort_order')
      .eq('product_id', productId)
      .in('id', parsedPayload.data.imageOrder)
    if (imagesError) throw imagesError

    return NextResponse.json({
      draft: buildEtsyDraftRecoveryResponse(
        record,
        (images || []) as RecoveryImage[]
      ),
    })
  } catch (error) {
    if (error instanceof EtsyDraftRecoveryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json(
      { error: 'Failed to restore the Etsy Listing draft.' },
      { status: 500 }
    )
  }
}
