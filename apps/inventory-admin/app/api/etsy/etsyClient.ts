import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

type EtsyConnection = {
  admin_user_id: string
  shop_id: number
  shop_name: string
  access_token_ciphertext: string
  refresh_token_ciphertext: string
  token_expires_at: string
  granted_scopes: string[]
}

export type EtsyListingDraftRecord = {
  id: string
  admin_user_id: string
  product_id: string
  idempotency_key: string
  etsy_listing_id: number | null
  etsy_shop_id: number
  status: 'creating' | 'draft_created' | 'partial' | 'failed'
  image_order: string[]
  next_image_rank: number
  listing_payload: unknown
  last_error: string | null
}

type EtsyTokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  scope?: string
}

export class EtsyApiError extends Error {
  readonly status: number

  constructor(status: number, detail?: string) {
    const normalizedDetail = detail
      ?.replace(/[\u0000-\u001f\u007f]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300)
    super(
      normalizedDetail
        ? `Etsy API failed (${status}): ${normalizedDetail}`
        : `Etsy API failed (${status}).`
    )
    this.name = 'EtsyApiError'
    this.status = status
  }
}

function etsyErrorDetail(responseText: string) {
  try {
    const payload = JSON.parse(responseText) as Record<string, unknown>
    return typeof payload.error === 'string' ? payload.error : undefined
  } catch {
    return undefined
  }
}

function getEtsyApiKey() {
  const key = process.env.ETSY_API_KEYSTRING
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!key || !sharedSecret) throw new Error('Etsy API credentials are not configured.')
  return `${key}:${sharedSecret}`
}

function getEncryptionKey() {
  const value = process.env.ETSY_TOKEN_ENCRYPTION_KEY
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error('ETSY_TOKEN_ENCRYPTION_KEY must be a 32-byte hex value.')
  }
  return Buffer.from(value, 'hex')
}

function encrypt(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.')
}

