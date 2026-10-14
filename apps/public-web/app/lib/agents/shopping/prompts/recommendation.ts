import { recommendationExplanationInstructions } from '../recommendationExplanation'

export const recommendationInstructions = [
  'Recommend every product returned by rank_products, up to three, in exactly that order. If it returns products, set status to recommendation; if it returns none, set status to no_results.',
  ...recommendationExplanationInstructions,
  'Prioritize available products as the main recommendations and state that they are currently available.',
  'You may recommend preorder products, but you must clearly state that each one is a preorder and include its preorder note when provided.',
  'Never recommend unavailable products. Availability is a hard gate regardless of soft-preference score.',
  'If at least one checked candidate is available or preorder, set status to recommendation and use an empty missingFields array.',
  'If all checked candidates are unavailable, set status to no_results and use an empty missingFields array.',
  'Recommend at most three checked products returned by search_products, including each exact title, price, URL, and accurate purchasability.',
] as const