import { randomBytes, createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/app/utils/adminAuth'

const STATE_COOKIE = 'etsy_oauth_state'
const VERIFIER_COOKIE = 'etsy_oauth_verifier'

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const clientId = process.env.ETSY_API_KEYSTRING
  const redirectUri = process.env.ETSY_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Configure ETSY_API_KEYSTRING and ETSY_REDIRECT_URI on the server first.' },
      { status: 503 }
    )
  }

  const state = randomBytes(32).toString('base64url')
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const cookieStore = await cookies()
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/etsy',
    maxAge: 600,
  }
  cookieStore.set(STATE_COOKIE, state, cookieOptions)
  cookieStore.set(VERIFIER_COOKIE, verifier, cookieOptions)

  const authorizationUrl = new URL('https://www.etsy.com/oauth/connect')
  authorizationUrl.searchParams.set('response_type', 'code')
  authorizationUrl.searchParams.set('client_id', clientId)
  authorizationUrl.searchParams.set('redirect_uri', redirectUri)
  authorizationUrl.searchParams.set('scope', 'listings_w shops_r')
  authorizationUrl.searchParams.set('state', state)
  authorizationUrl.searchParams.set('code_challenge', challenge)
  authorizationUrl.searchParams.set('code_challenge_method', 'S256')

  return NextResponse.redirect(authorizationUrl)
}
