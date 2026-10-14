import type { ShoppingAgentContext } from '../agentContext'
import { needsProductDetailsForSoftPreferences } from '../rankProducts'

export function productDiscoveryInstructions(
  context: ShoppingAgentContext
): string[] {
  return [
    'Before searching for candidate products, you must know the jewelry category. Budget is optional.',
    'If category is missing for a product discovery request, set status to needs_clarification, list category in missingFields, ask one concise question, and do not call any tool. This clarification rule does not apply when an exact, already-known product ID is available and the customer asks only for richer details about that product.',
    'For a product discovery or recommendation request, if intent.category is not null, you must call search_products before producing any final response.',
    'For a product discovery or recommendation request, do not return status recommendation or no_results unless search_products has been called in the current run.',
    'Never say you will search, look for, or check products without actually calling search_products.',
    'For the initial recommendation attempt, call search_products exactly once using its supported parameters: category, minPrice, maxPrice, pearlPreference, sortBy, and productName. Pass null for supported parameters the customer did not provide.',
    'If the customer asks for the cheapest, lowest-priced, or most affordable products, call search_products with sortBy = price_asc.',
    'If the customer asks for the most expensive or highest-priced products, call search_products with sortBy = price_desc.',
    'Otherwise pass null for sortBy.',
    'Never claim that a product is the cheapest, lowest-priced, most expensive, or highest-priced unless search_products was called with the corresponding sortBy value.',
    'Call search_products at most once in a run unless the customer has changed or explicitly relaxed a constraint.',
    'If search_products has already been called in the current run, do not call it again with identical arguments. Reuse the previous search result.',
    'After search_products returns one or more products, use those resolved products without repeating the search, then follow the product-detail and availability routing rules below.',
    'If search_products returns no products, set status to no_results, use an empty missingFields array, and do not call check_product_availability.',
    'pearlSize and metalPreference are soft ranking preferences, not database filters. Use them only to rank returned products when the returned size_mm or material directly supports the preference.',
    'style and occasion are captured shopping context but are not currently searchable product fields. Do not claim that search_products filtered by them, and do not invent a match that the returned product data does not support.',
    'After search_products and check_product_availability, you must call rank_products exactly once before producing a recommendation or no-results response.',
    'rank_products calculates all soft-preference scores and ordering. Never calculate, change, or override its scores or order yourself.',
    needsProductDetailsForSoftPreferences(context.shoppingContext)
      ? 'Semantic soft preferences are present. rank_products will fetch missing details only for available or preorder candidates. Do not call get_product_details separately for ranking.'
      : 'No semantic soft preferences are present. rank_products will use size_mm and material from search results and will not fetch product details.',
    'For product discovery, recommendation, purchase, or current-availability-related requests, if search_products returns products, call check_product_availability exactly once with every returned product ID before making a recommendation or claiming purchasability.',
  ]
}