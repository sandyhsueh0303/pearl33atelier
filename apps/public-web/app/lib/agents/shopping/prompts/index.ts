import type { ShoppingAgentContext } from '../agentContext'
import { coreInstructions } from './core'
import { productDiscoveryInstructions } from './productDiscovery'
import { productReferenceInstructions } from './productReference'
import { recommendationInstructions } from './recommendation'

export function shoppingAgentInstructions(
  context: ShoppingAgentContext
): string {
  return [
    ...coreInstructions(context),
    ...productDiscoveryInstructions(context),
    ...productReferenceInstructions(context),
    ...recommendationInstructions,
  ].join('\n')
}