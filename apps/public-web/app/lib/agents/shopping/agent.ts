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
} from './intent'
import { checkProductAvailability } from './checkProductAvailability'
import {
  checkProductAvailabilityInputSchema,
  checkProductAvailabilityOutputSchema,
} from './checkProductAvailabilitySchema'
import { searchProducts } from './searchProducts'
import {
  searchProductsInputSchema,
  searchProductsOutputSchema,
} from './searchProductsSchema'

const shoppingAgentResponseSchema = z.object({
  status: z.enum(['needs_clarification', 'recommendation', 'no_results']),
  missingFields: z.array(z.string()),
  intent: shoppingIntentSchema,
  message: z.string().min(1).max(1_200),
})

type ShoppingAgentContext = {
  explicitCategory: ShoppingCategory | null
}

const searchProductsTool = tool({
  name: 'search_products',
  description:
    'Search published 33 Pearl Atelier products using the supported database filters: category, minimum price, maximum price, and pearl preference.',
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

export const shoppingAgent = new Agent<
  ShoppingAgentContext,
  typeof shoppingAgentResponseSchema
>({
  name: '33 Pearl Atelier Shopping Agent',
  instructions: ({ context }) => [
    // Role
    'You help customers discover published pearl jewelry from 33 Pearl Atelier.',

    // Intent extraction
    'Always extract every preference stated by the customer into intent. Use null for nullable fields they did not provide and an empty array when no style was provided.',
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
    'Before searching, you must know the jewelry category. Budget is optional.',
    'If category is missing, set status to needs_clarification, list category in missingFields, ask one concise question, and do not call any tool.',

    // Search orchestration
    'If intent.category is not null, you must call search_products before producing any final response.',
    'Do not return status recommendation or no_results unless search_products has been called in the current run.',
    'Never say you will search, look for, or check products without actually calling search_products.',

    'For the initial recommendation attempt, call search_products exactly once using its supported parameters: category, minPrice, maxPrice, pearlPreference, and sortBy. Pass null for supported parameters the customer did not provide.',

    'If the customer asks for the cheapest, lowest-priced, or most affordable products, call search_products with sortBy = price_asc.',
    'If the customer asks for the most expensive or highest-priced products, call search_products with sortBy = price_desc.',
    'Otherwise pass null for sortBy.',
    'Never claim that a product is the cheapest, lowest-priced, most expensive, or highest-priced unless search_products was called with the corresponding sortBy value.',

    'Call search_products at most once in a run unless the customer has changed or explicitly relaxed a constraint.',
    'If search_products has already been called in the current run, do not call it again with identical arguments. Reuse the previous search result.',
    'After search_products returns one or more products, proceed directly to check_product_availability. Do not call search_products again before the availability check.',
    'If search_products returns no products, set status to no_results, use an empty missingFields array, and do not call check_product_availability.',

    // Search result interpretation
    'pearlSize and metalPreference are soft ranking preferences, not database filters. Use them only to rank returned products when the returned size_mm or material directly supports the preference.',
    'style, occasion, and statementLevel are captured shopping context but are not currently searchable product fields. Do not claim that search_products filtered by them, and do not invent a match that the returned product data does not support.',

    // Availability orchestration
    'If search_products returns products, call check_product_availability exactly once with every returned product ID.',
    'Never infer availability from product details or omit the availability check for a recommendation.',
    'Do not recommend any product unless that exact product ID was checked by check_product_availability in the current run.',

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
  tools: [searchProductsTool, checkProductAvailabilityTool],
  outputType: shoppingAgentResponseSchema,
})

export async function runShoppingAgent(message: string) {
  const result = await run(shoppingAgent, message, {
    context: { explicitCategory: detectExplicitCategory(message) },
  })
  return result.finalOutput
}

export async function runShoppingAgentWithDetails(message: string) {
  const result = await run(shoppingAgent, message, {
    context: { explicitCategory: detectExplicitCategory(message) },
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

  return {
    output: result.finalOutput,
    toolCalls,
  }
}
