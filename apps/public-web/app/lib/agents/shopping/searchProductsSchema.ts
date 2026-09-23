import { z } from 'zod'
import { shoppingCategorySchema, shoppingIntentSchema } from './intent'

export const searchSortSchema = z.enum(['price_asc', 'price_desc'])

export const searchProductsInputSchema = shoppingIntentSchema
  .pick({
    minPrice: true,
    maxPrice: true,
    pearlPreference: true,
  })
  .extend({
    category: shoppingCategorySchema,
    sortBy: searchSortSchema.nullable(),
    productName: z.string().trim().min(1).max(200).nullable(),
  })

export const searchProductResultSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  pearl_type: z.string().min(1),
  size_mm: z.string().nullable(),
  material: z.string().nullable(),
  category: z
    .enum([
      'BRACELETS',
      'NECKLACES',
      'EARRINGS',
      'STUDS',
      'RINGS',
      'PENDANTS',
      'LOOSE_PEARLS',
      'BROOCHES',
    ])
    .nullable(),
  sell_price: z.number().nonnegative().nullable(),
  url: z.string().url(),
})

export const searchProductsOutputSchema = z.object({
  products: z.array(searchProductResultSchema).max(3),
})

export type SearchProductsInput = z.infer<typeof searchProductsInputSchema>
export type SearchProductsOutput = z.infer<typeof searchProductsOutputSchema>
