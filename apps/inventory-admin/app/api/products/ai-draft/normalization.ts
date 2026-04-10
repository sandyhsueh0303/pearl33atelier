import type { ExtractedProductAttributes } from './extraction'

export type NormalizedProductAttributes = {
  product_type: string
  category: string
  pearl_type: string
  shape: string
  luster: string
  overtone: string
  size_mm: string
  metal: string
  style_tags: string[]
  raw: {
    pearl_type: string
    overtone_raw: string
    metal_raw: string
    color: string
    size_mm_raw: string
  }
  field_actions: NormalizedFieldActions
  normalization_warnings: string[]
}

export type NormalizedFieldAction = 'ok' | 'needs_review' | 'required_input' | 'optional_warning'

export type NormalizedFieldActions = {
  pearl_type: NormalizedFieldAction
  size_mm: NormalizedFieldAction
  metal: NormalizedFieldAction
}

function normalizeWhitespace(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizeLower(value: string | null | undefined) {
  return normalizeWhitespace(value).toLowerCase()
}

export function decideFieldAction(
  field: string,
  value: string | null | undefined,
  confidence = 1
): NormalizedFieldAction {
  if (field === 'pearl_type' && confidence < 0.7) {
    return 'needs_review'
  }

  if (field === 'size_mm' && !normalizeWhitespace(value)) {
    return 'required_input'
  }

  if (field === 'metal' && normalizeLower(value) === 'metal not visible') {
    return 'optional_warning'
  }

  return 'ok'
}

function normalizeCategory(productType: string, categoryHint: string) {
  const source = `${normalizeLower(productType)} ${normalizeLower(categoryHint)}`
  if (source.includes('stud')) return 'Studs'
  if (source.includes('earring')) return 'Earrings'
  if (source.includes('necklace')) return 'Necklaces'
  if (source.includes('bracelet')) return 'Bracelets'
  if (source.includes('ring')) return 'Rings'
  if (source.includes('pendant')) return 'Pendants'
  if (source.includes('brooch')) return 'Brooches'
  return 'Earrings'
}

function normalizePearlType(extraction: ExtractedProductAttributes, warnings: string[]) {
  const pearlType = normalizeLower(extraction.pearl_type)
  const color = normalizeLower(extraction.color)

  if (pearlType.includes('tahitian')) return 'Tahitian'
  if (pearlType.includes('golden south sea') || pearlType.includes('gold south sea')) {
    return 'GoldenSouthSea'
  }
  if (pearlType.includes('south sea')) {
    if (color.includes('gold')) {
      warnings.push('South Sea pearl type normalized to GoldenSouthSea from body color cue.')
      return 'GoldenSouthSea'
    }
    return 'WhiteSouthSea'
  }
  if (pearlType.includes('grey akoya') || pearlType.includes('gray akoya')) return 'GreyAkoya'
  if (pearlType.includes('white akoya')) return 'WhiteAkoya'
  if (pearlType.includes('akoya')) {
    if (color.includes('grey') || color.includes('gray') || color.includes('blue')) {
      warnings.push('Akoya pearl type normalized to GreyAkoya from body color cue.')
      return 'GreyAkoya'
    }
    warnings.push('Akoya pearl type normalized to WhiteAkoya by default.')
    return 'WhiteAkoya'
  }
  warnings.push('Pearl type normalized to WhiteAkoya because no supported pearl type cue matched.')
  return 'WhiteAkoya'
}

function normalizeShape(shape: string) {
  const value = normalizeLower(shape)
  if (value.includes('baroque')) return 'baroque'
  if (value.includes('drop')) return 'drop'
  if (value.includes('oval')) return 'oval'
  if (value.includes('button')) return 'button'
  if (value.includes('near round') || value.includes('near-round')) return 'near-round'
  return 'round'
}

function normalizeLuster(luster: string) {
  return normalizeLower(luster).includes('soft') ? 'soft' : 'high'
}

function normalizeOvertone(overtone: string, color: string) {
  const source = `${normalizeLower(overtone)} ${normalizeLower(color)}`
  if (!source) return ''
  if (source.includes('pink-green')) return 'pink-green iridescent'
  if (source.includes('pink-blue')) return 'pink-blue iridescent'
  if (source.includes('green-blue')) return 'green-blue iridescent'
  if (source.includes('pink iridescent')) return 'pink iridescent'
  if (source.includes('green iridescent')) return 'green iridescent'
  if (source.includes('blue iridescent')) return 'blue iridescent'
  if (source.includes('gold iridescent')) return 'gold iridescent'
  if (source.includes('multi iridescent')) return 'multi iridescent'
  if (source.includes('green peacock')) return 'green peacock'
  if (source.includes('blue peacock')) return 'blue peacock'
  if (source.includes('peacock')) return 'peacock'
  if (source.includes('silver-blue') || (source.includes('silver') && source.includes('blue'))) {
    return 'silver-blue'
  }
  if (source.includes('aubergine')) return 'aubergine'
  if (source.includes('charcoal')) return 'charcoal'
  if (source.includes('dark green')) return 'dark green'
  if (source.includes('dark blue')) return 'dark blue'
  if (source.includes('graphite')) return 'graphite'
  if (source.includes('rose')) return 'rose'
  if (source.includes('pink')) return 'pink'
  if (source.includes('cream')) return 'cream'
  if (source.includes('gold')) return 'gold'
  if (source.includes('silver')) return 'silver'
  if (source.includes('green')) return 'green iridescent'
  if (source.includes('blue')) return 'blue iridescent'
  if (source.includes('white')) return 'white'
  return normalizeWhitespace(overtone)
}

function normalizeSize(size: string) {
  const value = normalizeWhitespace(size)
  const match = value.match(/(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)/)
  return match ? match[1].replace(/\s+/g, '') : value
}

function normalizeMetal(metal: string) {
  const value = normalizeLower(metal)
  if (value.includes('18k') && value.includes('white')) return '18k white gold'
  if (value.includes('18k') && (value.includes('yellow') || value.includes('gold'))) {
    return '18k yellow gold'
  }
  if (value.includes('white gold')) return 'white gold'
  if (value.includes('yellow gold')) return 'yellow gold'
  if (value.includes('platinum')) return 'platinum'
  if (value.includes('silver')) return 'silver'
  return normalizeWhitespace(metal)
}

function buildStyleTags(extraction: ExtractedProductAttributes, category: string) {
  const tags = new Set<string>()
  const style = normalizeLower(extraction.style)
  const pearlType = normalizeLower(extraction.pearl_type)
  const productType = normalizeLower(extraction.product_type)

  if (style.includes('minimal')) tags.add('minimal')
  if (style.includes('classic')) tags.add('classic')
  if (style.includes('modern')) tags.add('modern')
  if (style.includes('daily')) tags.add('daily wear')
  if (pearlType.includes('akoya')) tags.add('refined')
  if (pearlType.includes('tahitian')) tags.add('distinctive')
  if (productType.includes('stud')) tags.add('everyday wear')
  if (category === 'Studs') tags.add('easy styling')
  if (tags.size === 0) {
    tags.add('refined')
    tags.add('daily wear')
  }
  return Array.from(tags)
}

function buildFieldActions(
  extraction: ExtractedProductAttributes,
  normalized: Pick<NormalizedProductAttributes, 'pearl_type' | 'size_mm' | 'metal'>
): NormalizedFieldActions {
  return {
    pearl_type: decideFieldAction(
      'pearl_type',
      normalized.pearl_type,
      extraction.confidence?.pearl_type
    ),
    size_mm: decideFieldAction('size_mm', normalized.size_mm),
    metal: decideFieldAction('metal', normalized.metal),
  }
}

export function summarizeNormalization(normalized: NormalizedProductAttributes) {
  return [
    `Product type: ${normalized.product_type || 'unknown'}`,
    `Category: ${normalized.category || 'unknown'}`,
    `Pearl type: ${normalized.pearl_type || 'unknown'}`,
    `Shape: ${normalized.shape || 'unknown'}`,
    `Luster: ${normalized.luster || 'unknown'}`,
    `Overtone: ${normalized.overtone || 'unknown'}`,
    `Size: ${normalized.size_mm || 'unknown'}`,
    `Metal: ${normalized.metal || 'unknown'}`,
    normalized.style_tags.length ? `Style tags: ${normalized.style_tags.join(', ')}` : '',
    `Field actions: ${Object.entries(normalized.field_actions)
      .map(([field, action]) => `${field}=${action}`)
      .join(', ')}`,
    normalized.normalization_warnings.length
      ? `Normalization warnings: ${normalized.normalization_warnings.join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function normalizeExtractedProductAttributes(
  extraction: ExtractedProductAttributes
): NormalizedProductAttributes {
  const warnings: string[] = []
  const category = normalizeCategory(extraction.product_type, extraction.category_hint)
  const pearl_type = normalizePearlType(extraction, warnings)
  const shape = normalizeShape(extraction.shape)
  const luster = normalizeLuster(extraction.luster)
  const overtone = normalizeOvertone(extraction.overtone_raw, extraction.color)
  const size_mm = normalizeSize(extraction.size_mm_raw)
  const metal = normalizeMetal(extraction.metal_raw)
  const style_tags = buildStyleTags(extraction, category)
  const field_actions = buildFieldActions(extraction, { pearl_type, size_mm, metal })

  return {
    product_type: normalizeWhitespace(extraction.product_type),
    category,
    pearl_type,
    shape,
    luster,
    overtone,
    size_mm,
    metal,
    style_tags,
    raw: {
      pearl_type: normalizeWhitespace(extraction.pearl_type),
      overtone_raw: normalizeWhitespace(extraction.overtone_raw),
      metal_raw: normalizeWhitespace(extraction.metal_raw),
      color: normalizeWhitespace(extraction.color),
      size_mm_raw: normalizeWhitespace(extraction.size_mm_raw),
    },
    field_actions,
    normalization_warnings: warnings,
  }
}
