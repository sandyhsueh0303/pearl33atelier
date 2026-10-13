import assert from 'node:assert/strict'
import test from 'node:test'
import {
  needsProductDetailsForSoftPreferences,
  rankProducts,
} from '../../app/lib/agents/shopping/rankProducts'
import { availability, context, ids, product } from './fixtures'

test('ranking behavior: matching size and metal ranks above matching only size', () => {
  const both = product(ids.a, {
    size_mm: '8–8.5mm',
    material: '18K Solid Gold',
  })
  const sizeOnly = product(ids.b, {
    size_mm: '8–8.5mm',
    material: 'Gold Vermeil',
  })
  const ranked = rankProducts({
    products: [sizeOnly, both],
    shoppingContext: context({
      pearlSize: '8-8.5mm',
      metalPreference: '18k solid gold',
    }),
    availability: [availability(ids.b), availability(ids.a)],
  })

  assert.deepEqual(
    ranked.map((candidate) => [candidate.productId, candidate.score]),
    [
      [ids.a, 6],
      [ids.b, 3],
    ]
  )
})

test('ranking behavior: structured-only preferences do not require product details', () => {
  assert.equal(
    needsProductDetailsForSoftPreferences(
      context({ pearlSize: '8mm', metalPreference: '18k solid gold' })
    ),
    false
  )
})

test('ranking behavior: equal scores preserve original search order', () => {
  const first = product(ids.a, { material: 'Sterling Silver' })
  const second = product(ids.b, { material: 'Gold Vermeil' })
  const third = product(ids.c, { material: '18k Solid Gold' })
  const ranked = rankProducts({
    products: [second, first, third],
    shoppingContext: context({}),
    availability: [
      availability(ids.a),
      availability(ids.b),
      availability(ids.c),
    ],
  })

  assert.deepEqual(
    ranked.map((candidate) => candidate.productId),
    [ids.b, ids.a, ids.c]
  )
})
