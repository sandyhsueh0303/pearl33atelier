import type { ShoppingIntent } from '../intent'
import {
  getMissingFields,
  mergeShoppingContext,
  type ShoppingContext,
} from '../shoppingContext'

type IntentExtractor = (message: string) => Promise<ShoppingIntent>

export async function prepareShoppingTurn(
  message: string,
  currentContext: ShoppingContext,
  extractIntent: IntentExtractor
) {
  const incomingIntent = await extractIntent(message)
  const shoppingContext = mergeShoppingContext(currentContext, incomingIntent)
  const missingFields = getMissingFields(shoppingContext)

  return { incomingIntent, shoppingContext, missingFields }
}