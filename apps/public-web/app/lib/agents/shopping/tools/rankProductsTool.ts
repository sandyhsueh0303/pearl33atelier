import { tool } from '@openai/agents'
import { z } from 'zod'
import type { ShoppingAgentContext } from '../agentContext'
import { getProductDetails } from '../services/getProductDetails'
import {
  needsProductDetailsForSoftPreferences,
  rankProducts,
  rankedProductsOutputSchema,
} from '../rankProducts'

export const rankProductsTool = tool({
  name: 'rank_products',
  description:
    'Deterministically rank the current run’s purchasable search candidates using ShoppingContext soft preferences and grounded product evidence. Call only after search_products and check_product_availability.',
  parameters: z.object({}),
  outputSchema: rankedProductsOutputSchema,
  async execute(_input, runContext) {
    const context = runContext?.context as ShoppingAgentContext | undefined
    const searchResult = context?.rankingState.searchResult
    const availabilityResult = context?.rankingState.availabilityResult

    if (!context || !searchResult || !availabilityResult) {
      throw new Error(
        'rank_products requires search and availability results from the current run.'
      )
    }

    if (needsProductDetailsForSoftPreferences(context.shoppingContext)) {
      const purchasableProductIds = availabilityResult.products
        .filter((product) => product.purchasability !== 'unavailable')
        .map((product) => product.productId)

      for (const productId of purchasableProductIds) {
        if (context.rankingState.productDetails.has(productId)) continue

        const output = await getProductDetails({ productId })
        if (output.product) {
          context.rankingState.productDetails.set(productId, output.product)
        }
      }
    }

    const products = rankProducts({
      products: searchResult.products,
      shoppingContext: context.shoppingContext,
      availability: availabilityResult.products,
      productDetails: context.rankingState.productDetails,
    })
    context.rankingState.rankedProducts = products

    return { products }
  },
})