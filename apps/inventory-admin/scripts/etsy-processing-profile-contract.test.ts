import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hasValidReadinessProfileSelection,
  isLatestEtsyOptionsRequest,
  reconcileEtsyProfileSelection,
  selectDefaultShippingProfileId,
} from '../app/admin/products/[id]/etsy-listing/etsyProfileSelection'
import {
  prepareEtsyListingRequestBeforeReservation,
} from '../app/api/products/etsy-listing/listingForm'
import {
  validateEtsyListingDraft,
  type EtsyListingDraft,
} from '../app/api/products/etsy-listing/schema'

const profiles = [
  { readinessStateId: 101, readinessState: 'ready_to_ship' as const },
  { readinessStateId: 202, readinessState: 'made_to_order' as const },
]

const validDraft: EtsyListingDraft = {
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
  readinessStateId: 101,
  itemWeight: 2,
  itemWeightUnit: 'oz',
  itemLength: 4,
  itemWidth: 4,
  itemHeight: 2,
  itemDimensionsUnit: 'in',
  imageOrder: ['11111111-1111-4111-8111-111111111111'],
}

test('Create Draft JSON serialization preserves numeric readinessStateId', () => {
  const payload = JSON.parse(JSON.stringify({
    draftId: '11111111-1111-4111-8111-111111111111',
    draft: { ...validDraft, attributes: [] },
  }))
  assert.equal(payload.draft.readinessStateId, 101)
  assert.equal(typeof payload.draft.readinessStateId, 'number')
})

test('Zod rejects omitted and null readinessStateId values', () => {
  const { readinessStateId: _omitted, ...withoutReadinessStateId } = validDraft
  const omitted = validateEtsyListingDraft(withoutReadinessStateId)
  const nullValue = validateEtsyListingDraft({
    ...validDraft,
    readinessStateId: null,
  })
  assert.equal(omitted.canCreateDraft, false)
  assert.equal(nullValue.canCreateDraft, false)
  assert.ok(omitted.issues.some((issue) => issue.field === 'readinessStateId'))
  assert.ok(nullValue.issues.some((issue) => issue.field === 'readinessStateId'))
})

test('frontend accepts only a positive numeric ID in currently matching profiles', () => {
  assert.equal(hasValidReadinessProfileSelection({
    readinessStateId: 101,
    readinessState: 'ready_to_ship',
    profiles,
    profilesReady: true,
  }), true)
  assert.equal(hasValidReadinessProfileSelection({
    readinessStateId: 202,
    readinessState: 'ready_to_ship',
    profiles,
    profilesReady: true,
  }), false)
  assert.equal(hasValidReadinessProfileSelection({
    readinessStateId: '101' as unknown as number,
    readinessState: 'ready_to_ship',
    profiles,
    profilesReady: true,
  }), false)
  assert.equal(hasValidReadinessProfileSelection({
    readinessStateId: 101,
    readinessState: 'ready_to_ship',
    profiles,
    profilesReady: false,
  }), false)
})

test('successful refresh preserves valid selection and removes a stale selection', () => {
  const selection = { readinessStateId: 101, shippingProfileId: 456 }
  assert.deepEqual(reconcileEtsyProfileSelection({
    selection,
    connected: true,
    profileRefresh: 'ready',
    readinessState: 'ready_to_ship',
    profiles,
  }), selection)
  assert.deepEqual(reconcileEtsyProfileSelection({
    selection,
    connected: true,
    profileRefresh: 'ready',
    readinessState: 'ready_to_ship',
    profiles: profiles.filter((profile) => profile.readinessStateId !== 101),
  }), { readinessStateId: null, shippingProfileId: 456 })
})

test('readiness-state change invalidates a previously matching profile', () => {
  assert.deepEqual(reconcileEtsyProfileSelection({
    selection: { readinessStateId: 101, shippingProfileId: 456 },
    connected: true,
    profileRefresh: 'ready',
    readinessState: 'made_to_order',
    profiles,
  }), { readinessStateId: null, shippingProfileId: 456 })
})

test('disconnect clears both Etsy profile selections', () => {
  assert.deepEqual(reconcileEtsyProfileSelection({
    selection: { readinessStateId: 101, shippingProfileId: 456 },
    connected: false,
    connectionChanged: true,
    profileRefresh: 'failed',
    readinessState: 'ready_to_ship',
    profiles,
  }), { readinessStateId: null, shippingProfileId: null })
})

test('failed options refresh clears readiness selection but preserves shipping profile', () => {
  assert.deepEqual(reconcileEtsyProfileSelection({
    selection: { readinessStateId: 101, shippingProfileId: 456 },
    connected: true,
    profileRefresh: 'failed',
    readinessState: 'ready_to_ship',
    profiles: [],
  }), { readinessStateId: null, shippingProfileId: 456 })
})

test('stale async options responses cannot replace the latest request', () => {
  assert.equal(isLatestEtsyOptionsRequest(4, 5), false)
  assert.equal(isLatestEtsyOptionsRequest(5, 5), true)
})

test('shipping profile defaults to the named shipping profile and preserves a valid selection', () => {
  const shippingProfiles = [
    { shipping_profile_id: 11, title: 'Express' },
    { shipping_profile_id: 22, title: 'Shipping' },
  ]
  assert.equal(selectDefaultShippingProfileId({
    currentId: null,
    profiles: shippingProfiles,
  }), 22)
  assert.equal(selectDefaultShippingProfileId({
    currentId: 11,
    profiles: shippingProfiles,
  }), 11)
})

test('shipping profile falls back to the first valid Etsy option', () => {
  assert.equal(selectDefaultShippingProfileId({
    currentId: null,
    profiles: [
      { shipping_profile_id: 0, title: 'Invalid' },
      { shipping_profile_id: 33, title: 'Standard' },
    ],
  }), 33)
})

test('form assertion runs before the reservation callback', async () => {
  let reservationCalls = 0
  const invalidDraft = {
    ...validDraft,
    readinessStateId: null,
  } as unknown as EtsyListingDraft

  await assert.rejects(
    prepareEtsyListingRequestBeforeReservation(
      invalidDraft,
      68_557_425,
      async () => {
        reservationCalls += 1
        return { inserted: true }
      }
    ),
    /missing a valid processing profile/i
  )
  assert.equal(reservationCalls, 0)
})
