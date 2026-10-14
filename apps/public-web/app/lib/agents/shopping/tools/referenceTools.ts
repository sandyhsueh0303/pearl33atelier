import { tool } from '@openai/agents'
import { z } from 'zod'
import type { RecommendedProduct } from '../shoppingContext'
import { checkProductAvailability } from '../services/checkProductAvailability'
import { checkProductAvailabilityOutputSchema } from '../schemas/checkProductAvailabilitySchema'
import { getProductDetails } from '../services/getProductDetails'
import { getProductDetailsOutputSchema } from '../schemas/getProductDetailsSchema'

export function createResolvedProductDetailsTool(product: RecommendedProduct) {
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

export function createResolvedProductAvailabilityTool(
  product: RecommendedProduct
) {
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