import { Agent } from '@openai/agents'
import { z } from 'zod'
import { shoppingIntentSchema } from './intent'
import { recommendedProductSchema } from './shoppingContext'
import type {
  ShoppingAgentContext,
  ShoppingIntentAgentContext,
} from './agentContext'
import { intentExtractionInstructions } from './prompts/intentExtraction'
import { shoppingAgentInstructions } from './prompts'
import {
  checkProductAvailabilityTool,
  getProductDetailsTool,
  rankProductsTool,
  searchProductsTool,
} from './tools'

const shoppingAgentResponseSchema = z.object({
  status: z.enum(['needs_clarification', 'recommendation', 'no_results']),
  missingFields: z.array(z.string()),
  intent: shoppingIntentSchema,
  recommendedProducts: z.array(recommendedProductSchema).max(3),
  message: z.string().min(1).max(1_200),
})

export const shoppingIntentAgent = new Agent<
  ShoppingIntentAgentContext,
  typeof shoppingIntentSchema
>({
  name: '33 Pearl Atelier Shopping Intent Extractor',
  instructions: ({ context }) => intentExtractionInstructions(context),
  outputType: shoppingIntentSchema,
})

export const shoppingAgent = new Agent<
  ShoppingAgentContext,
  typeof shoppingAgentResponseSchema
>({
  name: '33 Pearl Atelier Shopping Agent',
  instructions: ({ context }) => shoppingAgentInstructions(context),
  tools: [
    searchProductsTool,
    checkProductAvailabilityTool,
    getProductDetailsTool,
    rankProductsTool,
  ],
  outputType: shoppingAgentResponseSchema,
})
