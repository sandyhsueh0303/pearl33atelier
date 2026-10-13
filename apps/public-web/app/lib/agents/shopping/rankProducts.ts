import { z } from 'zod'
import { productAvailabilityResultSchema } from './checkProductAvailabilitySchema'
import type { ProductDetailsResult } from './getProductDetailsSchema'
import type { ShoppingContext } from './shoppingContext'
import { searchProductResultSchema } from './searchProductsSchema'

type ProductAvailabilityResult = z.infer<
  typeof productAvailabilityResultSchema
>
type SearchProductResult = z.infer<typeof searchProductResultSchema>

export const SOFT_PREFERENCE_WEIGHTS = {
  pearlSize: 3,
  pearlSizeTolerance: 1,
  metalPreference: 3,
  style: 2,
  occasion: 2,
  occasionConflict: -2,
} as const

export const PEARL_SIZE_TOLERANCE_MM = 0.2

export const rankedProductSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(1),
  score: z.number().int(),
  matchedReasons: z.array(z.string()),
  neutralReasons: z.array(z.string()),
  conflictingReasons: z.array(z.string()),
  purchasability: z.enum(['available', 'preorder']),
})

export const rankedProductsOutputSchema = z.object({
  products: z.array(rankedProductSchema).max(3),
})

export type RankedProduct = z.infer<typeof rankedProductSchema>

type RankProductsInput = {
  products: readonly SearchProductResult[]
  shoppingContext: ShoppingContext
  availability: readonly ProductAvailabilityResult[]
  productDetails?: ReadonlyMap<string, ProductDetailsResult>
}

const WEDDING_SUPPORT_TERMS = [
  'wedding',
  'weddings',
  'bridal',
  'bride',
  'ceremony',
  'formal',
  'formal occasion',
  'special occasion',
] as const

const WEDDING_CONFLICT_TERMS = [
  'not suitable for wedding',
  'not suitable for weddings',
  'not for wedding',
  'not for weddings',
  'not intended for wedding',
  'not intended for weddings',
  'unsuitable for wedding',
  'unsuitable for weddings',
  'not suitable for formal occasions',
] as const

const WEDDING_NEUTRAL_TERMS = [
  'everyday',
  'daily',
  'versatile',
  'classic',
  'simple',
  'easy to wear',
] as const

const MINIMAL_STYLE_SUPPORT_TERMS = [
  'minimal',
  'minimalist',
  'simple',
  'clean',
  'delicate',
  'understated',
  'subtle',
  'refined',
] as const

const MINIMAL_STYLE_CONFLICT_TERMS = [
  'bold',
  'dramatic',
  'statement',
  'oversized',
  'eye catching',
] as const

type SizeRange = {
  min: number
  max: number
}

function parseSizeRange(value: string): SizeRange | null {
  const measurements = value
    .replace(/[–—]/g, '-')
    .match(/\d+(?:\.\d+)?/g)
    ?.slice(0, 2)
    .map(Number)

  if (!measurements?.length || measurements.some(Number.isNaN)) return null

  const first = measurements[0]
  const second = measurements[1] ?? first

  return {
    min: Math.min(first, second),
    max: Math.max(first, second),
  }
}

function getPearlSizeMatch(
  requestedValue: string,
  productValue: string
): 'exact' | 'tolerance' | null {
  const requested = parseSizeRange(requestedValue)
  const product = parseSizeRange(productValue)
  if (!requested || !product) return null

  const epsilon = Number.EPSILON * 100
  const isExact =
    product.min + epsilon >= requested.min &&
    product.max <= requested.max + epsilon
  if (isExact) return 'exact'

  const isWithinTolerance =
    product.min + epsilon >= requested.min - PEARL_SIZE_TOLERANCE_MM &&
    product.max <= requested.max + PEARL_SIZE_TOLERANCE_MM + epsilon

  return isWithinTolerance ? 'tolerance' : null
}

