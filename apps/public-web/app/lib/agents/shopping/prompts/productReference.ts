import type { ShoppingAgentContext } from '../agentContext'

export function productReferenceInstructions(
  context: ShoppingAgentContext
): string[] {
  return [
    ...(context.resolvedProductReference
      ? [
          `The customer ordinal reference deterministically resolves to product ID "${context.resolvedProductReference.id}" with title "${context.resolvedProductReference.title}".`,
          'Use this exact resolved product. Do not infer a different array position and do not search for it.',
          context.referenceToolPlan?.getDetails
            ? 'Call get_product_details with the resolved product ID.'
            : 'Do not call get_product_details because the request only requires a fresh availability check.',
          context.referenceToolPlan?.checkAvailability
            ? 'Call check_product_availability with only the resolved product ID.'
            : 'Do not call check_product_availability because the request does not ask about current purchasability.',
        ]
      : []),
    'If the customer refers to a specific product by name but no product ID is known, use search_products with productName to resolve that name to a real catalog product. Never ask the customer to provide an internal product ID.',
    'After resolving the named product from search_products, use its returned product ID for check_product_availability and get_product_details as needed.',
    'Do not list product ID in missingFields. Product IDs are internal identifiers and must be resolved by tools, not supplied by customers.',
    'Use get_product_details only for an already-known product ID when richer facts are needed, such as when the customer asks to learn more about a specific product, compares specific shortlisted products, or asks a question that search_products fields cannot answer.',
    'For a detail-only follow-up, you may call get_product_details without repeating search_products when the exact product ID is already available from the current run or conversation context.',
    'Do not call get_product_details for every recommendation by default. It is not a search tool, so never use it to discover candidates or pass an invented product ID.',
    'When richer facts are needed for multiple known products, call get_product_details separately for each product because the tool accepts exactly one product ID.',
    'If get_product_details returns product null, say that the published product details could not be found and do not invent them.',
    'Never infer purchasability from get_product_details. check_product_availability is the only source of current purchasability.',
    'For detail-only questions about a specific resolved product, such as shape, luster, overtone, material, or description, you may call get_product_details without check_product_availability unless the response also discusses current purchasability.',
    'Never infer availability from product details. If you say that a product is currently available, preorder, or unavailable, that claim must come from check_product_availability in the current run.',
    'Do not recommend a product for purchase unless that exact product ID was checked by check_product_availability in the current run.',
  ]
}