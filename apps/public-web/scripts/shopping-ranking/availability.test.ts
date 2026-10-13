import assert from 'node:assert/strict'
import test from 'node:test'
import { rankProducts } from '../../app/lib/agents/shopping/rankProducts'
import { availability, context, ids, product } from './fixtures'

test('availability: unavailable product is excluded despite highest theoretical score', () => {
  const unavailablePerfectMatch = product(ids.a, {
    size_mm: '8–8.5mm',
    material: '18K Solid Gold',
  })
  const availableNonMatch = product(ids.b, {
    size_mm: '10mm',
    material: 'Sterling Silver',
  })
  const ranked = rankProducts({
    products: [unavailablePerfectMatch, availableNonMatch],
    shoppingContext: context({
      pearlSize: '8-8.5mm',
      metalPreference: '18k solid gold',
    }),
    availability: [
      availability(ids.a, 'unavailable'),
      availability(ids.b, 'available'),
    ],
  })

  assert.deepEqual(ranked.map((candidate) => candidate.productId), [ids.b])
})
