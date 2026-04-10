import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import {
  pearlTypeValueToSlugPart,
  slugify,
  syncProductAvailabilitySnapshots,
} from '@pearl33atelier/shared'
import type { Database } from '@pearl33atelier/shared/types'
import { validateAiDraft, type AiDraft } from '../validation'

type ProductInsert = Database['public']['Tables']['catalog_products']['Insert']

const VALID_PEARL_TYPES = [
  'WhiteAkoya',
  'GreyAkoya',
  'WhiteSouthSea',
  'GoldenSouthSea',
  'Tahitian',
] as const

const CATEGORY_MAP: Record<string, Database['public']['Enums']['product_category']> = {
  bracelets: 'BRACELETS',
  bracelet: 'BRACELETS',
  necklaces: 'NECKLACES',
  necklace: 'NECKLACES',
  earrings: 'EARRINGS',
  earring: 'EARRINGS',
  studs: 'STUDS',
  stud: 'STUDS',
  rings: 'RINGS',
  ring: 'RINGS',
  pendants: 'PENDANTS',
  pendant: 'PENDANTS',
  'loose pearls': 'LOOSE_PEARLS',
  'loose pearl': 'LOOSE_PEARLS',
  brooches: 'BROOCHES',
  brooch: 'BROOCHES',
}

const SHAPE_MAP = {
  round: 'round',
  'near round': 'near-round',
  'near-round': 'near-round',
  drop: 'drop',
  button: 'button',
  oval: 'oval',
  baroque: 'baroque',
} as const

const LUSTER_MAP = {
  high: 'high',
  soft: 'soft',
} as const

function parseSkuNumber(sku: string): number | null {
  const match = /^PA(\d{4})$/.exec(sku)
  if (!match) return null
  return Number(match[1])
}

function formatSku(value: number): string {
  return `PA${String(value).padStart(4, '0')}`
}

async function getNextProductSku(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from('catalog_products')
    .select('sku')
    .not('sku', 'is', null)
    .ilike('sku', 'PA%')
    .order('sku', { ascending: false })
    .limit(100)

  if (error) throw error

  let max = 0
  for (const row of data || []) {
    const n = parseSkuNumber(String(row.sku || ''))
    if (n && n > max) max = n
  }

  return formatSku(max + 1)
}

function resolvePearlType(value: string, context: string): string | null {
  const raw = value.trim()
  if (VALID_PEARL_TYPES.includes(raw as (typeof VALID_PEARL_TYPES)[number])) {
    return raw
  }

  const normalized = `${raw} ${context}`.toLowerCase()
  if (normalized.includes('grey akoya') || normalized.includes('gray akoya')) return 'GreyAkoya'
  if (normalized.includes('white akoya') || normalized.includes('akoya')) return 'WhiteAkoya'
  if (normalized.includes('golden south sea') || normalized.includes('gold south sea')) {
    return 'GoldenSouthSea'
  }
  if (normalized.includes('white south sea') || normalized.includes('south sea')) {
    return 'WhiteSouthSea'
  }
  if (normalized.includes('tahitian')) return 'Tahitian'
  return null
}

function normalizeCategory(value: string | null | undefined) {
  if (!value) return null
  return CATEGORY_MAP[value.trim().toLowerCase()] || null
}

function normalizeShape(value: string | null | undefined) {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return SHAPE_MAP[normalized as keyof typeof SHAPE_MAP] || null
}

function normalizeLuster(value: string | null | undefined) {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return LUSTER_MAP[normalized as keyof typeof LUSTER_MAP] || null
}

function normalizeOvertone(value: string | null | undefined) {
  if (!value) return null
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function extractSizeMm(subtitle: string | null | undefined, description: string | null | undefined) {
  const source = `${subtitle || ''} ${description || ''}`
  const match = source.match(/(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*mm\b/i)
  if (!match) return null
  return match[1].replace(/\s+/g, '')
}

function buildSlug(title: string, pearlType: string, category: string | null) {
  const categoryPart = category ? category.toLowerCase() : 'product'
  return slugify(`${pearlTypeValueToSlugPart(pearlType)}-${categoryPart}-${title}`)
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const body = await request.json()
    const draft = body?.draft as AiDraft | undefined

    if (!draft?.title || !String(draft.title).trim()) {
      return NextResponse.json({ error: 'Draft title is required' }, { status: 400 })
    }

    const validation = validateAiDraft(draft)
    if (!validation.canCreateDraft) {
      return NextResponse.json(
        {
          error: 'Draft has validation errors and is not ready to create.',
          validation,
        },
        { status: 400 }
      )
    }

    const context = [
      String(draft.title || ''),
      String(draft.subtitle || ''),
      String(draft.description || ''),
      String(body?.notes || ''),
    ].join(' ')
    const pearlType = resolvePearlType(String(draft.pearlType || '').trim(), context)
    if (!pearlType) {
      return NextResponse.json(
        {
          error:
            'Pearl type must be one of WhiteAkoya, GreyAkoya, WhiteSouthSea, GoldenSouthSea, or Tahitian.',
        },
        { status: 400 }
      )
    }
    const category = normalizeCategory(draft.category)
    const shape = normalizeShape(draft.shape)
    const luster = normalizeLuster(draft.luster)
    const overtone = normalizeOvertone(draft.overtone)
    const sizeMm = extractSizeMm(draft.subtitle, draft.description)
    const sku = await getNextProductSku(supabase)

    const productData: ProductInsert = {
      title: String(draft.title).trim(),
      slug: buildSlug(String(draft.title).trim(), pearlType, category),
      sku,
      description: String(draft.description || '').trim() || null,
      editors_pick: false,
      note: body?.notes ? String(body.notes).trim() : null,
      pearl_type: pearlType,
      category,
      size_mm: sizeMm,
      shape,
      luster,
      overtone,
      material: null,
      sell_price: null,
      original_price: null,
      availability: 'IN_STOCK',
      preorder_note: null,
      published: false,
      published_at: null,
      inventory_item_id: null,
    }

    const { data, error } = await supabase
      .from('catalog_products')
      .insert(productData)
      .select('id, slug, title')
      .single()

    if (error) throw error

    await syncProductAvailabilitySnapshots(supabase, [data.id])

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create draft product' },
      { status: 500 }
    )
  }
}