function normalizeEvidence(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[–—-]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

type NormalizedMetal = {
  kind:
    | 'solid_gold'
    | 'gold_vermeil'
    | 'gold_plated'
    | 'sterling_silver'
    | 'broad_gold'
    | 'unknown'
  color: 'white' | 'yellow' | 'rose' | null
  karat: number | null
}

function normalizeMetal(value: string): NormalizedMetal {
  const normalized = normalizeEvidence(value)
  const karatMatch = normalized.match(/\b(\d{1,2})\s*(?:k|karat)\b/)
  const karat = karatMatch ? Number(karatMatch[1]) : null
  const color = /\bwhite gold\b/.test(normalized)
    ? 'white'
    : /\byellow gold\b/.test(normalized)
      ? 'yellow'
      : /\brose gold\b/.test(normalized)
        ? 'rose'
        : null

  if (/\bgold vermeil\b|\bvermeil\b/.test(normalized)) {
    return { kind: 'gold_vermeil', color, karat }
  }

  if (
    /\bgold\b/.test(normalized) &&
    /\b(plated|plating|plate)\b/.test(normalized)
  ) {
    return { kind: 'gold_plated', color, karat }
  }

  if (/\bsterling silver\b|\b925 silver\b/.test(normalized)) {
    return { kind: 'sterling_silver', color: null, karat: null }
  }

  if (normalized === 'gold') {
    return { kind: 'broad_gold', color: null, karat: null }
  }

  if (/\bgold\b/.test(normalized)) {
    return { kind: 'solid_gold', color, karat }
  }

  return { kind: 'unknown', color: null, karat: null }
}

function isExactMetalMatch(
  requestedValue: string,
  productValue: string
): boolean {
  const requested = normalizeMetal(requestedValue)
  const product = normalizeMetal(productValue)

  if (
    requested.kind === 'unknown' ||
    requested.kind === 'broad_gold' ||
    requested.kind !== product.kind
  ) {
    return false
  }

  if (requested.color && requested.color !== product.color) return false
  if (requested.karat && requested.karat !== product.karat) return false

  return true
}

function includesEvidence(evidence: string, preference: string): boolean {
  const normalizedPreference = normalizeEvidence(preference)
  return normalizedPreference.length > 0 && evidence.includes(normalizedPreference)
}

function includesEvidencePhrase(evidence: string, phrase: string): boolean {
  const normalizedPhrase = normalizeEvidence(phrase)
  if (!normalizedPhrase) return false

  return ` ${evidence} `.includes(` ${normalizedPhrase} `)
}

type OccasionEvidence = {
  state: 'supported' | 'neutral' | 'conflicting'
  neutralTerms: string[]
}

type StyleEvidence = {
  state: 'supported' | 'neutral' | 'conflicting'
  supportedStyles: string[]
  conflictingTerms: string[]
}

function classifyStyleEvidence(
  requestedStyles: readonly string[],
  evidence: string
): StyleEvidence {
  const supportedStyles = requestedStyles.filter((style) => {
    const normalizedStyle = normalizeEvidence(style)
    const supportTerms =
      normalizedStyle === 'minimal'
        ? MINIMAL_STYLE_SUPPORT_TERMS
        : [style]

    return supportTerms.some((term) => includesEvidencePhrase(evidence, term))
  })

  if (supportedStyles.length > 0) {
    return { state: 'supported', supportedStyles, conflictingTerms: [] }
  }

  const conflictingTerms = requestedStyles.flatMap((style) =>
    normalizeEvidence(style) === 'minimal'
      ? MINIMAL_STYLE_CONFLICT_TERMS.filter((term) =>
          includesEvidencePhrase(evidence, term)
        )
      : []
  )

  if (conflictingTerms.length > 0) {
    return { state: 'conflicting', supportedStyles: [], conflictingTerms }
  }

  return { state: 'neutral', supportedStyles: [], conflictingTerms: [] }
}

function classifyOccasionEvidence(
  occasion: string,
  evidence: string
): OccasionEvidence {
  const normalizedOccasion = normalizeEvidence(occasion)
  const isWedding = ['wedding', 'weddings'].includes(normalizedOccasion)
  const conflictTerms = isWedding
    ? WEDDING_CONFLICT_TERMS
    : [
        `not suitable for ${occasion}`,
        `not for ${occasion}`,
        `not intended for ${occasion}`,
        `unsuitable for ${occasion}`,
      ]

  if (conflictTerms.some((term) => includesEvidencePhrase(evidence, term))) {
    return { state: 'conflicting', neutralTerms: [] }
  }

  const supportTerms = isWedding ? WEDDING_SUPPORT_TERMS : [occasion]
  if (supportTerms.some((term) => includesEvidencePhrase(evidence, term))) {
    return { state: 'supported', neutralTerms: [] }
  }

  const neutralTerms = isWedding
    ? WEDDING_NEUTRAL_TERMS.filter((term) =>
        includesEvidencePhrase(evidence, term)
      )
    : []

  return { state: 'neutral', neutralTerms }
}

function buildSemanticEvidence(details: ProductDetailsResult | undefined): string {
  if (!details) return ''

  return normalizeEvidence(
    [
      details.title,
      details.description,
      details.shape,
      details.luster,
      details.overtone,
      details.material,
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ')
  )
}

export function needsProductDetailsForSoftPreferences(
  shoppingContext: ShoppingContext
): boolean {
  return (
    shoppingContext.style.length > 0 ||
    shoppingContext.occasion !== null
  )
}

export function rankProducts({
  products,
  shoppingContext,
  availability,
  productDetails = new Map(),
}: RankProductsInput): RankedProduct[] {
  const availabilityByProductId = new Map(
    availability.map((result) => [result.productId, result])
  )

  return products
    .map((product, originalIndex) => {
      const availabilityResult = availabilityByProductId.get(product.id)
      if (
        !availabilityResult ||
        availabilityResult.purchasability === 'unavailable'
      ) {
        return null
      }

      let score = 0
      const matchedReasons: string[] = []
      const neutralReasons: string[] = []
      const conflictingReasons: string[] = []

      if (shoppingContext.pearlSize) {
        const sizeMatch = product.size_mm
          ? getPearlSizeMatch(shoppingContext.pearlSize, product.size_mm)
          : null

        if (sizeMatch === 'exact') {
          score += SOFT_PREFERENCE_WEIGHTS.pearlSize
          matchedReasons.push(
            `matches requested ${shoppingContext.pearlSize} pearl size`
          )
        } else if (sizeMatch === 'tolerance') {
          score += SOFT_PREFERENCE_WEIGHTS.pearlSizeTolerance
          matchedReasons.push(
            `is within ${PEARL_SIZE_TOLERANCE_MM}mm of the requested ${shoppingContext.pearlSize} pearl size`
          )
        } else {
          const reason = `does not match requested ${shoppingContext.pearlSize} pearl size`
          if (product.size_mm) conflictingReasons.push(reason)
          else neutralReasons.push('no pearl-size evidence in product data')
        }
      }

      if (shoppingContext.metalPreference) {
        if (
          product.material &&
          isExactMetalMatch(shoppingContext.metalPreference, product.material)
        ) {
          score += SOFT_PREFERENCE_WEIGHTS.metalPreference
          matchedReasons.push(
            `matches requested ${shoppingContext.metalPreference}`
          )
        } else {
          neutralReasons.push(
            product.material
              ? `no exact material match for requested ${shoppingContext.metalPreference}`
              : 'no material evidence in product data'
          )
        }
      }

      const evidence = buildSemanticEvidence(productDetails.get(product.id))
      if (shoppingContext.style.length > 0) {
        const styleEvidence = classifyStyleEvidence(
          shoppingContext.style,
          evidence
        )

        if (styleEvidence.state === 'supported') {
          score += SOFT_PREFERENCE_WEIGHTS.style
          matchedReasons.push(
            `product details support requested style: ${styleEvidence.supportedStyles.join(', ')}`
          )
        } else if (styleEvidence.state === 'conflicting') {
          score -= SOFT_PREFERENCE_WEIGHTS.style
          conflictingReasons.push(
            `product details indicate a ${[...new Set(styleEvidence.conflictingTerms)].join('/')} style that conflicts with requested ${shoppingContext.style.join(', ')} style`
          )
        } else {
          neutralReasons.push(
            `no explicit evidence for requested style: ${shoppingContext.style.join(', ')}`
          )
        }
      }

      if (shoppingContext.occasion) {
        const occasionEvidence = classifyOccasionEvidence(
          shoppingContext.occasion,
          evidence
        )

        if (occasionEvidence.state === 'supported') {
          score += SOFT_PREFERENCE_WEIGHTS.occasion
          matchedReasons.push(
            `product details support the ${shoppingContext.occasion} occasion`
          )
        } else if (occasionEvidence.state === 'conflicting') {
          score += SOFT_PREFERENCE_WEIGHTS.occasionConflict
          conflictingReasons.push(
            `product details explicitly conflict with the ${shoppingContext.occasion} occasion`
          )
        } else {
          neutralReasons.push(
            occasionEvidence.neutralTerms.length > 0
              ? `product details describe it as ${occasionEvidence.neutralTerms.join('/')}, but contain no explicit ${shoppingContext.occasion}-specific evidence`
              : `no explicit ${shoppingContext.occasion}-specific evidence in product details; occasion match is neutral`
          )
        }
      }

      return {
        productId: product.id,
        title: product.title,
        score,
        matchedReasons,
        neutralReasons,
        conflictingReasons,
        purchasability: availabilityResult.purchasability,
        originalIndex,
      }
    })
    .filter((product): product is NonNullable<typeof product> => product !== null)
    // Soft Ranking V1: score descending, then preserve original search order.
    // V2: consider inventory age as a merchandising tie-breaker
    // once inventory metadata is available to the ranking layer.
    .sort((left, right) => right.score - left.score || left.originalIndex - right.originalIndex)
    .map(({ originalIndex: _originalIndex, ...product }) => product)
}
