import type { NormalizedProductAttributes } from './normalization'

export type EnrichedProductAttributes = {
  product_type: string
  category: string
  pearl_type: string
  shape: string
  luster: string
  overtone: string
  size_mm: string
  metal: string
  style_tags: string[]
  positioning: string
  price_tier: string
  styling_tags: string[]
  occasion_tags: string[]
  enrichment_notes: string[]
}

function parseSizeMidpoint(size: string) {
  const normalized = String(size || '').trim()
  const match = normalized.match(/^(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?$/)
  if (!match) return null
  const min = Number(match[1])
  const max = match[2] ? Number(match[2]) : min
  return (min + max) / 2
}

function inferPositioning(normalized: NormalizedProductAttributes, notes: string[]) {
  if (normalized.pearl_type === 'Tahitian') {
    notes.push('Tahitian pearls positioned as more distinctive and statement-leaning.')
    return 'modern statement'
  }

  if (normalized.luster === 'high' && normalized.pearl_type.includes('SouthSea')) {
    notes.push('High-luster South Sea pearls positioned toward elevated luxury.')
    return 'elevated luxury'
  }

  notes.push('Default positioning set to everyday luxury.')
  return 'everyday luxury'
}

function inferPriceTier(normalized: NormalizedProductAttributes, notes: string[]) {
  const sizeMid = parseSizeMidpoint(normalized.size_mm)
  if (normalized.pearl_type === 'Tahitian' || normalized.pearl_type.includes('SouthSea')) {
    notes.push('Pearl type suggests a higher price tier.')
    return 'high'
  }
  if (normalized.luster === 'high' && sizeMid && sizeMid >= 7.5) {
    notes.push('High luster and larger size suggest a mid-high price tier.')
    return 'mid-high'
  }
  return 'mid'
}

function buildStylingTags(normalized: NormalizedProductAttributes, notes: string[]) {
  const tags = new Set<string>(normalized.style_tags)
  if (normalized.category === 'Studs') tags.add('minimal')
  if (normalized.category === 'Earrings') tags.add('polished')
  if (normalized.pearl_type === 'Tahitian') tags.add('modern')
  if (normalized.pearl_type.includes('Akoya')) tags.add('classic')
  if (normalized.overtone.includes('silver') || normalized.overtone.includes('blue')) {
    tags.add('cool-toned')
  }
  if (normalized.overtone.includes('rose') || normalized.overtone.includes('gold')) {
    tags.add('warm-toned')
  }
  notes.push('Styling tags derived from normalized category, pearl type, and overtone.')
  return Array.from(tags)
}

function buildOccasionTags(normalized: NormalizedProductAttributes, notes: string[]) {
  const tags = new Set<string>()
  if (normalized.category === 'Studs') tags.add('daily wear')
  if (normalized.category === 'Earrings' && normalized.luster === 'high') tags.add('office wear')
  if (normalized.pearl_type === 'Tahitian' || normalized.size_mm && parseSizeMidpoint(normalized.size_mm)! >= 8) {
    tags.add('special occasions')
  }
  if (tags.size === 0) tags.add('daily wear')
  notes.push('Occasion tags inferred from category, luster, pearl type, and size.')
  return Array.from(tags)
}

export function summarizeEnrichment(enriched: EnrichedProductAttributes) {
  return [
    `Product type: ${enriched.product_type || 'unknown'}`,
    `Category: ${enriched.category || 'unknown'}`,
    `Pearl type: ${enriched.pearl_type || 'unknown'}`,
    `Shape: ${enriched.shape || 'unknown'}`,
    `Luster: ${enriched.luster || 'unknown'}`,
    `Overtone: ${enriched.overtone || 'unknown'}`,
    `Size: ${enriched.size_mm || 'unknown'}`,
    `Metal: ${enriched.metal || 'unknown'}`,
    `Positioning: ${enriched.positioning || 'unknown'}`,
    `Price tier: ${enriched.price_tier || 'unknown'}`,
    enriched.styling_tags.length ? `Styling tags: ${enriched.styling_tags.join(', ')}` : '',
    enriched.occasion_tags.length ? `Occasion tags: ${enriched.occasion_tags.join(', ')}` : '',
    enriched.enrichment_notes.length
      ? `Enrichment notes: ${enriched.enrichment_notes.join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function enrichNormalizedProductAttributes(
  normalized: NormalizedProductAttributes
): EnrichedProductAttributes {
  const enrichment_notes: string[] = []
  const positioning = inferPositioning(normalized, enrichment_notes)
  const price_tier = inferPriceTier(normalized, enrichment_notes)
  const styling_tags = buildStylingTags(normalized, enrichment_notes)
  const occasion_tags = buildOccasionTags(normalized, enrichment_notes)

  return {
    product_type: normalized.product_type,
    category: normalized.category,
    pearl_type: normalized.pearl_type,
    shape: normalized.shape,
    luster: normalized.luster,
    overtone: normalized.overtone,
    size_mm: normalized.size_mm,
    metal: normalized.metal,
    style_tags: normalized.style_tags,
    positioning,
    price_tier,
    styling_tags,
    occasion_tags,
    enrichment_notes,
  }
}
