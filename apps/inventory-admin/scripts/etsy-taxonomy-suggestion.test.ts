import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseTaxonomySuggestionOptions,
  resolveTaxonomySuggestion,
} from '../app/api/products/etsy-listing/taxonomySuggestion'

test('taxonomy suggestion candidates keep only valid unique Etsy IDs', () => {
  assert.deepEqual(parseTaxonomySuggestionOptions([
    { id: 101, label: 'Jewelry / Earrings' },
    { id: 101, label: 'Duplicate' },
    { id: 0, label: 'Invalid' },
    { id: 202, label: ' Jewelry / Necklaces ' },
  ]), [
    { id: 101, label: 'Jewelry / Earrings' },
    { id: 202, label: 'Jewelry / Necklaces' },
  ])
})

test('taxonomy suggestion resolves only an ID from the supplied Etsy options', () => {
  const options = [
    { id: 101, label: 'Jewelry / Earrings' },
    { id: 202, label: 'Jewelry / Necklaces' },
  ]
  assert.deepEqual(resolveTaxonomySuggestion(101, options), options[0])
  assert.equal(resolveTaxonomySuggestion(999, options), null)
  assert.equal(resolveTaxonomySuggestion('101', options), null)
})
