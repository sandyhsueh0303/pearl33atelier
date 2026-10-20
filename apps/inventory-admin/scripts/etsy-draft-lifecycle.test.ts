import assert from 'node:assert/strict'
import test from 'node:test'
import {
  beginEtsyListingDraftWithClient,
  claimFailedEtsyListingDraftWithClient,
  EtsyApiError,
} from '../app/api/etsy/etsyClient'
import {
  getEtsyDraftFailureDisposition,
  listingCompletedPatch,
  listingCreatedProgressPatch,
  sanitizedDraftFailure,
} from '../app/api/products/etsy-listing/draftLifecycle'
import {
  assertEtsyListingFormHasItemPackage,
  assertEtsyListingFormHasReadinessState,
  buildEtsyListingForm,
  createDraftListingPath,
} from '../app/api/products/etsy-listing/listingForm'
import type { EtsyListingDraft } from '../app/api/products/etsy-listing/schema'
import {
  prepareReservationAfterImageValidation,
  resolveEtsyDraftImageOrder,
} from '../app/api/products/[id]/etsy-listing/create/route'

const draft: EtsyListingDraft = {
  title: 'Akoya Pearl Stud Earrings',
  description: 'A pair of Akoya pearl stud earrings.',
  tags: [
    'akoya earrings', 'pearl studs', 'minimal jewelry', 'gift for her',
    'bridal earrings', 'white pearls', 'classic studs', 'daily jewelry',
    'gold earrings', 'pearl gift', 'wedding jewelry', 'simple earrings',
    'akoya pearls',
  ],
  materials: ['Akoya pearl', '14K gold'],
  taxonomyId: 123,
  attributes: [],
  style: ['Classic'],
  price: 250,
  quantity: 1,
  whoMade: 'someone_else',
  whenMade: 'made_to_order',
  isSupply: false,
  shippingProfileId: 456,
  readinessStateId: 789,
  itemWeight: 2,
  itemWeightUnit: 'oz',
  itemLength: 4,
  itemWidth: 4,
  itemHeight: 2,
  itemDimensionsUnit: 'in',
  imageOrder: ['11111111-1111-4111-8111-111111111111'],
}

test('createDraftListing uses processing-profile mode and includes readiness_state_id', () => {
  assert.equal(createDraftListingPath(68_557_425), '/shops/68557425/listings?legacy=false')
  const form = buildEtsyListingForm(draft, { includeQuantity: true })
  assert.doesNotThrow(() => assertEtsyListingFormHasReadinessState(form))
  assert.equal(form.get('readiness_state_id'), '789')
  assert.equal(form.get('shipping_profile_id'), '456')
})

test('createDraftListing includes the editable item weight and dimensions', () => {
  const form = buildEtsyListingForm({
    ...draft,
    itemWeight: 3.5,
    itemLength: 5,
    itemWidth: 4.5,
    itemHeight: 2.25,
  }, { includeQuantity: true })

  assert.doesNotThrow(() => assertEtsyListingFormHasItemPackage(form))
  assert.equal(form.get('item_weight'), '3.5')
  assert.equal(form.get('item_weight_unit'), 'oz')
  assert.equal(form.get('item_length'), '5')
  assert.equal(form.get('item_width'), '4.5')
  assert.equal(form.get('item_height'), '2.25')
  assert.equal(form.get('item_dimensions_unit'), 'in')
})

test('invalid item package data is rejected before reservation', () => {
  const form = buildEtsyListingForm(draft, { includeQuantity: true })
  form.delete('item_weight')

  assert.throws(
    () => assertEtsyListingFormHasItemPackage(form),
    /missing valid item weight or dimensions/
  )
})

test('definitive Etsy 400 before listing creation transitions to failed with sanitized error', () => {
  const error = new EtsyApiError(400, 'readiness_state_id is required')
  const disposition = getEtsyDraftFailureDisposition(error, null)
  assert.equal(disposition, 'failed')
  assert.equal(
    sanitizedDraftFailure(disposition, error),
    'Etsy rejected the listing request (400). Review the listing fields before retrying.'
  )
})

test('ambiguous timeout before listing creation remains blocked for reconciliation', () => {
  const error = new TypeError('fetch failed')
  assert.equal(getEtsyDraftFailureDisposition(error, null), 'blocked')
})

test('successful create persists listing ID as partial before final completion', () => {
  assert.deepEqual(listingCreatedProgressPatch(123456, { title: draft.title }), {
    etsy_listing_id: 123456,
    status: 'partial',
    next_image_rank: 1,
    listing_payload: { title: draft.title },
    last_error: null,
  })
  assert.deepEqual(listingCompletedPatch(3), {
    status: 'draft_created',
    next_image_rank: 4,
    last_error: null,
  })
})

test('failure after Etsy returns listing_id preserves partial state for resume', () => {
  const error = new Error('image upload failed')
  const disposition = getEtsyDraftFailureDisposition(error, 123456)
  assert.equal(disposition, 'partial')
  assert.match(sanitizedDraftFailure(disposition, error), /Resume the Draft/)
})

