import assert from 'node:assert/strict'
import test from 'node:test'
import {
  needsProductDetailsForSoftPreferences,
  rankProducts,
} from '../../app/lib/agents/shopping/rankProducts'
import { availability, context, details, ids, product } from './fixtures'

test('style: matching requires product-detail evidence', () => {
  const supported = product(ids.a)
  const unsupported = product(ids.b)
  const shoppingContext = context({
    style: ['minimal'],
  })
  const ranked = rankProducts({
    products: [unsupported, supported],
    shoppingContext,
    availability: [availability(ids.b), availability(ids.a)],
    productDetails: new Map([
      [
        ids.a,
        details(
          supported,
          'A delicate, understated design with a clean minimal silhouette.'
        ),
      ],
    ]),
  })

  assert.equal(needsProductDetailsForSoftPreferences(shoppingContext), true)
  assert.equal(ranked[0].productId, ids.a)
  assert.equal(ranked[0].score, 2)
  assert.equal(ranked[1].score, 0)
})

test('style: delicate and understated evidence supports minimal style', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ style: ['minimal'] }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [
        ids.a,
        details(
          candidate,
          'A delicate, understated design with a clean silhouette.'
        ),
      ],
    ]),
  })

  assert.equal(ranked.score, 2)
  assert.deepEqual(ranked.matchedReasons, [
    'product details support requested style: minimal',
  ])
})

test('style: classic and versatile evidence is neutral for minimal style', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ style: ['minimal'] }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [ids.a, details(candidate, 'A classic, versatile pearl earring.')],
    ]),
  })

  assert.equal(ranked.score, 0)
  assert.equal(ranked.conflictingReasons.length, 0)
  assert.deepEqual(ranked.neutralReasons, [
    'no explicit evidence for requested style: minimal',
  ])
})

test('style: missing style language is neutral', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ style: ['minimal'] }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [ids.a, details(candidate, 'A luminous pearl with a round shape.')],
    ]),
  })

  assert.equal(ranked.score, 0)
  assert.equal(ranked.conflictingReasons.length, 0)
  assert.deepEqual(ranked.neutralReasons, [
    'no explicit evidence for requested style: minimal',
  ])
})

test('style: bold dramatic statement evidence conflicts with minimal style', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ style: ['minimal'] }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [ids.a, details(candidate, 'A bold, dramatic statement design.')],
    ]),
  })

  assert.equal(ranked.score, -2)
  assert.equal(ranked.neutralReasons.length, 0)
  assert.deepEqual(ranked.conflictingReasons, [
    'product details indicate a bold/dramatic/statement style that conflicts with requested minimal style',
  ])
})

test('style: multiple supporting terms still add only two points', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ style: ['minimal'] }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [
        ids.a,
        details(candidate, 'A minimal, delicate, refined, subtle design.'),
      ],
    ]),
  })

  assert.equal(ranked.score, 2)
  assert.equal(ranked.matchedReasons.length, 1)
})

test('style: multiple requested styles remain one scoring category', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ style: ['minimal', 'classic'] }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [ids.a, details(candidate, 'A minimal and classic refined design.')],
    ]),
  })

  assert.equal(ranked.score, 2)
  assert.deepEqual(ranked.matchedReasons, [
    'product details support requested style: minimal, classic',
  ])
})
