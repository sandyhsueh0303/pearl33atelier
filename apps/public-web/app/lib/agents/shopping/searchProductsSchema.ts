import { z } from 'zod'
import { shoppingCategorySchema, shoppingIntentSchema } from './intent'

export const searchProductsInputSchema = shoppingIntentSchema
  .pick({
    minPrice: true,
    maxPrice: true,
    pearlPreference: true,
    pearlSize: true,
    metalPreference: true,
    occasion: true,
    style: true,
    statementLevel: true,
  })
  .extend({
    category: shoppingCategorySchema,
  })

export type SearchProductsInput = z.infer<typeof searchProductsInputSchema>
