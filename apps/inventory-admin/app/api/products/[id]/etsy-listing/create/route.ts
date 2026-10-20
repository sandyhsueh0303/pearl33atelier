import { NextRequest, NextResponse } from 'next/server'
import { PRODUCT_IMAGE_BUCKET } from '@pearl33atelier/shared'
import { requireAdmin } from '@/app/utils/adminAuth'
import { etsyListingDraftSchema } from '../../../etsy-listing/schema'
import {
  parseEtsyReadinessProfiles,
  readinessStateForAvailability,
  requireSelectedReadinessProfile,
} from '../../../etsy-listing/readinessProfiles'
import { prepareCreateDraftListingRequest } from '../../../etsy-listing/listingForm'
import {
  getEtsyDraftFailureDisposition,
  listingCompletedPatch,
  listingCreatedProgressPatch,
  sanitizedDraftFailure,
} from '../../../etsy-listing/draftLifecycle'
import {
  beginEtsyListingDraft,
  claimFailedEtsyListingDraft,
  etsyRequest,
  findEtsyListingDraftReservation,
  getEtsyConnection,
  markCreatingEtsyListingDraftFailed,
  markEtsyListingDraftPartial,
  updateEtsyListingDraft,
  type EtsyListingDraftRecord,
} from '@/app/api/etsy/etsyClient'

class EtsyDraftImageValidationError extends Error {}

export function resolveEtsyDraftImageOrder(input: {
  reservation: EtsyListingDraftRecord | null
  requestedImageOrder: string[]
}) {
  if (
    input.reservation?.status !== 'partial' ||
    !input.reservation.etsy_listing_id
  ) {
    return input.requestedImageOrder
  }

  const payload = input.reservation.listing_payload
  const imageOrder =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>).imageOrder
      : null
  if (
    !Array.isArray(imageOrder) ||
    imageOrder.length === 0 ||
    imageOrder.some((imageId) => typeof imageId !== 'string')
  ) {
    throw new Error(
      'The partial Etsy Draft does not contain a valid original image order.'
    )
  }
  return imageOrder as string[]
}

