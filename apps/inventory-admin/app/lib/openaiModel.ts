const DEFAULT_OPENAI_MODEL = 'gpt-5.4-mini'

export function getDefaultOpenAIModel() {
  return process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL
}

export { DEFAULT_OPENAI_MODEL }
