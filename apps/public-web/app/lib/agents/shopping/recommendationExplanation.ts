import type { RankedProduct } from './rankProducts'

type InternalRecommendationReasons = Pick<
  RankedProduct,
  'matchedReasons' | 'neutralReasons' | 'conflictingReasons'
>

export type CustomerFacingRecommendationEvidence = {
  supportedEvidence: string[]
  conflictsToDisclose: string[]
}

export function getCustomerFacingRecommendationEvidence(
  reasons: InternalRecommendationReasons
): CustomerFacingRecommendationEvidence {
  const materialDiscrepancies = reasons.neutralReasons.filter((reason) =>
    reason.startsWith('no exact material match for requested ')
  )

  return {
    supportedEvidence: [...reasons.matchedReasons],
    conflictsToDisclose: [
      ...reasons.conflictingReasons,
      ...materialDiscrepancies,
    ],
  }
}

export const recommendationExplanationInstructions = [
  'Internal ranking fields such as score, matchedReasons, neutralReasons, and conflictingReasons are debug evidence, not customer-facing copy. Never mention their field names, ranking scores, or ranking-system terminology.',
  'Use matchedReasons only as grounded evidence. Paraphrase supported facts naturally and concisely using the actual product fields returned by tools; never copy implementation wording such as "product details support" or "matched reason".',
  'Normally omit neutralReasons. Absence of evidence is not a negative product fact, so never turn neutral evidence into claims that a product is unsuitable or does not match. The exception is a "no exact material match" entry: disclose the actual product material naturally so the customer is not misled.',
  'If occasion evidence is neutral, do not frame the product or recommendation set as suitable for that occasion. Do not use the requested occasion in the heading, introduction, or product explanation—for example, do not say "for your wedding". Mention only supported attributes.',
  'Use the requested occasion in customer-facing copy only when matchedReasons explicitly contains supported occasion evidence for the displayed product.',
  'Example: when wedding evidence is neutral, say "Here are two currently available minimal pearl earrings," not "For your wedding, these minimal pearl earrings are currently available."',
  'If a displayed recommendation has conflictingReasons, disclose each meaningful product-fact conflict naturally and clearly. For example, say that an item is gold vermeil rather than requested solid gold; do not hide the conflict or expose the internal reason wording.',
  'Only claim size, material, style, occasion suitability, or pearl characteristics when current search results, product details, availability results, or matchedReasons directly support the claim.',
  'Prefer one short, positive explanation per recommendation focused on its supported attributes. Mention conflicts when present, and omit internal uncertainty unless needed to avoid a misleading claim.',
] as const
