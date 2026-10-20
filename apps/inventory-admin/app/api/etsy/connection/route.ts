import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import {
  deleteEtsyConnection,
  getEtsyConnectionStatus,
} from '../etsyClient'

export async function GET() {
  const { user, errorResponse } = await requireAdmin()
  if (errorResponse || !user) return errorResponse

  try {
    return NextResponse.json(await getEtsyConnectionStatus(user.id))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read Etsy connection.' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest) {
  const { user, errorResponse } = await requireAdmin()
  if (errorResponse || !user) return errorResponse

  try {
    await deleteEtsyConnection(user.id)
    return NextResponse.json({ connected: false })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect Etsy.' },
      { status: 500 }
    )
  }
}
