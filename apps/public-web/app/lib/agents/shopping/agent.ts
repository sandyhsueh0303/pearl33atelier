import {
  Agent,
  RunToolCallItem,
  RunToolCallOutputItem,
  run,
  tool,
} from '@openai/agents'
import { z } from 'zod'
import {
  detectExplicitCategory,
  shoppingIntentSchema,
  type ShoppingCategory,
  type ShoppingIntent,
} from './intent'
import {
  createEmptyShoppingContext,
  getMissingFields,
  mergeShoppingContext,
  recommendedProductSchema,
  replaceRecommendedProducts,
  type RecommendedProduct,
  type ShoppingContext,
} from './shoppingContext'
import {
  hasRecommendedProductReference,
  planRecommendedProductReferenceTools,
  resolveRecommendedProductReference,
  type RecommendedProductReferencePlan,
} from './referenceResolution'
import { checkProductAvailability } from './checkProductAvailability'
import {
  checkProductAvailabilityInputSchema,
  checkProductAvailabilityOutputSchema,
} from './checkProductAvailabilitySchema'
import { getProductDetails } from './getProductDetails'
import {
  getProductDetailsInputSchema,
  getProductDetailsOutputSchema,
} from './getProductDetailsSchema'
import { searchProducts } from './searchProducts'
import {
  searchProductsInputSchema,
  searchProductsOutputSchema,
} from './searchProductsSchema'

const shoppingAgentResponseSchema = z.object({
  status: z.enum(['needs_clarification', 'recommendation', 'no_results']),
  missingFields: z.array(z.string()),
  intent: shoppingIntentSchema,
  recommendedProducts: z.array(recommendedProductSchema).max(3),
  message: z.string().min(1).max(1_200),
})

type ShoppingAgentContext = {
  explicitCategory: ShoppingCategory | null
  shoppingContext: ShoppingContext
  resolvedProductReference: RecommendedProduct | null
  referenceToolPlan: RecommendedProductReferencePlan | null
}

type ShoppingIntentAgentContext = {
  explicitCategory: ShoppingCategory | null
}

const shoppingIntentAgent = new Agent<
  ShoppingIntentAgentContext,
  typeof shoppingIntentSchema
>({
  name: '33 Pearl Atelier Shopping Intent Extractor',
  instructions: ({ context }) => [
    'Extract only the shopping preferences expressed or clearly implied in the current customer message.',
    'Return null for every nullable field not expressed in this message and an empty style array when no style is expressed.',
    'Do not carry over preferences from earlier messages.',
    'Treat corrections such as "actually", "instead", or "change it to" as explicit new values. Extract the corrected value so it replaces the previous scalar value during context merge.',
    'Normalize category words: earring, earrings, stud, or studs means earrings; necklace or necklaces means necklaces; bracelet or bracelets means bracelets; ring or rings means rings; pendant or pendants means pendants; brooch or brooches means brooches; loose pearl or loose pearls means loose_pearls.',
    ...(context.explicitCategory
      ? [
          `A deterministic parser found the category "${context.explicitCategory}". Set category to "${context.explicitCategory}".`,
        ]
      : []),
    'Descriptive words such as elegant, minimal, classic, modern, or glamorous belong in style.',
    'Map understated, delicate, or low-profile to statementLevel subtle; noticeable but restrained to balanced; and bold, glamorous, or eye-catching to statement.',
  ].join('\n'),
  outputType: shoppingIntentSchema,
})

const searchProductsTool = tool({
  name: 'search_products',
  description:
    'Search published 33 Pearl Atelier products using category and optional product name, minimum price, maximum price, pearl preference, and price ordering.',
  parameters: searchProductsInputSchema,
  outputSchema: searchProductsOutputSchema,
  async execute(input) {
    return searchProducts(input)
  },
})

