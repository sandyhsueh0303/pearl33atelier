import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildEtsyGenerationMetric,
  readOpenAIUsage,
} from '../app/api/products/etsy-listing/generationMetrics'

test('generation metrics read Responses API token usage', () => {
  assert.deepEqual(readOpenAIUsage({
    usage: {
      input_tokens: 12_345,
      output_tokens: 678,
      total_tokens: 13_023,
      input_tokens_details: { cached_tokens: 100 },
    },
  }), {
    inputTokens: 12_345,
    outputTokens: 678,
    totalTokens: 13_023,
  })
})

test('generation metrics tolerate missing or malformed token usage', () => {
  assert.deepEqual(readOpenAIUsage({}), {
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
  })
  assert.deepEqual(readOpenAIUsage({
    usage: {
      input_tokens: -1,
      output_tokens: '100',
      total_tokens: 99.5,
    },
  }), {
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
  })
})

test('generation metrics expose only the approved privacy-safe fields', () => {
  const metric = buildEtsyGenerationMetric({
    outcome: 'success',
    stage: 'complete',
    model: 'test-model',
    durationMs: 1_234.4,
    imageCount: 8,
    taxonomyCandidateCount: 125,
    hasAdminNotes: true,
    openAIStatus: 200,
    usage: {
      inputTokens: 10_000,
      outputTokens: 500,
      totalTokens: 10_500,
    },
  })

  assert.deepEqual(Object.keys(metric), [
    'schemaVersion',
    'event',
    'outcome',
    'stage',
    'model',
    'durationMs',
    'imageCount',
    'taxonomyCandidateCount',
    'hasAdminNotes',
    'openAIStatus',
    'inputTokens',
    'outputTokens',
    'totalTokens',
  ])
  assert.equal(JSON.stringify(metric).includes('product'), false)
  assert.equal(JSON.stringify(metric).includes('prompt'), false)
  assert.equal(JSON.stringify(metric).includes('imageUrl'), false)
  assert.equal(JSON.stringify(metric).includes('notes'), false)
})
