import assert from 'node:assert/strict'
import test from 'node:test'
import type { ShoppingIntent } from '../app/lib/agents/shopping/intent'
import {
  createEmptyShoppingContext,
  getMissingFields,
  mergeShoppingContext,
} from '../app/lib/agents/shopping/shoppingContext'

function partialIntent(
  values: Partial<ShoppingIntent> = {}
): ShoppingIntent {
  return {
    category: null,
    minPrice: null,
    maxPrice: null,
    occasion: null,
    style: [],
    statementLevel: null,
    pearlPreference: null,
    pearlSize: null,
    metalPreference: null,
    ...values,
  }
}

test('Conversation A preserves occasion while category is clarified', () => {
  const turnOne = mergeShoppingContext(
    createEmptyShoppingContext(),
    partialIntent({ occasion: 'wedding' })
  )

  assert.equal(turnOne.occasion, 'wedding')
  assert.equal(turnOne.category, null)
  assert.deepEqual(getMissingFields(turnOne), ['category'])

  const turnTwo = mergeShoppingContext(
    turnOne,
    partialIntent({ category: 'earrings' })
  )

  assert.equal(turnTwo.category, 'earrings')
  assert.equal(turnTwo.occasion, 'wedding')
  assert.deepEqual(getMissingFields(turnTwo), [])
})

test('Conversation B preserves category and budget when style is added', () => {
  const turnOne = mergeShoppingContext(
    createEmptyShoppingContext(),
    partialIntent({ category: 'earrings', maxPrice: 300 })
  )

  assert.deepEqual(getMissingFields(turnOne), [])

  const turnTwo = mergeShoppingContext(
    turnOne,
    partialIntent({ style: ['minimal'] })
  )

  assert.equal(turnTwo.category, 'earrings')
  assert.equal(turnTwo.maxPrice, 300)
  assert.deepEqual(turnTwo.style, ['minimal'])
})

test('Conversation C applies category corrections and keeps unrelated constraints', () => {
  const current = mergeShoppingContext(
    createEmptyShoppingContext(),
    partialIntent({
      category: 'earrings',
      maxPrice: 300,
      occasion: 'wedding',
      style: ['minimal'],
    })
  )

  const corrected = mergeShoppingContext(
    current,
    partialIntent({ category: 'necklaces' })
  )

  assert.equal(corrected.category, 'necklaces')
  assert.equal(corrected.maxPrice, 300)
  assert.equal(corrected.occasion, 'wedding')
  assert.deepEqual(corrected.style, ['minimal'])
  assert.deepEqual(getMissingFields(corrected), [])
})

test('styles merge without duplicates and an empty list does not erase them', () => {
  const current = mergeShoppingContext(
    createEmptyShoppingContext(),
    partialIntent({ style: ['minimal', 'classic'] })
  )

  const merged = mergeShoppingContext(
    current,
    partialIntent({ style: ['classic', 'modern'] })
  )
  const unchanged = mergeShoppingContext(merged, partialIntent())

  assert.deepEqual(merged.style, ['minimal', 'classic', 'modern'])
  assert.deepEqual(unchanged.style, ['minimal', 'classic', 'modern'])
  assert.notStrictEqual(unchanged.style, merged.style)
})
