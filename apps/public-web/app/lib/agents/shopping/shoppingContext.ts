import {
  shoppingIntentSchema,
  type ShoppingIntent,
} from './intent'

export const ShoppingContextSchema = shoppingIntentSchema

export type ShoppingContext = ShoppingIntent

export type ShoppingSession = {
  context: ShoppingContext
}

export function createEmptyShoppingContext(): ShoppingContext {
  return {
    category: null,
    minPrice: null,
    maxPrice: null,
    occasion: null,
    style: [],
    statementLevel: null,
    pearlPreference: null,
    pearlSize: null,
    metalPreference: null,
  }
}

export function createShoppingSession(): ShoppingSession {
  return {
    context: createEmptyShoppingContext(),
  }
}

export function getMissingFields(context: ShoppingContext): string[] {
  const missing: string[] = []

  if (!context.category) {
    missing.push('category')
  }

  return missing
}

export function mergeShoppingContext(
  current: ShoppingContext,
  incoming: ShoppingIntent
): ShoppingContext {
  return {
    // Scalar preferences use latest-explicit-value-wins semantics.
    category: incoming.category ?? current.category,
    minPrice: incoming.minPrice ?? current.minPrice,
    maxPrice: incoming.maxPrice ?? current.maxPrice,
    occasion: incoming.occasion ?? current.occasion,
    style:
      incoming.style.length > 0
        ? [...new Set([...current.style, ...incoming.style])]
        : [...current.style],
    statementLevel: incoming.statementLevel ?? current.statementLevel,
    pearlPreference: incoming.pearlPreference ?? current.pearlPreference,
    pearlSize: incoming.pearlSize ?? current.pearlSize,
    metalPreference: incoming.metalPreference ?? current.metalPreference,
  }
}
