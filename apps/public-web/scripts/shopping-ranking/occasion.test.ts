import assert from 'node:assert/strict'
import test from 'node:test'
import { rankProducts } from '../../app/lib/agents/shopping/rankProducts'
import { availability, context, details, ids, product } from './fixtures'

test('occasion: bridal or wedding evidence supports a wedding request', () => {
  const supported = product(ids.a)
  const unsupported = product(ids.b)
  const ranked = rankProducts({
    products: [unsupported, supported],
    shoppingContext: context({ occasion: 'wedding' }),
    availability: [availability(ids.b), availability(ids.a)],
    productDetails: new Map([
      [ids.a, details(supported, 'Designed for weddings and bridal celebrations.')],
      [ids.b, details(unsupported, 'An everyday pearl earring.')],
    ]),
  })

  assert.equal(ranked[0].productId, ids.a)
  assert.equal(ranked[0].score, 2)
  assert.equal(ranked[1].score, 0)
  assert.equal(ranked[1].matchedReasons.length, 0)
  assert.equal(ranked[1].conflictingReasons.length, 0)
  assert.match(ranked[1].neutralReasons[0], /everyday/)
})

test('occasion: everyday and versatile language is neutral for a wedding', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ occasion: 'wedding' }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [
        ids.a,
        details(
          candidate,
          'A simple, versatile everyday design that is easy to wear.'
        ),
      ],
    ]),
  })

  assert.equal(ranked.score, 0)
  assert.equal(ranked.matchedReasons.length, 0)
  assert.equal(ranked.conflictingReasons.length, 0)
  assert.match(ranked.neutralReasons[0], /everyday/)
  assert.doesNotMatch(ranked.neutralReasons[0], /does not support/)
})

test('occasion: missing occasion language is neutral', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ occasion: 'wedding' }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [ids.a, details(candidate, 'A luminous pearl with a round shape.')],
    ]),
  })

  assert.equal(ranked.score, 0)
  assert.equal(ranked.conflictingReasons.length, 0)
  assert.deepEqual(ranked.neutralReasons, [
    'no explicit wedding-specific evidence in product details; occasion match is neutral',
  ])
})

test('occasion: explicit wedding conflict receives a negative score', () => {
  const candidate = product(ids.a)
  const [ranked] = rankProducts({
    products: [candidate],
    shoppingContext: context({ occasion: 'wedding' }),
    availability: [availability(ids.a)],
    productDetails: new Map([
      [
        ids.a,
        details(candidate, 'This casual piece is not suitable for weddings.'),
      ],
    ]),
  })

  assert.equal(ranked.score, -2)
  assert.equal(ranked.neutralReasons.length, 0)
  assert.deepEqual(ranked.conflictingReasons, [
    'product details explicitly conflict with the wedding occasion',
  ])
})