function decrypt(value: string) {
  const [iv, authTag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64url'))
  if (!iv || !authTag || !encrypted) throw new Error('Stored Etsy token is malformed.')
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !serviceKey) throw new Error('Supabase service-role configuration is missing.')
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function requestToken(body: URLSearchParams): Promise<EtsyTokenResponse> {
  body.set('client_id', process.env.ETSY_API_KEYSTRING || '')
  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Etsy token request failed (${response.status}).`)
  }
  return response.json() as Promise<EtsyTokenResponse>
}

async function getConnection(adminUserId: string): Promise<EtsyConnection | null> {
  const supabase = getServiceClient()
  const { data, error } = await (supabase as any)
    .from('etsy_listing_connections')
    .select('*')
    .eq('admin_user_id', adminUserId)
    .maybeSingle()
  if (error) throw new Error(`Failed to load Etsy connection: ${error.message}`)
  return data as EtsyConnection | null
}

export async function saveEtsyConnection(input: {
  adminUserId: string
  shopId: number
  shopName: string
  accessToken: string
  refreshToken: string
  expiresIn: number
  scopes: string[]
}) {
  const supabase = getServiceClient()
  const { error } = await (supabase as any).from('etsy_listing_connections').upsert({
    admin_user_id: input.adminUserId,
    shop_id: input.shopId,
    shop_name: input.shopName,
    access_token_ciphertext: encrypt(input.accessToken),
    refresh_token_ciphertext: encrypt(input.refreshToken),
    token_expires_at: new Date(Date.now() + input.expiresIn * 1000).toISOString(),
    granted_scopes: input.scopes,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(`Failed to save Etsy connection: ${error.message}`)
}

export async function deleteEtsyConnection(adminUserId: string) {
  const supabase = getServiceClient()
  const { error } = await (supabase as any)
    .from('etsy_listing_connections')
    .delete()
    .eq('admin_user_id', adminUserId)
  if (error) throw new Error(`Failed to disconnect Etsy: ${error.message}`)
}

export async function getEtsyConnectionStatus(adminUserId: string) {
  const connection = await getConnection(adminUserId)
  if (!connection) return { connected: false as const }
  return {
    connected: true as const,
    shopId: connection.shop_id,
    shopName: connection.shop_name,
    scopes: connection.granted_scopes,
  }
}

export async function getEtsyConnection(adminUserId: string) {
  const connection = await getConnection(adminUserId)
  if (!connection) return null
  return {
    shopId: connection.shop_id,
    shopName: connection.shop_name,
    scopes: connection.granted_scopes,
  }
}

type EtsyListingDraftInput = {
  id: string
  adminUserId: string
  productId: string
  idempotencyKey: string
  shopId: number
  imageOrder: string[]
  listingPayload: unknown
}

export async function beginEtsyListingDraftWithClient(
  supabase: any,
  input: EtsyListingDraftInput
): Promise<{ record: EtsyListingDraftRecord; isNew: boolean }> {
  const { error } = await (supabase as any).from('etsy_listing_drafts').insert({
    id: input.id,
    admin_user_id: input.adminUserId,
    product_id: input.productId,
    idempotency_key: input.idempotencyKey,
    etsy_shop_id: input.shopId,
    image_order: input.imageOrder,
    listing_payload: input.listingPayload,
    status: 'creating',
  })

  if (!error) {
    return {
      record: {
        id: input.id,
        admin_user_id: input.adminUserId,
        product_id: input.productId,
        idempotency_key: input.idempotencyKey,
        etsy_listing_id: null,
        etsy_shop_id: input.shopId,
        status: 'creating',
        image_order: input.imageOrder,
        next_image_rank: 1,
        listing_payload: input.listingPayload,
        last_error: null,
      } as EtsyListingDraftRecord,
      isNew: true,
    }
  }

  if (error.code !== '23505') {
    throw new Error(`Failed to reserve Etsy Draft creation: ${error.message}`)
  }

  const { data, error: loadError } = await (supabase as any)
    .from('etsy_listing_drafts')
    .select('*')
    .eq('admin_user_id', input.adminUserId)
    .eq('product_id', input.productId)
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle()
  if (loadError || !data) throw new Error(`Failed to inspect Etsy Draft retry: ${loadError?.message || error.message}`)
  return { record: data as EtsyListingDraftRecord, isNew: false }
}

export async function beginEtsyListingDraft(input: EtsyListingDraftInput) {
  return beginEtsyListingDraftWithClient(getServiceClient(), input)
}

type EtsyListingDraftIdentity = {
  id: string
  adminUserId: string
  productId: string
  idempotencyKey: string
}

export async function claimFailedEtsyListingDraftWithClient(
  supabase: any,
  input: EtsyListingDraftIdentity & {
    imageOrder: string[]
    listingPayload: unknown
  }
): Promise<EtsyListingDraftRecord | null> {
  const { data, error } = await (supabase as any)
    .from('etsy_listing_drafts')
    .update({
      status: 'creating',
      image_order: input.imageOrder,
      listing_payload: input.listingPayload,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('admin_user_id', input.adminUserId)
    .eq('product_id', input.productId)
    .eq('idempotency_key', input.idempotencyKey)
    .eq('status', 'failed')
    .is('etsy_listing_id', null)
    .select('*')
    .maybeSingle()
  if (error) throw new Error(`Failed to claim Etsy Draft retry: ${error.message}`)
  return data as EtsyListingDraftRecord | null
}

export async function claimFailedEtsyListingDraft(
  input: EtsyListingDraftIdentity & {
    imageOrder: string[]
    listingPayload: unknown
  }
) {
  return claimFailedEtsyListingDraftWithClient(getServiceClient(), input)
}

export async function markCreatingEtsyListingDraftFailed(
  input: EtsyListingDraftIdentity & { lastError: string }
) {
  const supabase = getServiceClient()
  const { data, error } = await (supabase as any)
    .from('etsy_listing_drafts')
    .update({
      status: 'failed',
      last_error: input.lastError,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('admin_user_id', input.adminUserId)
    .eq('product_id', input.productId)
    .eq('idempotency_key', input.idempotencyKey)
    .eq('status', 'creating')
    .is('etsy_listing_id', null)
    .select('id')
    .maybeSingle()
  if (error) throw new Error(`Failed to record Etsy Draft rejection: ${error.message}`)
  return Boolean(data)
}

export async function markEtsyListingDraftPartial(
  input: EtsyListingDraftIdentity & { listingId: number; lastError: string }
) {
  const supabase = getServiceClient()
  const { data, error } = await (supabase as any)
    .from('etsy_listing_drafts')
    .update({
      etsy_listing_id: input.listingId,
      status: 'partial',
      last_error: input.lastError,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('admin_user_id', input.adminUserId)
    .eq('product_id', input.productId)
    .eq('idempotency_key', input.idempotencyKey)
    .in('status', ['creating', 'partial'])
    .select('id')
    .maybeSingle()
  if (error) throw new Error(`Failed to preserve partial Etsy Draft progress: ${error.message}`)
  return Boolean(data)
}

export async function getEtsyListingDraft(
  draftId: string,
  adminUserId: string,
  productId: string
): Promise<EtsyListingDraftRecord | null> {
  const supabase = getServiceClient()
  const { data, error } = await (supabase as any)
    .from('etsy_listing_drafts')
    .select('*')
    .eq('id', draftId)
    .eq('admin_user_id', adminUserId)
    .eq('product_id', productId)
    .maybeSingle()
  if (error) throw new Error(`Failed to restore Etsy Draft: ${error.message}`)
  return data as EtsyListingDraftRecord | null
}

export async function findEtsyListingDraftReservation(input: {
  adminUserId: string
  productId: string
  idempotencyKey: string
}): Promise<EtsyListingDraftRecord | null> {
  const supabase = getServiceClient()
  const { data, error } = await (supabase as any)
    .from('etsy_listing_drafts')
    .select('*')
    .eq('admin_user_id', input.adminUserId)
    .eq('product_id', input.productId)
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle()
  if (error) {
    throw new Error(`Failed to inspect Etsy Draft reservation: ${error.message}`)
  }
  return data as EtsyListingDraftRecord | null
}

export async function updateEtsyListingDraft(
  draftId: string,
  adminUserId: string,
  patch: Partial<Pick<EtsyListingDraftRecord, 'etsy_listing_id' | 'status' | 'next_image_rank' | 'last_error' | 'listing_payload'>>
) {
  const supabase = getServiceClient()
  const { error } = await (supabase as any)
    .from('etsy_listing_drafts')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', draftId)
    .eq('admin_user_id', adminUserId)
  if (error) throw new Error(`Failed to update Etsy Draft progress: ${error.message}`)
}

async function getAccessToken(adminUserId: string): Promise<{ token: string; shopId: number }> {
  const connection = await getConnection(adminUserId)
  if (!connection) throw new Error('Connect an Etsy shop before creating a Draft.')

  const tokenExpiresAt = new Date(connection.token_expires_at).getTime()
  if (tokenExpiresAt > Date.now() + 60_000) {
    return { token: decrypt(connection.access_token_ciphertext), shopId: connection.shop_id }
  }

  const refreshToken = decrypt(connection.refresh_token_ciphertext)
  const token = await requestToken(new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }))
  const supabase = getServiceClient()
  const { error } = await (supabase as any)
    .from('etsy_listing_connections')
    .update({
      access_token_ciphertext: encrypt(token.access_token),
      refresh_token_ciphertext: encrypt(token.refresh_token),
      token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      granted_scopes: (token.scope || connection.granted_scopes.join(' ')).split(' ').filter(Boolean),
      updated_at: new Date().toISOString(),
    })
    .eq('admin_user_id', adminUserId)
  if (error) throw new Error(`Failed to refresh Etsy credentials: ${error.message}`)

  return { token: token.access_token, shopId: connection.shop_id }
}

export async function etsyRequest(
  adminUserId: string,
  path: string,
  init: RequestInit = {}
) {
  const { token, shopId } = await getAccessToken(adminUserId)
  const response = await fetch(`https://openapi.etsy.com/v3/application${path}`, {
    ...init,
    headers: {
      'x-api-key': getEtsyApiKey(),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: 'no-store',
  })
  const responseText = await response.text()
  if (!response.ok) {
    throw new EtsyApiError(response.status, etsyErrorDetail(responseText))
  }
  return { data: responseText ? JSON.parse(responseText) : null, shopId }
}

export async function exchangeEtsyAuthorizationCode(input: {
  code: string
  codeVerifier: string
  redirectUri: string
}) {
  return requestToken(new URLSearchParams({
    grant_type: 'authorization_code',
    code: input.code,
    code_verifier: input.codeVerifier,
    redirect_uri: input.redirectUri,
  }))
}
