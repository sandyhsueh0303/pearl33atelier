import { tool } from '@openai/agents'
import type { ShoppingAgentContext } from '../agentContext'
import { searchProducts } from '../services/searchProducts'
import {
  searchProductsInputSchema,
  searchProductsOutputSchema,
} from '../schemas/searchProductsSchema'

export const searchProductsTool = tool({
  name: 'search_products',
  description:
    'Search published 33 Pearl Atelier products using category and optional product name, minimum price, maximum price, pearl preference, and price ordering.',
  parameters: searchProductsInputSchema,
  outputSchema: searchProductsOutputSchema,
  async execute(input, runContext) {
    const output = await searchProducts(input)
    const context = runContext?.context as ShoppingAgentContext | undefined
    if (context) context.rankingState.searchResult = output
    return output
  },
})