const checkProductAvailabilityTool = tool({
  name: 'check_product_availability',
  description:
    'Return the current purchasability of one to three published products in one batch using the existing inventory and BOM domain logic. Pass every product returned by search_products in one call.',
  parameters: checkProductAvailabilityInputSchema,
  outputSchema: checkProductAvailabilityOutputSchema,
  async execute(input) {
    return checkProductAvailability(input)
  },
})

const getProductDetailsTool = tool({
  name: 'get_product_details',
  description:
    'Return richer customer-facing facts for one already-known published product. This tool does not search for products or determine availability.',
  parameters: getProductDetailsInputSchema,
  outputSchema: getProductDetailsOutputSchema,
  async execute(input) {
    return getProductDetails(input)
  },
})

function createResolvedProductDetailsTool(product: RecommendedProduct) {
  return tool({
    name: 'get_product_details',
    description: `Return richer customer-facing facts for the resolved product "${product.title}".`,
    parameters: z.object({ productId: z.literal(product.id) }),
    outputSchema: getProductDetailsOutputSchema,
    async execute() {
      return getProductDetails({ productId: product.id })
    },
  })
}

function createResolvedProductAvailabilityTool(product: RecommendedProduct) {
  return tool({
    name: 'check_product_availability',
    description: `Return current purchasability for the resolved product "${product.title}".`,
    parameters: z.object({
      productIds: z.array(z.literal(product.id)).length(1),
    }),
    outputSchema: checkProductAvailabilityOutputSchema,
    async execute() {
      return checkProductAvailability({ productIds: [product.id] })
    },
  })
}

export const shoppingAgent = new Agent<
  ShoppingAgentContext,
  typeof shoppingAgentResponseSchema
