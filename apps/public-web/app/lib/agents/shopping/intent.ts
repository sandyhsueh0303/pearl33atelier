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

export type ShoppingCategory = z.infer<typeof shoppingCategorySchema>

const EXPLICIT_CATEGORY_PATTERNS: readonly [ShoppingCategory, RegExp][] = [
  ['earrings', /\b(?:earrings?|studs?)\b/i],
  ['necklaces', /\bnecklaces?\b/i],
  ['bracelets', /\bbracelets?\b/i],
  ['rings', /\brings?\b/i],
  ['pendants', /\bpendants?\b/i],
  ['brooches', /\bbrooch(?:es)?\b/i],
  ['loose_pearls', /\bloose\s+pearls?\b/i],
]

export function detectExplicitCategory(message: string): ShoppingCategory | null {
  return (
    EXPLICIT_CATEGORY_PATTERNS.find(([, pattern]) => pattern.test(message))?.[0] ??
    null
  )
}

export const shoppingIntentSchema = z.object({
  category: shoppingCategorySchema
    .nullable()
    .describe(
      'Normalized jewelry category explicitly mentioned by the customer. Singular and plural forms refer to the same category.'
    ),
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
