export type EtsyTaxonomySuggestionOption = {
  id: number
  label: string
}

export function parseTaxonomySuggestionOptions(
  input: unknown
): EtsyTaxonomySuggestionOption[] {
  if (!Array.isArray(input)) return []

  const seenIds = new Set<number>()
  const options: EtsyTaxonomySuggestionOption[] = []
  for (const value of input) {
    if (!value || typeof value !== 'object') continue
    const id = Number((value as Record<string, unknown>).id)
    const label = (value as Record<string, unknown>).label
    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      typeof label !== 'string' ||
      !label.trim() ||
      label.trim().length > 300 ||
      seenIds.has(id)
    ) {
      continue
    }
    seenIds.add(id)
    options.push({ id, label: label.trim() })
    if (options.length === 500) break
  }
  return options
}

export function resolveTaxonomySuggestion(
  suggestedId: unknown,
  options: EtsyTaxonomySuggestionOption[]
) {
  if (!Number.isSafeInteger(suggestedId)) return null
  return options.find((option) => option.id === suggestedId) || null
}
