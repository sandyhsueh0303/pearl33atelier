import type { RecommendedProduct } from './shoppingContext'

const ORDINAL_REFERENCE_PATTERN = /\b(first|second|third|last)(?:\s+one)?\b/i
const AVAILABILITY_PATTERN =
  /\b(available|availability|in[ -]?stock|purchasable|purchase|buy|pre-?order|still available)\b/i
const PRODUCT_DETAILS_PATTERN =
  /\b(tell me more|details?|learn more|material|shape|luster|overtone|description|price|size)\b/i

export type RecommendedProductReferencePlan = {
  checkAvailability: boolean
  getDetails: boolean
}

export type RecommendedProductReferenceToolName =
  | 'check_product_availability'
  | 'get_product_details'

export function hasRecommendedProductReference(message: string): boolean {
  return ORDINAL_REFERENCE_PATTERN.test(message)
}

export function resolveRecommendedProductReference(
  message: string,
  recommendedProducts: readonly RecommendedProduct[]
): RecommendedProduct | null {
  const match = message.match(ORDINAL_REFERENCE_PATTERN)
  if (!match) return null

  const ordinal = match[1].toLowerCase()
  const index =
    ordinal === 'first'
      ? 0
      : ordinal === 'second'
        ? 1
        : ordinal === 'third'
          ? 2
          : recommendedProducts.length - 1

  return recommendedProducts[index] ?? null
}

export function planRecommendedProductReferenceTools(
  message: string
): RecommendedProductReferencePlan {
  const checkAvailability = AVAILABILITY_PATTERN.test(message)
  const explicitlyNeedsDetails = PRODUCT_DETAILS_PATTERN.test(message)

  return {
    checkAvailability,
    getDetails: !checkAvailability || explicitlyNeedsDetails,
  }
}

export function getRecommendedProductReferenceToolNames(
  message: string
): RecommendedProductReferenceToolName[] {
  const plan = planRecommendedProductReferenceTools(message)

  return [
    ...(plan.getDetails ? (['get_product_details'] as const) : []),
    ...(plan.checkAvailability
      ? (['check_product_availability'] as const)
      : []),
  ]
}
