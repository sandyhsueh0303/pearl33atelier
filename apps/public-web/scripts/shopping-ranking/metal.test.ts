import assert from 'node:assert/strict'
import test from 'node:test'
import { rankProducts } from '../../app/lib/agents/shopping/rankProducts'
import { availability, context, ids, product } from './fixtures'

test('metal: exact 18k solid gold ranks above gold vermeil', () => {
  const solidGold = product(ids.a, { material: '18K Solid Gold' })
  const vermeil = product(ids.b, { material: '18K Gold Vermeil' })
  const ranked = rankProducts({
    products: [vermeil, solidGold],
    shoppingContext: context({ metalPreference: '18k solid gold' }),
    availability: [availability(ids.b), availability(ids.a)],
  })

  assert.equal(ranked[0].productId, ids.a)
  assert.equal(ranked[0].score, 3)
  assert.equal(ranked[1].score, 0)
})

test('metal: solid gold does not match gold vermeil', () => {
  const vermeil = product(ids.a, { material: '18k Gold Vermeil' })
  const [ranked] = rankProducts({
    products: [vermeil],
    shoppingContext: context({ metalPreference: '18k solid gold' }),
    availability: [availability(ids.a)],
  })

  assert.equal(ranked.score, 0)
  assert.equal(ranked.matchedReasons.length, 0)
  assert.match(ranked.neutralReasons[0], /no exact material match/)
})

test('metal: white gold does not match white-gold plating', () => {
  const plated = product(ids.a, {
    material: '925 Sterling Silver with White Gold Plating',
  })
  const [ranked] = rankProducts({
    products: [plated],
    shoppingContext: context({ metalPreference: 'white gold' }),
    availability: [availability(ids.a)],
  })

  assert.equal(ranked.score, 0)
  assert.equal(ranked.matchedReasons.length, 0)
})

test('metal: gold vermeil matches 18k Gold Vermeil', () => {
  const vermeil = product(ids.a, { material: '18k Gold Vermeil' })
  const [ranked] = rankProducts({
    products: [vermeil],
    shoppingContext: context({ metalPreference: 'gold vermeil' }),
    availability: [availability(ids.a)],
  })

  assert.equal(ranked.score, 3)
  assert.deepEqual(ranked.matchedReasons, ['matches requested gold vermeil'])
})

test('metal: sterling silver matches 925 Sterling Silver', () => {
  const silver = product(ids.a, { material: '925 Sterling Silver' })
  const [ranked] = rankProducts({
    products: [silver],
    shoppingContext: context({ metalPreference: 'sterling silver' }),
    availability: [availability(ids.a)],
  })

  assert.equal(ranked.score, 3)
  assert.deepEqual(ranked.matchedReasons, [
    'matches requested sterling silver',
  ])
})

test('metal: broad gold preference does not claim an exact match', () => {
  const solidGold = product(ids.a, { material: '18k Yellow Gold' })
  const [ranked] = rankProducts({
    products: [solidGold],
    shoppingContext: context({ metalPreference: 'gold' }),
    availability: [availability(ids.a)],
  })

  assert.equal(ranked.score, 0)
  assert.equal(ranked.matchedReasons.length, 0)
  assert.deepEqual(ranked.neutralReasons, [
    'no exact material match for requested gold',
  ])
})

test('metal: gold colors and plating remain distinct canonical materials', () => {
  const yellowGold = product(ids.a, { material: '14k Yellow Gold' })
  const roseGold = product(ids.b, { material: '14k Rose Gold' })
  const goldPlated = product(ids.c, { material: '18k Gold Plating' })
  const available = [availability(ids.a), availability(ids.b), availability(ids.c)]

  const requestedYellow = rankProducts({
    products: [roseGold, yellowGold],
    shoppingContext: context({ metalPreference: 'yellow gold' }),
    availability: available,
  })
  const requestedPlated = rankProducts({
    products: [yellowGold, goldPlated],
    shoppingContext: context({ metalPreference: 'gold plated' }),
    availability: available,
  })

  assert.deepEqual(
    requestedYellow.map((candidate) => [candidate.productId, candidate.score]),
    [
      [ids.a, 3],
      [ids.b, 0],
    ]
  )
  assert.deepEqual(
    requestedPlated.map((candidate) => [candidate.productId, candidate.score]),
    [
      [ids.c, 3],
      [ids.a, 0],
    ]
  )
})
