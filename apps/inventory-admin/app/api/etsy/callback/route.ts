import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/app/utils/adminAuth'
import {
  exchangeEtsyAuthorizationCode,
  saveEtsyConnection,
} from '../etsyClient'

const STATE_COOKIE = 'etsy_oauth_state'
const VERIFIER_COOKIE = 'etsy_oauth_verifier'

type JsonObject = Record<string, unknown>

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function positiveIntegerField(payload: JsonObject, field: string) {
  const value = payload[field]
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isSafeInteger(numericValue) && numericValue > 0 ? numericValue : null
}

async function fetchEtsyOAuthJson(input: {
  endpoint: string
  url: string
  apiKey: string
  accessToken: string
}) {
  const response = await fetch(input.url, {
    headers: {
      'x-api-key': input.apiKey,
      Authorization: `Bearer ${input.accessToken}`,
    },
    cache: 'no-store',
  })

  let payload: unknown = null
  let parsedJson = false
  try {
    payload = await response.json()
    parsedJson = true
  } catch {
    // The diagnostic below records only response metadata, never response bodies.
  }

  const jsonObject = isJsonObject(payload) ? payload : null
  console.info('Etsy OAuth API diagnostic:', {
    endpoint: input.endpoint,
    httpStatus: response.status,
    responseOk: response.ok,
    parsedJson,
    topLevelJsonKeys: jsonObject ? Object.keys(jsonObject).sort() : [],
    hasUserId: Boolean(jsonObject && positiveIntegerField(jsonObject, 'user_id')),
    hasShopId: Boolean(jsonObject && positiveIntegerField(jsonObject, 'shop_id')),
  })

  if (!response.ok) {
    throw new Error(`Etsy API request failed for ${input.endpoint} (${response.status}).`)
  }
  if (!jsonObject) {
    throw new Error(`Etsy API returned an invalid JSON object for ${input.endpoint}.`)
  }
  return jsonObject
}

function getPublicAppOrigin() {
  const redirectUri = process.env.ETSY_REDIRECT_URI
  if (!redirectUri) throw new Error('ETSY_REDIRECT_URI is not configured.')

  let url: URL
  try {
    url = new URL(redirectUri)
  } catch {
    throw new Error('ETSY_REDIRECT_URI must be a valid absolute URL.')
  }

  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
    throw new Error('ETSY_REDIRECT_URI must use a credential-free public HTTPS origin.')
  }
  return url.origin
}

function finish(status: string) {
  let appOrigin: string
  try {
    appOrigin = getPublicAppOrigin()
  } catch (error) {
    console.error('Etsy OAuth redirect configuration failed:', error)
    return NextResponse.json(
      { error: 'Etsy OAuth redirect configuration is invalid.' },
      { status: 500 }
    )
  }

  const url = new URL('/admin/products', appOrigin)
  url.searchParams.set('etsy', status)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAdmin()
  if (errorResponse || !user) return errorResponse

  const cookieStore = await cookies()
  const expectedState = cookieStore.get(STATE_COOKIE)?.value
  const codeVerifier = cookieStore.get(VERIFIER_COOKIE)?.value
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')
  cookieStore.delete(STATE_COOKIE)
  cookieStore.delete(VERIFIER_COOKIE)

  if (!expectedState || !codeVerifier || !state || state !== expectedState || !code) {
    return finish('failed')
  }

  const redirectUri = process.env.ETSY_REDIRECT_URI
  const apiKey = process.env.ETSY_API_KEYSTRING
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  const encryptionKey = process.env.ETSY_TOKEN_ENCRYPTION_KEY
  if (!redirectUri || !apiKey || !sharedSecret || !encryptionKey) {
    return finish('not-configured')
  }

  try {
    const token = await exchangeEtsyAuthorizationCode({
      code,
      codeVerifier,
      redirectUri,
    })
    const grantedScopes = (token.scope || '').split(' ').filter(Boolean)
    if (!grantedScopes.includes('listings_w') || !grantedScopes.includes('shops_r')) {
      return finish('missing-scope')
    }

    const requestApiKey = `${apiKey}:${sharedSecret}`
    const userPayload = await fetchEtsyOAuthJson({
      endpoint: 'GET /v3/application/users/me',
      url: 'https://openapi.etsy.com/v3/application/users/me',
      apiKey: requestApiKey,
      accessToken: token.access_token,
    })
    const userId = positiveIntegerField(userPayload, 'user_id')
    if (!userId) throw new Error('Etsy user lookup did not return a valid user ID.')

    const shop = await fetchEtsyOAuthJson({
      endpoint: 'GET /v3/application/users/{user_id}/shops',
      url: `https://openapi.etsy.com/v3/application/users/${userId}/shops`,
      apiKey: requestApiKey,
      accessToken: token.access_token,
    })
    const shopId = positiveIntegerField(shop, 'shop_id')
    if (!shopId || typeof shop.shop_name !== 'string' || !shop.shop_name) {
      throw new Error('No Etsy shop was returned for this account.')
    }

    await saveEtsyConnection({
      adminUserId: user.id,
      shopId,
      shopName: shop.shop_name,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      scopes: grantedScopes,
    })

    return finish('connected')
  } catch (error) {
    console.error('Etsy OAuth callback failed:', error)
    return finish('failed')
  }
}