export async function prepareReservationAfterImageValidation<T>(input: {
  existingReservation: EtsyListingDraftRecord | null
  requestedImageOrder: string[]
  validateImageOrder: (imageOrder: string[]) => Promise<T>
  beginReservation: () => Promise<{
    record: EtsyListingDraftRecord
    isNew: boolean
  }>
}) {
  const imageOrder = resolveEtsyDraftImageOrder({
    reservation: input.existingReservation,
    requestedImageOrder: input.requestedImageOrder,
  })
  const validatedImages = await input.validateImageOrder(imageOrder)
  const reservation = input.existingReservation
    ? { record: input.existingReservation, isNew: false }
    : await input.beginReservation()
  return { imageOrder, reservation, validatedImages }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, errorResponse } = await requireAdmin()
  if (errorResponse || !user || !supabase) return errorResponse

  let activeRecord: EtsyListingDraftRecord | null = null
  let activeListingId: number | null = null

  try {
    const { id: productId } = await params
    const body = await request.json()
    const draftId = String(body?.draftId || '')
    if (!/^[0-9a-f-]{36}$/i.test(draftId)) {
      return NextResponse.json({ error: 'A valid draft ID is required.' }, { status: 400 })
    }

    const parsed = etsyListingDraftSchema.safeParse(body?.draft)
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Fix the listing validation issues before creating an Etsy Draft.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'listing',
          message: issue.message,
        })),
      }, { status: 400 })
    }
    const draft = parsed.data
    if (draft.attributes.some((attribute) => attribute.values.length !== attribute.valueIds.length)) {
      return NextResponse.json({
        error: 'Every Etsy attribute value needs its matching taxonomy value ID.',
      }, { status: 400 })
    }

    const connection = await getEtsyConnection(user.id)
    if (!connection) {
      return NextResponse.json({ error: 'Connect an Etsy shop before creating a Draft.' }, { status: 409 })
    }
    if (!connection.scopes.includes('listings_w')) {
      return NextResponse.json({ error: 'Reconnect Etsy and grant the listings_w permission.' }, { status: 409 })
    }
    if (!connection.scopes.includes('shops_r')) {
      return NextResponse.json(
        { error: 'Reconnect Etsy and grant the shops_r permission to read processing profiles.' },
        { status: 409 }
      )
    }

    const existingReservation = await findEtsyListingDraftReservation({
      adminUserId: user.id,
      productId,
      idempotencyKey: draftId,
    })

    const { data: product, error: productError } = await supabase
      .from('catalog_products')
      .select('id, availability')
      .eq('id', productId)
      .single()
    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }

    const validateImageOrder = async (imageOrder: string[]) => {
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('id, storage_path')
        .eq('product_id', productId)
        .in('id', imageOrder)
      if (imagesError) throw imagesError
      const imagesById = new Map(
        (images || []).map((image) => [image.id, image])
      )
      if (imageOrder.some((imageId) => !imagesById.has(imageId))) {
        throw new EtsyDraftImageValidationError(
          'The image list for this Etsy Draft no longer matches this product.'
        )
      }
      return imagesById
    }

    let readinessState: ReturnType<typeof readinessStateForAvailability>
    try {
      readinessState = readinessStateForAvailability(product.availability)
      const readinessResponse = await etsyRequest(
        user.id,
        `/shops/${connection.shopId}/readiness-state-definitions?limit=100`
      )
      requireSelectedReadinessProfile({
        profiles: parseEtsyReadinessProfiles(readinessResponse.data),
        readinessState,
        selectedProfileId: draft.readinessStateId,
      })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Could not validate the Etsy processing profile.' },
        { status: 409 }
      )
    }

    const listingPayload = {
      title: draft.title,
      description: draft.description,
      tags: draft.tags,
      materials: draft.materials,
      taxonomyId: draft.taxonomyId,
      attributes: draft.attributes,
      style: draft.style,
      price: draft.price,
      quantity: draft.quantity,
      whoMade: draft.whoMade,
      whenMade: draft.whenMade,
      isSupply: draft.isSupply,
      shippingProfileId: draft.shippingProfileId,
      readinessState,
      readinessStateId: draft.readinessStateId,
      itemWeight: draft.itemWeight,
      itemWeightUnit: draft.itemWeightUnit,
      itemLength: draft.itemLength,
      itemWidth: draft.itemWidth,
      itemHeight: draft.itemHeight,
      itemDimensionsUnit: draft.itemDimensionsUnit,
      imageOrder: resolveEtsyDraftImageOrder({
        reservation: existingReservation,
        requestedImageOrder: draft.imageOrder,
      }),
    }
    const listingRequest = prepareCreateDraftListingRequest(
      draft,
      connection.shopId
    )
    let preparedReservation
    try {
      preparedReservation = await prepareReservationAfterImageValidation({
        existingReservation,
        requestedImageOrder: draft.imageOrder,
        validateImageOrder,
        beginReservation: () =>
          beginEtsyListingDraft({
            id: draftId,
            adminUserId: user.id,
            productId,
            idempotencyKey: draftId,
            shopId: connection.shopId,
            imageOrder: draft.imageOrder,
            listingPayload,
          }),
      })
    } catch (error) {
      if (error instanceof EtsyDraftImageValidationError) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      throw error
    }
    let { record, isNew } = preparedReservation.reservation
    let imagesById = preparedReservation.validatedImages

    if (!isNew && record.etsy_listing_id && record.status === 'draft_created') {
      return NextResponse.json({
        listingId: record.etsy_listing_id,
        shopId: record.etsy_shop_id,
        status: 'draft_created',
        resumed: true,
      })
    }
    if (!isNew && record.status === 'failed') {
      if (record.etsy_listing_id) {
        return NextResponse.json({
          error: 'This Etsy Draft has inconsistent retry state and must be reconciled before retrying.',
        }, { status: 409 })
      }
      const claimed = await claimFailedEtsyListingDraft({
        id: record.id,
        adminUserId: user.id,
        productId,
        idempotencyKey: record.idempotency_key,
        imageOrder: draft.imageOrder,
        listingPayload,
      })
      if (!claimed) {
        return NextResponse.json({
          error: 'This Etsy Draft retry was already claimed by another request. Wait for it to finish before retrying.',
        }, { status: 409 })
      }
      record = claimed
      isNew = true
    }
    if (!isNew && record.status === 'creating' && !record.etsy_listing_id) {
      return NextResponse.json({
        error: 'This Draft request may still be in progress. Check Etsy before retrying to avoid creating a duplicate.',
      }, { status: 409 })
    }

    activeRecord = record
    let listingId = record.etsy_listing_id
    activeListingId = listingId
    const isResumingPartialDraft = !isNew && Boolean(listingId)
    const uploadImageOrder = resolveEtsyDraftImageOrder({
      reservation: record,
      requestedImageOrder: draft.imageOrder,
    })
    const effectiveListingPayload = isResumingPartialDraft
      ? { ...listingPayload, imageOrder: uploadImageOrder }
      : listingPayload

    if (
      uploadImageOrder.length !== preparedReservation.imageOrder.length ||
      uploadImageOrder.some(
        (imageId, index) => imageId !== preparedReservation.imageOrder[index]
      )
    ) {
      imagesById = await validateImageOrder(uploadImageOrder)
    }

    if (!listingId) {
      const created = await etsyRequest(user.id, listingRequest.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: listingRequest.form,
      })
      listingId = Number(created.data?.listing_id)
      if (!Number.isInteger(listingId) || listingId <= 0) {
        throw new Error('Etsy did not return a valid listing ID.')
      }
      activeListingId = listingId
      await updateEtsyListingDraft(
        draftId,
        user.id,
        listingCreatedProgressPatch(listingId, effectiveListingPayload)
      )
    } else {
      await etsyRequest(
        user.id,
        `/shops/${connection.shopId}/listings/${listingId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: listingRequest.form,
        }
      )
      await updateEtsyListingDraft(draftId, user.id, {
        status: 'partial',
        listing_payload: effectiveListingPayload,
        last_error: null,
      })
    }

    for (const attribute of draft.attributes) {
      if (attribute.values.length === 0) continue
      await etsyRequest(
        user.id,
        `/shops/${connection.shopId}/listings/${listingId}/properties/${attribute.propertyId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value_ids: attribute.valueIds, values: attribute.values }),
        }
      )
    }

    let nextImageRank = isResumingPartialDraft
      ? Math.max(1, record.next_image_rank)
      : 1
    for (let index = nextImageRank - 1; index < uploadImageOrder.length; index += 1) {
      const image = imagesById.get(uploadImageOrder[index])
      if (!image) throw new Error('A selected product image could not be found.')
      const { data: blob, error: downloadError } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .download(image.storage_path)
      if (downloadError || !blob) throw new Error('Failed to read a product image for Etsy upload.')

      const form = new FormData()
      const extension = image.storage_path.split('.').pop() || 'jpg'
      form.append('image', blob, `product-image-${index + 1}.${extension}`)
      form.append('rank', String(index + 1))
      form.append('overwrite', 'true')
      await etsyRequest(user.id, `/shops/${connection.shopId}/listings/${listingId}/images`, {
        method: 'POST',
        body: form,
      })
      nextImageRank = index + 2
      await updateEtsyListingDraft(draftId, user.id, {
        status: 'partial',
        next_image_rank: nextImageRank,
        last_error: null,
      })
    }

    await updateEtsyListingDraft(
      draftId,
      user.id,
      listingCompletedPatch(uploadImageOrder.length)
    )

    return NextResponse.json({
      listingId,
      shopId: connection.shopId,
      status: 'draft_created',
      url: `https://www.etsy.com/your/shops/me/tools/listings/${listingId}/edit`,
    }, { status: 201 })
  } catch (error) {
    if (activeRecord) {
      const disposition = getEtsyDraftFailureDisposition(error, activeListingId)
      try {
        if (disposition === 'failed') {
          await markCreatingEtsyListingDraftFailed({
            id: activeRecord.id,
            adminUserId: activeRecord.admin_user_id,
            productId: activeRecord.product_id,
            idempotencyKey: activeRecord.idempotency_key,
            lastError: sanitizedDraftFailure(disposition, error),
          })
        } else if (disposition === 'partial' && activeListingId) {
          await markEtsyListingDraftPartial({
            id: activeRecord.id,
            adminUserId: activeRecord.admin_user_id,
            productId: activeRecord.product_id,
            idempotencyKey: activeRecord.idempotency_key,
            listingId: activeListingId,
            lastError: sanitizedDraftFailure(disposition, error),
          })
        }
      } catch (transitionError) {
        console.error('Failed to record Etsy Draft recovery state:', transitionError)
      }
    }
    console.error('Etsy Draft creation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Etsy Draft.' },
      { status: 500 }
    )
  }
}
