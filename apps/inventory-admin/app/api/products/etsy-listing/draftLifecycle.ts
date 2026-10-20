import { EtsyApiError } from '../../etsy/etsyClient'

export type EtsyDraftFailureDisposition = 'failed' | 'partial' | 'blocked'

export function getEtsyDraftFailureDisposition(
  error: unknown,
  listingId: number | null
): EtsyDraftFailureDisposition {
  if (listingId) return 'partial'
  if (error instanceof EtsyApiError && (error.status === 400 || error.status === 422)) {
    return 'failed'
  }
  return 'blocked'
}

export function sanitizedDraftFailure(
  disposition: Exclude<EtsyDraftFailureDisposition, 'blocked'>,
  error: unknown
) {
  if (disposition === 'failed' && error instanceof EtsyApiError) {
    return `Etsy rejected the listing request (${error.status}). Review the listing fields before retrying.`
  }
  if (error instanceof EtsyApiError) {
    return `Etsy Draft creation stopped after a listing ID was assigned (HTTP ${error.status}). Resume the Draft to complete it.`
  }
  return 'Etsy Draft creation was interrupted after a listing ID was assigned. Resume the Draft to complete it.'
}

export function listingCreatedProgressPatch(
  listingId: number,
  listingPayload: unknown
) {
  return {
    etsy_listing_id: listingId,
    status: 'partial' as const,
    next_image_rank: 1,
    listing_payload: listingPayload,
    last_error: null,
  }
}

export function listingCompletedPatch(imageCount: number) {
  return {
    status: 'draft_created' as const,
    next_image_rank: imageCount + 1,
    last_error: null,
  }
}
