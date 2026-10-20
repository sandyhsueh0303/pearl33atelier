import assert from 'node:assert/strict'
import test from 'node:test'
import {
  matchingReadinessProfiles,
  parseEtsyReadinessProfiles,
  readinessStateForAvailability,
  requireSelectedReadinessProfile,
} from '../app/api/products/etsy-listing/readinessProfiles'

const payload = {
  count: 3,
  results: [
    {
      readiness_state_id: 101,
      readiness_state: 'ready_to_ship',
      min_processing_days: 1,
      max_processing_days: 2,
      processing_days_display_label: '1–2 business days',
    },
    {
      readiness_state_id: 202,
      readiness_state: 'made_to_order',
      min_processing_days: 5,
      max_processing_days: 8,
      processing_days_display_label: '5–8 business days',
    },
    {
      readiness_state_id: 'invalid',
      readiness_state: 'ready_to_ship',
    },
  ],
}

test('maps actual catalog availability to Etsy readiness state', () => {
  assert.equal(readinessStateForAvailability('IN_STOCK'), 'ready_to_ship')
  assert.equal(readinessStateForAvailability('PREORDER'), 'made_to_order')
  assert.throws(
    () => readinessStateForAvailability('OUT_OF_STOCK'),
    /out of stock/i
  )
})

test('parses valid Etsy processing profiles and ignores malformed results', () => {
  const profiles = parseEtsyReadinessProfiles(payload)
  assert.equal(profiles.length, 2)
  assert.deepEqual(profiles[0], {
    readinessStateId: 101,
    readinessState: 'ready_to_ship',
    minProcessingDays: 1,
    maxProcessingDays: 2,
    displayLabel: '1–2 business days',
  })
})

test('filters profiles by the product actual readiness state', () => {
  const profiles = parseEtsyReadinessProfiles(payload)
  assert.deepEqual(
    matchingReadinessProfiles(profiles, 'made_to_order').map(
      (profile) => profile.readinessStateId
    ),
    [202]
  )
})

test('requires an explicitly selected matching processing profile', () => {
  const profiles = parseEtsyReadinessProfiles(payload)
  assert.equal(
    requireSelectedReadinessProfile({
      profiles,
      readinessState: 'ready_to_ship',
      selectedProfileId: 101,
    }).readinessStateId,
    101
  )
  assert.throws(
    () =>
      requireSelectedReadinessProfile({
        profiles,
        readinessState: 'ready_to_ship',
        selectedProfileId: 202,
      }),
    /choose an existing Etsy ready_to_ship processing profile/i
  )
})

test('returns an actionable error when no matching profile exists', () => {
  assert.throws(
    () =>
      requireSelectedReadinessProfile({
        profiles: [],
        readinessState: 'made_to_order',
        selectedProfileId: 202,
      }),
    /Create one in Etsy Shop Manager.*shops_w/is
  )
})
