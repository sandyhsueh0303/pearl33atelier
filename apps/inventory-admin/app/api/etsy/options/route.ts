import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { etsyRequest, getEtsyConnection } from '../etsyClient'
import { parseEtsyReadinessProfiles } from '../../products/etsy-listing/readinessProfiles'

type TaxonomyNode = {
  id: number
  name: string
  level: number
  children?: TaxonomyNode[]
}

function flattenNodes(nodes: TaxonomyNode[], parent = ''): Array<{ id: number; name: string; label: string }> {
  return nodes.flatMap((node) => {
    const label = parent ? `${parent} / ${node.name}` : node.name
    return [
      { id: node.id, name: node.name, label },
      ...flattenNodes(node.children || [], label),
    ]
  })
}

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAdmin()
  if (errorResponse || !user) return errorResponse

  const apiKey = process.env.ETSY_API_KEYSTRING
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !sharedSecret) {
    return NextResponse.json({ error: 'Etsy API credentials are not configured.' }, { status: 503 })
  }

  try {
    const connection = await getEtsyConnection(user.id)
    if (!connection) {
      return NextResponse.json({
        connected: false,
        taxonomy: [],
        shippingProfiles: [],
        readinessProfiles: [],
      })
    }
    if (!connection.scopes.includes('shops_r')) {
      return NextResponse.json(
        { error: 'Reconnect Etsy and grant the shops_r permission to load processing profiles.' },
        { status: 409 }
      )
    }

    const taxonomyId = Number(request.nextUrl.searchParams.get('taxonomyId'))
    const readinessResponse = await etsyRequest(
      user.id,
      `/shops/${connection.shopId}/readiness-state-definitions?limit=100`
    )
    const [taxonomyResponse, shippingResponse] = await Promise.all([
      fetch('https://openapi.etsy.com/v3/application/seller-taxonomy/nodes', {
        headers: { 'x-api-key': `${apiKey}:${sharedSecret}` },
        cache: 'no-store',
      }),
      etsyRequest(user.id, `/shops/${connection.shopId}/shipping-profiles?limit=100`),
    ])
    if (!taxonomyResponse.ok) throw new Error(`Etsy taxonomy lookup failed (${taxonomyResponse.status}).`)
    const taxonomyPayload = await taxonomyResponse.json()
    const taxonomy = flattenNodes(taxonomyPayload.results || []).filter((node) =>
      /jewel|necklace|earring|bracelet|ring|pendant|brooch|pearl/i.test(node.label)
    )

    let properties: unknown[] = []
    if (Number.isInteger(taxonomyId) && taxonomyId > 0) {
      const propertyResponse = await fetch(
        `https://openapi.etsy.com/v3/application/seller-taxonomy/nodes/${taxonomyId}/properties`,
        { headers: { 'x-api-key': `${apiKey}:${sharedSecret}` }, cache: 'no-store' }
      )
      if (!propertyResponse.ok) throw new Error(`Etsy attribute lookup failed (${propertyResponse.status}).`)
      const propertyPayload = await propertyResponse.json()
      properties = propertyPayload.results || []
    }

    return NextResponse.json({
      connected: true,
      shop: { shopId: connection.shopId, shopName: connection.shopName },
      taxonomy,
      properties,
      shippingProfiles: shippingResponse.data?.results || [],
      readinessProfiles: parseEtsyReadinessProfiles(readinessResponse.data),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load Etsy listing options.' },
      { status: 502 }
    )
  }
}
