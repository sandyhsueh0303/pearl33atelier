import { z } from 'zod'
import { searchProductResultSchema } from './searchProductsSchema'

export const getProductDetailsInputSchema = z.object({
  productId: z.string().uuid(),
})

export const productDetailsResultSchema = searchProductResultSchema.extend({
  description: z.string().nullable(),
  shape: z.string().nullable(),
  luster: z.string().nullable(),
  overtone: z.string().nullable(),
  original_price: z.number().nonnegative().nullable(),
  editors_pick: z.boolean(),
})

export const getProductDetailsOutputSchema = z.object({
  product: productDetailsResultSchema.nullable(),
})

export type GetProductDetailsInput = z.infer<typeof getProductDetailsInputSchema>
export type ProductDetailsResult = z.infer<typeof productDetailsResultSchema>
export type GetProductDetailsOutput = z.infer<typeof getProductDetailsOutputSchema>