>({
  name: '33 Pearl Atelier Shopping Agent',
  instructions: ({ context }) => [
    // Role
    'You help customers discover published pearl jewelry from 33 Pearl Atelier.',

    // Intent extraction
    `The merged shopping context for this turn is ${JSON.stringify(context.shoppingContext)}.`,
    'Base every clarification, search, and recommendation decision on this merged shopping context, not only on the latest customer message.',
    'Return the merged shopping context exactly in intent. Do not clear preferences merely because the latest message omits them.',
    'The recommendedProducts output must contain only the products actually recommended in the customer-facing message, in exactly the same displayed order. Include each product ID and exact title.',
    'For a recommendation response, recommendedProducts must contain every displayed recommendation and no undisplayed search result. For a non-recommendation response, return an empty recommendedProducts array.',
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
    'Determine intent.category before deciding whether clarification is needed.',
    'Normalize category words as follows: earring, earrings, stud, or studs means earrings; necklace or necklaces means necklaces; bracelet or bracelets means bracelets; ring or rings means rings; pendant or pendants means pendants; brooch or brooches means brooches; loose pearl or loose pearls means loose_pearls.',
    'If the customer explicitly uses any mapped category word, intent.category must be that category and must not be null.',
    ...(context.explicitCategory
      ? [
          `A deterministic parser found the explicit category "${context.explicitCategory}" in the current customer message. Set intent.category to "${context.explicitCategory}" and do not ask the customer for their category.`,
        ]
      : []),
    'Example: "I need earrings under 300 dollars" means category earrings and maxPrice 300, so search instead of asking for the category.',
    'Descriptive words such as elegant, minimal, classic, modern, or glamorous belong in the intent.style array, even when required fields are missing.',
    'Set intent.statementLevel to subtle for understated, delicate, low-profile requests; balanced for noticeable but restrained requests; and statement for bold, glamorous, or eye-catching requests.',
    'Pearl measurements such as 8mm or 8–8.5mm belong in intent.pearlSize.',
    'Metal preferences such as 18k gold, white gold, or sterling silver belong in intent.metalPreference.',

    // Clarification policy
    'Before searching for candidate products, you must know the jewelry category. Budget is optional.',
    'If category is missing for a product discovery request, set status to needs_clarification, list category in missingFields, ask one concise question, and do not call any tool. This clarification rule does not apply when an exact, already-known product ID is available and the customer asks only for richer details about that product.',

    // Search orchestration
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

    // Search result interpretation
    'pearlSize and metalPreference are soft ranking preferences, not database filters. Use them only to rank returned products when the returned size_mm or material directly supports the preference.',
    'style, occasion, and statementLevel are captured shopping context but are not currently searchable product fields. Do not claim that search_products filtered by them, and do not invent a match that the returned product data does not support.',

    // Product detail lookup
    'If the customer refers to a specific product by name but no product ID is known, use search_products with productName to resolve that name to a real catalog product. Never ask the customer to provide an internal product ID.',
    'After resolving the named product from search_products, use its returned product ID for check_product_availability and get_product_details as needed.',
    'Do not list product ID in missingFields. Product IDs are internal identifiers and must be resolved by tools, not supplied by customers.',
    'Use get_product_details only for an already-known product ID when richer facts are needed, such as when the customer asks to learn more about a specific product, compares specific shortlisted products, or asks a question that search_products fields cannot answer.',
    'For a detail-only follow-up, you may call get_product_details without repeating search_products when the exact product ID is already available from the current run or conversation context.',
    'Do not call get_product_details for every recommendation by default. It is not a search tool, so never use it to discover candidates or pass an invented product ID.',
    'When richer facts are needed for multiple known products, call get_product_details separately for each product because the tool accepts exactly one product ID.',
    'If get_product_details returns product null, say that the published product details could not be found and do not invent them.',
    'Never infer purchasability from get_product_details. check_product_availability is the only source of current purchasability.',

    // Availability orchestration
    'For product discovery, recommendation, purchase, or current-availability-related requests, if search_products returns products, call check_product_availability exactly once with every returned product ID before making a recommendation or claiming purchasability.',
    'For detail-only questions about a specific resolved product, such as shape, luster, overtone, material, or description, you may call get_product_details without check_product_availability unless the response also discusses current purchasability.',
    'Never infer availability from product details. If you say that a product is currently available, preorder, or unavailable, that claim must come from check_product_availability in the current run.',
    'Do not recommend a product for purchase unless that exact product ID was checked by check_product_availability in the current run.',

    // Recommendation policy
    'Prioritize available products as the main recommendations and state that they are currently available.',
    'You may recommend preorder products, but you must clearly state that each one is a preorder and include its preorder note when provided.',
    'Normally exclude unavailable products. Mention one only when it is an exceptional match, clearly say it cannot currently be purchased, and prioritize purchasable alternatives.',

    'If at least one checked candidate is available or preorder, set status to recommendation and use an empty missingFields array.',
    'If all checked candidates are unavailable, set status to no_results and use an empty missingFields array.',

    'Recommend at most three checked products returned by search_products, including each exact title, price, URL, and accurate purchasability.',

    // Grounding and capability boundaries
    'Never invent products, prices, materials, availability, shipping promises, discounts, or policies.',
    'You cannot add items to a cart, take payment, place orders, reserve products, or directly inspect or mutate inventory. Use check_product_availability as the only source of purchasability.',
    'You may tell a customer that an available or preorder product can be added to the cart, but you cannot add it yourself.',

    // Final response
    'Return a warm, concise customer-facing answer in the message field.',
  ].join('\n'),
  tools: [searchProductsTool, checkProductAvailabilityTool, getProductDetailsTool],
  outputType: shoppingAgentResponseSchema,
})

async function extractShoppingIntent(message: string): Promise<ShoppingIntent> {
  const explicitCategory = detectExplicitCategory(message)
  const result = await run(shoppingIntentAgent, message, {
    context: { explicitCategory },
  })

  if (!result.finalOutput) {
    throw new Error('The intent extractor completed without a final response.')
  }

  return result.finalOutput
}

