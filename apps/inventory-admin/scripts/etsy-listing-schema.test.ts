import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateEtsyListingDraft,
  type EtsyListingDraft,
} from '../app/api/products/etsy-listing/schema'
import { buildEtsyListingForm } from '../app/api/products/etsy-listing/listingForm'

const validDraft: EtsyListingDraft = {
  title: 'Akoya Pearl Stud Earrings',
  description: 'A pair of Akoya pearl stud earrings.',
  tags: [
    'akoya earrings',
    'pearl studs',
    'minimal jewelry',
    'gift for her',
    'bridal earrings',
    'white pearls',
    'classic studs',
    'daily jewelry',
    'gold earrings',
    'pearl gift',
    'wedding jewelry',
    'simple earrings',
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

test('accepts a complete Etsy listing draft with exactly 13 tags', () => {
  assert.deepEqual(validateEtsyListingDraft(validDraft), {
    canCreateDraft: true,
    issues: [],
  })
})

test('requires exactly 13 unique tags and enforces the Etsy tag length limit', () => {
  const tooFew = validateEtsyListingDraft({ ...validDraft, tags: validDraft.tags.slice(1) })
  assert.equal(tooFew.canCreateDraft, false)
  assert.ok(tooFew.issues.some((issue) => issue.field === 'tags'))

  const tooLong = validateEtsyListingDraft({
    ...validDraft,
    tags: ['a'.repeat(21), ...validDraft.tags.slice(1)],
  })
  assert.equal(tooLong.canCreateDraft, false)
  assert.ok(tooLong.issues.some((issue) => issue.field === 'tags.0'))
})

test('requires seller-confirmed Etsy fields and a unique image order', () => {
  const missingRequired = validateEtsyListingDraft({
    ...validDraft,
    quantity: 0,
    shippingProfileId: 0,
    readinessStateId: 0,
  })
  assert.equal(missingRequired.canCreateDraft, false)
  assert.ok(missingRequired.issues.some((issue) => issue.field === 'quantity'))
  assert.ok(missingRequired.issues.some((issue) => issue.field === 'shippingProfileId'))
  assert.ok(missingRequired.issues.some((issue) => issue.field === 'readinessStateId'))

  const duplicateImages = validateEtsyListingDraft({
    ...validDraft,
    imageOrder: [validDraft.imageOrder[0], validDraft.imageOrder[0]],
  })
  assert.equal(duplicateImages.canCreateDraft, false)
  assert.ok(duplicateImages.issues.some((issue) => issue.field === 'imageOrder'))
})

test('encodes both shipping and processing profiles in the physical listing request', () => {
  const form = buildEtsyListingForm(validDraft, { includeQuantity: true })
  assert.equal(form.get('type'), 'physical')
  assert.equal(form.get('shipping_profile_id'), '456')
  assert.equal(form.get('readiness_state_id'), '789')
  assert.equal(form.get('quantity'), '1')
  assert.equal(form.get('item_weight'), '2')
  assert.equal(form.get('item_weight_unit'), 'oz')
  assert.equal(form.get('item_length'), '4')
  assert.equal(form.get('item_width'), '4')
  assert.equal(form.get('item_height'), '2')
  assert.equal(form.get('item_dimensions_unit'), 'in')
})

test('requires positive item weight and dimensions', () => {
  const result = validateEtsyListingDraft({
    ...validDraft,
    itemWeight: 0,
    itemHeight: -1,
  })

  assert.equal(result.canCreateDraft, false)
  assert.ok(result.issues.some((issue) => issue.field === 'itemWeight'))
  assert.ok(result.issues.some((issue) => issue.field === 'itemHeight'))
})
