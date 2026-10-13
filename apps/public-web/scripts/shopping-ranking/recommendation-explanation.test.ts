import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getCustomerFacingRecommendationEvidence,
  recommendationExplanationInstructions,
} from '../../app/lib/agents/shopping/recommendationExplanation'

const instructions = recommendationExplanationInstructions.join('\n')

test('recommendation explanation: matched reasons remain available as grounded evidence', () => {
  const evidence = getCustomerFacingRecommendationEvidence({
    matchedReasons: [
      'matches requested 9-12mm pearl size',
      'product details support requested style: minimal',
    ],
    neutralReasons: [],
    conflictingReasons: [],
  })

  assert.deepEqual(evidence.supportedEvidence, [
    'matches requested 9-12mm pearl size',
    'product details support requested style: minimal',
  ])
  assert.match(instructions, /Paraphrase supported facts naturally and concisely/)
})

test('recommendation explanation: neutral reasons are excluded from customer-facing evidence', () => {
  const neutralReason =
    'no explicit wedding-specific evidence in product details; occasion match is neutral'
  const evidence = getCustomerFacingRecommendationEvidence({
    matchedReasons: ['product details support requested style: minimal'],
    neutralReasons: [neutralReason],
    conflictingReasons: [],
  })

  assert.deepEqual(evidence, {
    supportedEvidence: ['product details support requested style: minimal'],
    conflictsToDisclose: [],
  })
  assert.doesNotMatch(JSON.stringify(evidence), /wedding-specific|neutral/)
  assert.match(instructions, /Absence of evidence is not a negative product fact/)
})

test('recommendation explanation: neutral occasion evidence cannot frame the recommendation', () => {
  const evidence = getCustomerFacingRecommendationEvidence({
    matchedReasons: ['product details support requested style: minimal'],
    neutralReasons: [
      'no explicit wedding-specific evidence in product details; occasion match is neutral',
    ],
    conflictingReasons: [],
  })

  assert.deepEqual(evidence, {
    supportedEvidence: ['product details support requested style: minimal'],
    conflictsToDisclose: [],
  })
  assert.match(instructions, /do not say "for your wedding"/i)
  assert.match(
    instructions,
    /Use the requested occasion in customer-facing copy only when matchedReasons explicitly contains supported occasion evidence/
  )
  assert.match(
    instructions,
    /Here are two currently available minimal pearl earrings/
  )
})

test('recommendation explanation: meaningful material conflicts must be disclosed', () => {
  const materialConflict = 'no exact material match for requested solid gold'
  const evidence = getCustomerFacingRecommendationEvidence({
    matchedReasons: ['product details support requested style: minimal'],
    neutralReasons: [materialConflict],
    conflictingReasons: [],
  })

  assert.deepEqual(evidence.conflictsToDisclose, [materialConflict])
  assert.match(instructions, /gold vermeil rather than requested solid gold/)
  assert.match(instructions, /exception is a "no exact material match" entry/)
})

test('recommendation explanation: instructions prohibit score and debug terminology', () => {
  assert.match(instructions, /Never mention their field names, ranking scores/)
  assert.match(instructions, /never copy implementation wording/)
  assert.match(instructions, /matchedReasons/)
  assert.match(instructions, /neutralReasons/)
  assert.match(instructions, /conflictingReasons/)
})

test('recommendation explanation: unsupported suitability claims are prohibited', () => {
  const evidence = getCustomerFacingRecommendationEvidence({
    matchedReasons: [],
    neutralReasons: [
      'no explicit wedding-specific evidence in product details; occasion match is neutral',
      'no exact material match for requested gold',
    ],
    conflictingReasons: [],
  })

  assert.deepEqual(evidence, {
    supportedEvidence: [],
    conflictsToDisclose: ['no exact material match for requested gold'],
  })
  assert.match(
    instructions,
    /Only claim size, material, style, occasion suitability, or pearl characteristics when/
  )
})
