export type EtsyGenerationStage =
  | 'configuration'
  | 'preflight'
  | 'openai_request'
  | 'output_validation'
  | 'complete'

export type EtsyGenerationOutcome =
  | 'success'
  | 'configuration_error'
  | 'preflight_rejected'
  | 'preflight_error'
  | 'openai_http_error'
  | 'openai_network_error'
  | 'invalid_model_output'

type OpenAIUsageMetrics = {
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
}

type EtsyGenerationMetricInput = {
  outcome: EtsyGenerationOutcome
  stage: EtsyGenerationStage
  model: string
  durationMs: number
  imageCount: number
  taxonomyCandidateCount: number
  hasAdminNotes: boolean
  openAIStatus: number | null
  usage: OpenAIUsageMetrics
}

function nonNegativeInteger(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0
    ? Number(value)
    : null
}

export function readOpenAIUsage(payload: unknown): OpenAIUsageMetrics {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { inputTokens: null, outputTokens: null, totalTokens: null }
  }

  const usage = (payload as Record<string, unknown>).usage
  if (!usage || typeof usage !== 'object' || Array.isArray(usage)) {
    return { inputTokens: null, outputTokens: null, totalTokens: null }
  }

  const values = usage as Record<string, unknown>
  return {
    inputTokens: nonNegativeInteger(values.input_tokens),
    outputTokens: nonNegativeInteger(values.output_tokens),
    totalTokens: nonNegativeInteger(values.total_tokens),
  }
}

export function buildEtsyGenerationMetric(input: EtsyGenerationMetricInput) {
  return {
    schemaVersion: 1,
    event: 'etsy_listing_ai_generation',
    outcome: input.outcome,
    stage: input.stage,
    model: input.model,
    durationMs: Math.max(0, Math.round(input.durationMs)),
    imageCount: Math.max(0, Math.round(input.imageCount)),
    taxonomyCandidateCount: Math.max(
      0,
      Math.round(input.taxonomyCandidateCount)
    ),
    hasAdminNotes: input.hasAdminNotes,
    openAIStatus: input.openAIStatus,
    inputTokens: input.usage.inputTokens,
    outputTokens: input.usage.outputTokens,
    totalTokens: input.usage.totalTokens,
  }
}

export function logEtsyGenerationMetric(input: EtsyGenerationMetricInput) {
  console.info(
    '[etsy-listing:ai-generation]',
    buildEtsyGenerationMetric(input)
  )
}