test('partial resume validates the persisted image order and does not insert a new reservation', async () => {
  const reservationImageOrder = [
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
  ]
  const requestedImageOrder = [...reservationImageOrder].reverse()
  const partialReservation = {
    id: '11111111-1111-4111-8111-111111111111',
    admin_user_id: 'admin-1',
    product_id: 'product-1',
    idempotency_key: '11111111-1111-4111-8111-111111111111',
    etsy_listing_id: 123456,
    etsy_shop_id: 68_557_425,
    status: 'partial' as const,
    image_order: reservationImageOrder,
    next_image_rank: 2,
    listing_payload: { imageOrder: reservationImageOrder },
    last_error: null,
  }
  let reservationInserts = 0
  const validatedOrders: string[][] = []

  const prepared = await prepareReservationAfterImageValidation({
    existingReservation: partialReservation,
    requestedImageOrder,
    validateImageOrder: async (imageOrder) => {
      validatedOrders.push(imageOrder)
      return new Map()
    },
    beginReservation: async () => {
      reservationInserts += 1
      return { record: partialReservation, isNew: true }
    },
  })

  assert.deepEqual(prepared.imageOrder, reservationImageOrder)
  assert.deepEqual(validatedOrders, [reservationImageOrder])
  assert.equal(reservationInserts, 0)
  assert.equal(prepared.reservation.record.etsy_listing_id, 123456)
  assert.equal(prepared.reservation.record.next_image_rank, 2)
})

test('new draft validates incoming image order before reservation insert', async () => {
  const events: string[] = []
  const requestedImageOrder = draft.imageOrder

  const prepared = await prepareReservationAfterImageValidation({
    existingReservation: null,
    requestedImageOrder,
    validateImageOrder: async (imageOrder) => {
      events.push(`validate:${imageOrder.join(',')}`)
      return new Map()
    },
    beginReservation: async () => {
      events.push('insert')
      return {
        record: {
          id: '11111111-1111-4111-8111-111111111111',
          admin_user_id: 'admin-1',
          product_id: 'product-1',
          idempotency_key: '11111111-1111-4111-8111-111111111111',
          etsy_listing_id: null,
          etsy_shop_id: 68_557_425,
          status: 'creating',
          image_order: requestedImageOrder,
          next_image_rank: 1,
          listing_payload: { imageOrder: requestedImageOrder },
          last_error: null,
        },
        isNew: true,
      }
    },
  })

  assert.deepEqual(prepared.imageOrder, requestedImageOrder)
  assert.deepEqual(events, [
    `validate:${requestedImageOrder.join(',')}`,
    'insert',
  ])
})

test('simultaneous failed retries atomically claim only one create attempt', async () => {
  const record: Record<string, unknown> = {
    id: '11111111-1111-4111-8111-111111111111',
    admin_user_id: 'admin-1',
    product_id: 'product-1',
    idempotency_key: '11111111-1111-4111-8111-111111111111',
    etsy_listing_id: null,
    status: 'failed',
    image_order: draft.imageOrder,
    listing_payload: {},
  }

  function fakeClient() {
    return {
      from() {
        let patch: Record<string, unknown> = {}
        const filters: Array<[string, unknown]> = []
        const query = {
          update(value: Record<string, unknown>) { patch = value; return query },
          eq(column: string, value: unknown) { filters.push([column, value]); return query },
          is(column: string, value: unknown) { filters.push([column, value]); return query },
          select() { return query },
          async maybeSingle() {
            await Promise.resolve()
            const matches = filters.every(([column, value]) => record[column] === value)
            if (!matches) return { data: null, error: null }
            Object.assign(record, patch)
            return { data: { ...record }, error: null }
          },
        }
        return query
      },
    }
  }

  const input = {
    id: String(record.id),
    adminUserId: String(record.admin_user_id),
    productId: String(record.product_id),
    idempotencyKey: String(record.idempotency_key),
    imageOrder: draft.imageOrder,
    listingPayload: { title: draft.title },
  }
  const [first, second] = await Promise.all([
    claimFailedEtsyListingDraftWithClient(fakeClient(), input),
    claimFailedEtsyListingDraftWithClient(fakeClient(), input),
  ])

  assert.equal([first, second].filter(Boolean).length, 1)
  assert.equal(record.status, 'creating')
})

test('non-unique reservation insert errors are not treated as retries', async () => {
  const client = {
    from() {
      return {
        async insert() {
          return { error: { code: '42501', message: 'permission denied' } }
        },
      }
    },
  }
  await assert.rejects(
    beginEtsyListingDraftWithClient(client, {
      id: '11111111-1111-4111-8111-111111111111',
      adminUserId: 'admin-1',
      productId: 'product-1',
      idempotencyKey: '11111111-1111-4111-8111-111111111111',
      shopId: 68_557_425,
      imageOrder: draft.imageOrder,
      listingPayload: {},
    }),
    /Failed to reserve Etsy Draft creation/
  )
})
