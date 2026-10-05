import { NextResponse } from 'next/server'
import { z } from 'zod'
import { runShoppingAgentWithDetails } from '../../lib/agents/shopping/agent'
import { ShoppingContextSchema } from '../../lib/agents/shopping/shoppingContext'

export const runtime = 'nodejs'

const requestSchema = z.object({
  message: z.string().trim().min(1).max(1_000),
  shoppingContext: ShoppingContextSchema.optional(),
})

function isTestUiEnabled() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.SHOPPING_AGENT_TEST_UI_ENABLED === 'true'
  )
}

export async function POST(request: Request) {
  if (!isTestUiEnabled()) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a message between 1 and 1,000 characters.' },
      { status: 400 }
    )
  }

  try {
    const result = await runShoppingAgentWithDetails(
      parsed.data.message,
      parsed.data.shoppingContext
    )

    if (!result.output) {
      throw new Error('The agent completed without a final response.')
    }

    return NextResponse.json({
      output: result.output,
      incomingIntent: result.incomingIntent,
      shoppingContext: result.shoppingContext,
      toolCalls: result.toolCalls,
    })
  } catch (error) {
    console.error('Shopping Agent test failed:', error)

    const detail = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Shopping Agent failed: ${detail}` },
      { status: 500 }
    )
  }
}
