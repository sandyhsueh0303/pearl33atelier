import { z } from 'zod'

export const checkProductAvailabilityInputSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(3),
})

export const productPurchasabilitySchema = z.enum([
  'available',
  'preorder',
  'unavailable',
])

export const productAvailabilityResultSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().nullable(),
  purchasability: productPurchasabilitySchema,
  preorderNote: z.string().nullable(),
})

export const checkProductAvailabilityOutputSchema = z.object({
  products: z.array(productAvailabilityResultSchema).min(1).max(3),
})

export type CheckProductAvailabilityInput = z.infer<
  typeof checkProductAvailabilityInputSchema
>
export type ProductPurchasability = z.infer<typeof productPurchasabilitySchema>
export type CheckProductAvailabilityOutput = z.infer<
  typeof checkProductAvailabilityOutputSchema
>
