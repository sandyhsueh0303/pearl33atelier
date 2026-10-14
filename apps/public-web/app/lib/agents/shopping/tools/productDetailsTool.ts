import { tool } from '@openai/agents'
import type { ShoppingAgentContext } from '../agentContext'
import { getProductDetails } from '../services/getProductDetails'
import {
  getProductDetailsInputSchema,
  getProductDetailsOutputSchema,
} from '../schemas/getProductDetailsSchema'

export const getProductDetailsTool = tool({
  name: 'get_product_details',
  description:
    'Return richer customer-facing facts for one already-known published product. This tool does not search for products or determine availability.',
  parameters: getProductDetailsInputSchema,
  outputSchema: getProductDetailsOutputSchema,
  async execute(input, runContext) {
    const output = await getProductDetails(input)
    const context = runContext?.context as ShoppingAgentContext | undefined
    if (context && output.product) {
      context.rankingState.productDetails.set(output.product.id, output.product)
    }
    return output
  },
})