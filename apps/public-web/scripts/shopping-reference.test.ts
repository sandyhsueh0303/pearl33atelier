import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getRecommendedProductReferenceToolNames,
  hasRecommendedProductReference,
  planRecommendedProductReferenceTools,
  resolveRecommendedProductReference,
} from '../app/lib/agents/shopping/referenceResolution'
import {
  createEmptyShoppingContext,
  replaceRecommendedProducts,
  type RecommendedProduct,
} from '../app/lib/agents/shopping/shoppingContext'

const productA: RecommendedProduct = {
  id: '00000000-0000-4000-8000-00000000000a',
  title: 'Product A',
}
const unavailableRawProductB: RecommendedProduct = {
  id: '00000000-0000-4000-8000-00000000000b',
  title: 'Product B',
}
const productC: RecommendedProduct = {
  id: '00000000-0000-4000-8000-00000000000c',
  title: 'Product C',
}
const displayedRecommendations = [productA, productC]

test('Case A resolves the second displayed product and plans details without search', () => {
  const message = 'Tell me more about the second one.'
  const resolved = resolveRecommendedProductReference(
    message,
    displayedRecommendations
  )
  const plan = planRecommendedProductReferenceTools(message)

  assert.equal(hasRecommendedProductReference(message), true)
  assert.deepEqual(resolved, productC)
  assert.notDeepEqual(resolved, unavailableRawProductB)
  assert.deepEqual(plan, { checkAvailability: false, getDetails: true })
  assert.deepEqual(getRecommendedProductReferenceToolNames(message), [
    'get_product_details',
  ])
})

test('Case B resolves the first displayed product and plans details without search', () => {
  const message = 'What about the first one?'

  assert.deepEqual(
    resolveRecommendedProductReference(message, displayedRecommendations),
    productA
  )
  assert.deepEqual(planRecommendedProductReferenceTools(message), {
    checkAvailability: false,
    getDetails: true,
  })
  assert.deepEqual(getRecommendedProductReferenceToolNames(message), [
    'get_product_details',
  ])
})

test('Case C plans a fresh availability check for the second product', () => {
  const message = 'Is the second one still available?'

  assert.deepEqual(
    resolveRecommendedProductReference(message, displayedRecommendations),
    productC
  )
  assert.deepEqual(planRecommendedProductReferenceTools(message), {
    checkAvailability: true,
    getDetails: false,
  })
  assert.deepEqual(getRecommendedProductReferenceToolNames(message), [
    'check_product_availability',
  ])
})

test('Case D leaves an out-of-range third reference unresolved', () => {
  const message = 'Tell me more about the third one.'

  assert.equal(hasRecommendedProductReference(message), true)
  assert.equal(
    resolveRecommendedProductReference(message, displayedRecommendations),
    null
  )
})

test('supports bare ordinals and last one', () => {
  assert.deepEqual(
    resolveRecommendedProductReference('Tell me about second.', displayedRecommendations),
    productC
  )
  assert.deepEqual(
    resolveRecommendedProductReference('Tell me about the last one.', displayedRecommendations),
    productC
  )
})

test('Case E replaces the previous displayed recommendation order', () => {
  const originalContext = replaceRecommendedProducts(
    createEmptyShoppingContext(),
    displayedRecommendations
  )
  const nextRecommendations = [productC]
  const updatedContext = replaceRecommendedProducts(
    originalContext,
    nextRecommendations
  )

  assert.deepEqual(updatedContext.recommendedProducts, nextRecommendations)
  assert.deepEqual(
    resolveRecommendedProductReference(
      'What about the first one?',
      updatedContext.recommendedProducts
    ),
    productC
  )
  assert.equal(
    resolveRecommendedProductReference(
      'What about the second one?',
      updatedContext.recommendedProducts
    ),
    null
  )
})
