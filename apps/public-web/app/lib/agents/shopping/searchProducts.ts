import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import type { ProductCategory } from '@pearl33atelier/shared/types'
import { searchProductsInputSchema, type SearchProductsInput } from './searchProductsSchema'

const CATEGORY_VALUES: Record<SearchProductsInput['category'], readonly ProductCategory[]> = {
  bracelets: ['BRACELETS'],
  necklaces: ['NECKLACES'],
  earrings: ['EARRINGS', 'STUDS'],
  rings: ['RINGS'],
  pendants: ['PENDANTS'],
  loose_pearls: ['LOOSE_PEARLS'],
  brooches: ['BROOCHES'],
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'
const MAX_RESULTS = 6

function normalizePearlPreference(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export async function searchProducts(input: unknown) {
  const filters = searchProductsInputSchema.parse(input)
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let query = supabase
    .from('catalog_products')
    .select('id, title, slug, pearl_type, size_mm, material, category, sell_price')
    .eq('published', true)
    .in('category', CATEGORY_VALUES[filters.category])
    .limit(MAX_RESULTS)

  if (filters.maxPrice !== null) {
    query = query.lte('sell_price', filters.maxPrice)
  }

  if (filters.minPrice !== null) {
    query = query.gte('sell_price', filters.minPrice)
  }

  if (filters.pearlPreference !== null) {
    const preference = normalizePearlPreference(filters.pearlPreference)

    if (preference === 'whitepearl' || preference === 'whitepearls') {
      query = query.or(
        'pearl_type.ilike.%WhiteAkoya%,pearl_type.ilike.%WhiteSouthSea%'
      )
    } else {
      query = query.ilike('pearl_type', `%${filters.pearlPreference}%`)
    }
  }

  const { data, error } = await query.order('published_at', { ascending: false })
  if (error) throw new Error(`Product search failed: ${error.message}`)

  return (data || []).map((product) => ({
    ...product,
    url: `${SITE_URL}/products/${product.slug}`,
  }))
}
