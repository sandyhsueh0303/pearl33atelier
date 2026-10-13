import assert from 'node:assert/strict'
import test from 'node:test'
import { rankProducts } from '../../app/lib/agents/shopping/rankProducts'
import { availability, context, ids, product } from './fixtures'

test('pearl size: exact match ranks above a non-match', () => {
  const exact = product(ids.a, { size_mm: '8–8.5mm' })
  const other = product(ids.b, { size_mm: '9–9.5mm' })
  const ranked = rankProducts({
    products: [other, exact],
    shoppingContext: context({ pearlSize: '8-8.5 mm' }),
    availability: [availability(ids.b), availability(ids.a)],
  })

  assert.deepEqual(
    ranked.map((candidate) => [candidate.productId, candidate.score]),
    [
      [ids.a, 3],
      [ids.b, 0],
    ]
  )
})

test('pearl size: contained range matches and near value uses tolerance tier', () => {
  const products = [
    product(ids.a, { title: 'Contained range', size_mm: '9-10mm' }),
    product(ids.b, { title: 'Single value tolerance', size_mm: '12.1mm' }),
    product(ids.c, { title: 'Outside tolerance', size_mm: '12.21mm' }),
  ]
  const ranked = rankProducts({
    products,
    shoppingContext: context({ pearlSize: '9-12mm' }),
    availability: [availability(ids.a), availability(ids.b), availability(ids.c)],
  })

  assert.deepEqual(
    ranked.map((candidate) => [candidate.productId, candidate.score]),
    [
      [ids.a, 3],
      [ids.b, 1],
      [ids.c, 0],
    ]
  )
})

test('pearl size: both product-range boundaries must stay within tolerance', () => {
  const withinTolerance = product(ids.a, { size_mm: '8.9-12.1mm' })
  const belowTolerance = product(ids.b, { size_mm: '8.79-12mm' })
  const aboveTolerance = product(ids.c, { size_mm: '9-12.21mm' })
  const ranked = rankProducts({
    products: [belowTolerance, aboveTolerance, withinTolerance],
    shoppingContext: context({ pearlSize: '9-12mm' }),
    availability: [availability(ids.b), availability(ids.c), availability(ids.a)],
  })

  assert.deepEqual(
    ranked.map((candidate) => [candidate.productId, candidate.score]),
    [
      [ids.a, 1],
      [ids.b, 0],
      [ids.c, 0],
    ]
  )
})

test('pearl size: exact plus-or-minus 0.2mm boundaries are inclusive', () => {
  const lowerBoundary = product(ids.a, { size_mm: '8.8mm' })
  const upperBoundary = product(ids.b, { size_mm: '12.2mm' })
  const ranked = rankProducts({
    products: [lowerBoundary, upperBoundary],
    shoppingContext: context({ pearlSize: '9-12mm' }),
    availability: [availability(ids.a), availability(ids.b)],
  })

  assert.deepEqual(
    ranked.map((candidate) => candidate.score),
    [1, 1]
  )
})
