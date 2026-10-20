import type { EtsyListingDraft } from './schema'
import {
  ETSY_DIMENSION_UNITS,
  ETSY_WEIGHT_UNITS,
} from '@/app/lib/etsyListingPackage'

export function buildEtsyListingForm(
  draft: EtsyListingDraft,
  options: { includeQuantity: boolean }
) {
  const form = new URLSearchParams({
    title: draft.title,
    description: draft.description,
    price: String(draft.price),
    who_made: draft.whoMade,
    when_made: draft.whenMade,
    taxonomy_id: String(draft.taxonomyId),
    is_supply: String(draft.isSupply),
    type: 'physical',
    shipping_profile_id: String(draft.shippingProfileId),
    readiness_state_id: String(draft.readinessStateId),
    item_weight: String(draft.itemWeight),
    item_weight_unit: draft.itemWeightUnit,
    item_length: String(draft.itemLength),
    item_width: String(draft.itemWidth),
    item_height: String(draft.itemHeight),
    item_dimensions_unit: draft.itemDimensionsUnit,
    tags: draft.tags.join(','),
    materials: draft.materials.join(','),
    style: draft.style.join(','),
  })
  if (options.includeQuantity) {
    form.set('quantity', String(draft.quantity))
  }
  return form
}

export function assertEtsyListingFormHasReadinessState(form: URLSearchParams) {
  const readinessStateId = Number(form.get('readiness_state_id'))
  if (!Number.isSafeInteger(readinessStateId) || readinessStateId <= 0) {
    throw new Error('The Etsy listing request is missing a valid processing profile.')
  }
}

export function assertEtsyListingFormHasItemPackage(form: URLSearchParams) {
  const positiveNumberFields = [
    'item_weight',
    'item_length',
    'item_width',
    'item_height',
  ] as const

  const hasInvalidNumber = positiveNumberFields.some((field) => {
    const value = Number(form.get(field))
    return !Number.isFinite(value) || value <= 0
  })
  const hasInvalidUnit =
    !ETSY_WEIGHT_UNITS.includes(
      form.get('item_weight_unit') as (typeof ETSY_WEIGHT_UNITS)[number]
    ) ||
    !ETSY_DIMENSION_UNITS.includes(
      form.get('item_dimensions_unit') as (typeof ETSY_DIMENSION_UNITS)[number]
    )

  if (hasInvalidNumber || hasInvalidUnit) {
    throw new Error(
      'The Etsy listing request is missing valid item weight or dimensions.'
    )
  }
}

export function createDraftListingPath(shopId: number) {
  if (!Number.isSafeInteger(shopId) || shopId <= 0) {
    throw new Error('A valid Etsy shop ID is required.')
  }
  return `/shops/${shopId}/listings?legacy=false`
}

export function prepareCreateDraftListingRequest(
  draft: EtsyListingDraft,
  shopId: number
) {
  const form = buildEtsyListingForm(draft, { includeQuantity: true })
  assertEtsyListingFormHasReadinessState(form)
  assertEtsyListingFormHasItemPackage(form)
  return {
    form,
    path: createDraftListingPath(shopId),
  }
}

export async function prepareEtsyListingRequestBeforeReservation<T>(
  draft: EtsyListingDraft,
  shopId: number,
  reserve: () => Promise<T>
) {
  const listingRequest = prepareCreateDraftListingRequest(draft, shopId)
  const reservation = await reserve()
  return { listingRequest, reservation }
}
