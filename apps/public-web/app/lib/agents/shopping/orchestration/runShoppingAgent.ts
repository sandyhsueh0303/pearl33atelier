import {
  RunToolCallItem,
  RunToolCallOutputItem,
  run,
} from '@openai/agents'
import {
  detectExplicitCategory,
  type ShoppingIntent,
} from '../intent'
import {
  createEmptyShoppingContext,
  replaceRecommendedProducts,
  type ShoppingContext,
} from '../shoppingContext'
import type { ShoppingAgentContext } from '../agentContext'
import {
  hasRecommendedProductReference,
  planRecommendedProductReferenceTools,
  resolveRecommendedProductReference,
} from '../referenceResolution'
import {
  createResolvedProductAvailabilityTool,
  createResolvedProductDetailsTool,
} from '../tools'
import { prepareShoppingTurn } from './prepareShoppingTurn'
import { shoppingAgent, shoppingIntentAgent } from '../shoppingAgent'

async function extractShoppingIntent(message: string): Promise<ShoppingIntent> {
  const explicitCategory = detectExplicitCategory(message)
  const result = await run(shoppingIntentAgent, message, {
    context: { explicitCategory },
  })

  if (!result.finalOutput) {
    throw new Error('The intent extractor completed without a final response.')
  }

  return result.finalOutput
}

export async function runShoppingAgent(
  message: string,
  currentContext: ShoppingContext = createEmptyShoppingContext()
) {
  const result = await runShoppingAgentWithDetails(message, currentContext)
  return result.output
}

export async function runShoppingAgentWithDetails(
  message: string,
  currentContext: ShoppingContext = createEmptyShoppingContext()
) {
  const hasProductReference = hasRecommendedProductReference(message)
  const resolvedProductReference = resolveRecommendedProductReference(
    message,
    currentContext.recommendedProducts
  )

  if (hasProductReference && !resolvedProductReference) {
    const recommendationCount = currentContext.recommendedProducts.length
    const countDescription =
      recommendationCount === 0
        ? 'I do not have a previous recommendation to reference.'
        : `I only recommended ${recommendationCount} product${recommendationCount === 1 ? '' : 's'}.`

    return {
      output: {
        status: 'needs_clarification' as const,
        missingFields: [],
        intent: currentContext,
        recommendedProducts: [],
        message: `${countDescription} Which product would you like to hear more about?`,
      },
      incomingIntent: null,
      shoppingContext: currentContext,
      toolCalls: [],
    }
  }

  const { incomingIntent, shoppingContext, missingFields } =
    await prepareShoppingTurn(message, currentContext, extractShoppingIntent)

  if (missingFields.length > 0 && !resolvedProductReference) {
    return {
      output: {
        status: 'needs_clarification' as const,
        missingFields,
        intent: shoppingContext,
        recommendedProducts: [],
        message: 'What type of jewelry are you looking for?',
      },
      incomingIntent,
      shoppingContext,
      toolCalls: [],
    }
  }

  const referenceToolPlan = resolvedProductReference
    ? planRecommendedProductReferenceTools(message)
    : null
  const agentForTurn = resolvedProductReference
    ? shoppingAgent.clone({
        tools: [
          ...(referenceToolPlan?.getDetails
            ? [createResolvedProductDetailsTool(resolvedProductReference)]
            : []),
          ...(referenceToolPlan?.checkAvailability
            ? [createResolvedProductAvailabilityTool(resolvedProductReference)]
            : []),
        ],
      })
    : shoppingAgent
  const agentContext: ShoppingAgentContext = {
    explicitCategory: detectExplicitCategory(message),
    shoppingContext,
    resolvedProductReference,
    referenceToolPlan,
    rankingState: {
      searchResult: null,
      availabilityResult: null,
      productDetails: new Map(),
      rankedProducts: null,
    },
  }
  const result = await run(agentForTurn, message, {
    context: agentContext,
  })
  const toolOutputs = result.newItems.filter(
    (item): item is RunToolCallOutputItem => item instanceof RunToolCallOutputItem
  )
  const toolCalls = result.newItems
    .filter((item): item is RunToolCallItem => item instanceof RunToolCallItem)
    .map((item) => {
      let argumentsValue: unknown = null
      const outputItem = toolOutputs.find(
        (candidate) => candidate.callId === item.callId
      )

      if (item.rawItem.type === 'function_call') {
        try {
          argumentsValue = JSON.parse(item.rawItem.arguments)
        } catch {
          argumentsValue = item.rawItem.arguments
        }
      }

      return {
        name: item.toolName || 'unknown',
        arguments: argumentsValue,
        result: outputItem?.output ?? null,
      }
    })

  if (
    !resolvedProductReference &&
    agentContext.rankingState.availabilityResult &&
    !agentContext.rankingState.rankedProducts
  ) {
    throw new Error('The agent recommended products without ranking them.')
  }

  const rankedRecommendations =
    agentContext.rankingState.rankedProducts?.map((product) => ({
      id: product.productId,
      title: product.title,
    })) ?? []
  const finalOutput =
    !resolvedProductReference && result.finalOutput
      ? {
          ...result.finalOutput,
          recommendedProducts:
            result.finalOutput.status === 'recommendation'
              ? rankedRecommendations
              : [],
        }
      : result.finalOutput
  const updatedShoppingContext =
    !resolvedProductReference &&
    finalOutput?.status === 'recommendation'
      ? replaceRecommendedProducts(shoppingContext, rankedRecommendations)
      : shoppingContext

  return {
    output: finalOutput,
    incomingIntent,
    shoppingContext: updatedShoppingContext,
    toolCalls,
  }
}
