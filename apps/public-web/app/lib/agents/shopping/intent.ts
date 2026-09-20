import { z } from 'zod'

export const shoppingCategorySchema = z.enum([
  'bracelets',
  'necklaces',
  'earrings',
  'rings',
  'pendants',
  'loose_pearls',
  'brooches',
])

export const shoppingIntentSchema = z.object({
  category: shoppingCategorySchema.nullable(),
  minPrice: z.number().nonnegative().nullable(),
  maxPrice: z.number().nonnegative().nullable(),
  occasion: z.string().trim().max(80).nullable(),
  style: z.array(z.string().trim().min(1).max(80)).max(8),
  statementLevel: z.enum(['subtle', 'balanced', 'statement']).nullable(),
  pearlPreference: z.string().trim().max(80).nullable(),
  pearlSize: z.string().trim().max(80).nullable(),
  metalPreference: z.string().trim().max(80).nullable(),
})

export type ShoppingIntent = z.infer<typeof shoppingIntentSchema>

export function isShoppingIntentReady(intent: ShoppingIntent) {
  return intent.category !== null
}