async function prepareShoppingTurn(
  message: string,
  currentContext: ShoppingContext
) {
  const incomingIntent = await extractShoppingIntent(message)
  const shoppingContext = mergeShoppingContext(currentContext, incomingIntent)
  const missingFields = getMissingFields(shoppingContext)

  return { incomingIntent, shoppingContext, missingFields }
}

export async function runShoppingAgent(
  message: string,
  currentContext: ShoppingContext = createEmptyShoppingContext()
) {
  const result = await runShoppingAgentWithDetails(message, currentContext)
  return result.output
}

export async function runShoppingAgentWithDetails(
  message: string,
  currentContext: ShoppingContext = createEmptyShoppingContext()
) {
  const hasProductReference = hasRecommendedProductReference(message)
  const resolvedProductReference = resolveRecommendedProductReference(
    message,
    currentContext.recommendedProducts
  )

  if (hasProductReference && !resolvedProductReference) {
    const recommendationCount = currentContext.recommendedProducts.length
    const countDescription =
      recommendationCount === 0
        ? 'I do not have a previous recommendation to reference.'
        : `I only recommended ${recommendationCount} product${recommendationCount === 1 ? '' : 's'}.`

    return {
      output: {
        status: 'needs_clarification' as const,
        missingFields: [],
        intent: currentContext,
        recommendedProducts: [],
        message: `${countDescription} Which product would you like to hear more about?`,
      },
      incomingIntent: null,
      shoppingContext: currentContext,
      toolCalls: [],
    }
  }

  const { incomingIntent, shoppingContext, missingFields } =
    await prepareShoppingTurn(message, currentContext)

  if (missingFields.length > 0 && !resolvedProductReference) {
    return {
      output: {
        status: 'needs_clarification' as const,
        missingFields,
        intent: shoppingContext,
        recommendedProducts: [],
        message: 'What type of jewelry are you looking for?',
      },
      incomingIntent,
      shoppingContext,
      toolCalls: [],
    }
  }

  const referenceToolPlan = resolvedProductReference
    ? planRecommendedProductReferenceTools(message)
    : null
  const agentForTurn = resolvedProductReference
    ? shoppingAgent.clone({
        tools: [
          ...(referenceToolPlan?.getDetails
            ? [createResolvedProductDetailsTool(resolvedProductReference)]
            : []),
          ...(referenceToolPlan?.checkAvailability
            ? [createResolvedProductAvailabilityTool(resolvedProductReference)]
            : []),
        ],
      })
    : shoppingAgent
  const result = await run(agentForTurn, message, {
    context: {
      explicitCategory: detectExplicitCategory(message),
      shoppingContext,
      resolvedProductReference,
      referenceToolPlan,
    },
  })
  const toolOutputs = result.newItems.filter(
    (item): item is RunToolCallOutputItem => item instanceof RunToolCallOutputItem
  )
  const toolCalls = result.newItems
    .filter((item): item is RunToolCallItem => item instanceof RunToolCallItem)
    .map((item) => {
      let argumentsValue: unknown = null
      const outputItem = toolOutputs.find(
        (candidate) => candidate.callId === item.callId
      )

      if (item.rawItem.type === 'function_call') {
        try {
          argumentsValue = JSON.parse(item.rawItem.arguments)
        } catch {
          argumentsValue = item.rawItem.arguments
        }
      }

      return {
        name: item.toolName || 'unknown',
        arguments: argumentsValue,
        result: outputItem?.output ?? null,
      }
    })

  const updatedShoppingContext =
    !resolvedProductReference &&
    result.finalOutput?.status === 'recommendation'
      ? replaceRecommendedProducts(
          shoppingContext,
          result.finalOutput.recommendedProducts
        )
      : shoppingContext

  return {
    output: result.finalOutput,
    incomingIntent,
    shoppingContext: updatedShoppingContext,
    toolCalls,
  }
}
