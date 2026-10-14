import { tool } from '@openai/agents'
import type { ShoppingAgentContext } from '../agentContext'
import { checkProductAvailability } from '../services/checkProductAvailability'
import {
  checkProductAvailabilityInputSchema,
  checkProductAvailabilityOutputSchema,
} from '../schemas/checkProductAvailabilitySchema'

export const checkProductAvailabilityTool = tool({
  name: 'check_product_availability',
  description:
    'Return the current purchasability of one to three published products in one batch using the existing inventory and BOM domain logic. Pass every product returned by search_products in one call.',
  parameters: checkProductAvailabilityInputSchema,
  outputSchema: checkProductAvailabilityOutputSchema,
  async execute(input, runContext) {
    const output = await checkProductAvailability(input)
    const context = runContext?.context as ShoppingAgentContext | undefined
    if (context) context.rankingState.availabilityResult = output
    return output
  },
})