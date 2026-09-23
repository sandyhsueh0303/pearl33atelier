import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import {
  getProductDetailsInputSchema,
  type GetProductDetailsOutput,
} from './getProductDetailsSchema'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'

export async function getProductDetails(input: unknown): Promise<GetProductDetailsOutput> {
  const { productId } = getProductDetailsInputSchema.parse(input)
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: product, error } = await supabase
    .from('catalog_products')
    .select(
      'id, title, slug, description, pearl_type, size_mm, shape, luster, overtone, material, category, sell_price, original_price, editors_pick'
    )
    .eq('id', productId)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    throw new Error(`Product details lookup failed: ${error.message}`)
  }

  if (!product) {
    return { product: null }
  }

  return {
    product: {
      ...product,
      url: `${SITE_URL}/products/${product.slug}`,
    },
  }
}
