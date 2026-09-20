import { Agent, RunToolCallItem, run, tool } from '@openai/agents'
import { z } from 'zod'
import { shoppingIntentSchema } from './intent'
import { searchProducts } from './searchProducts'
import { searchProductsInputSchema } from './searchProductsSchema'

const shoppingAgentResponseSchema = z.object({
  status: z.enum(['needs_clarification', 'recommendation', 'no_results']),
  missingFields: z.array(z.string()),
  intent: shoppingIntentSchema,
  message: z.string().min(1).max(1_200),
})

const searchProductsTool = tool({
  name: 'search_products',
  description:
    'Search the published 33 Pearl Atelier collection by category and optional budget and preferences.',
  parameters: searchProductsInputSchema,
  async execute(input) {
    return searchProducts(input)
  },
})

export const shoppingAgent = new Agent({
  name: '33 Pearl Atelier Shopping Agent',
  instructions: [
    'You help customers discover published pearl jewelry from 33 Pearl Atelier.',
    'Always extract every preference stated by the customer into intent. Use null for nullable fields they did not provide and an empty array when no style was provided.',
    'Descriptive words such as elegant, minimal, classic, modern, or glamorous belong in the intent.style array, even when required fields are missing.',
    'Set intent.statementLevel to subtle for understated, delicate, low-profile requests; balanced for noticeable but restrained requests; and statement for bold, glamorous, or eye-catching requests.',
    'Pearl measurements such as 8mm or 8–8.5mm belong in intent.pearlSize.',
    'Metal preferences such as 14k gold, white gold, or sterling silver belong in intent.metalPreference.',
    'Before searching, you must know the jewelry category. Budget is optional.',
    'If category is missing, set status to needs_clarification, list category in missingFields, ask one concise question, and do not call a tool.',
    'When category is known, call search_products exactly once using the customer\'s stated preferences. Pass null for a budget the customer did not provide.',
    'If the tool returns products, set status to recommendation and use an empty missingFields array.',
    'If the tool returns no products, set status to no_results and use an empty missingFields array.',
    'Recommend at most three products returned by the tool, including each exact title, price, and URL.',
    'Never invent products, prices, materials, availability, shipping promises, discounts, or policies.',
    'You cannot add items to a cart, take payment, place orders, reserve products, or check inventory.',
    'Return a warm, concise customer-facing answer in the message field.',
  ].join('\n'),
  tools: [searchProductsTool],
  outputType: shoppingAgentResponseSchema,
})

export async function runShoppingAgent(message: string) {
  const result = await run(shoppingAgent, message)
  return result.finalOutput
}

export async function runShoppingAgentWithDetails(message: string) {
  const result = await run(shoppingAgent, message)
  const toolCalls = result.newItems
    .filter((item): item is RunToolCallItem => item instanceof RunToolCallItem)
    .map((item) => {
      let argumentsValue: unknown = null

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
      }
    })

  return {
    output: result.finalOutput,
    toolCalls,
  }
}
