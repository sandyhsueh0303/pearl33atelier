import {
  computeProductInventorySummary,
  fetchProductMaterialInputsByProductIds,
  resolveProductAvailability,
  type AvailabilityKind,
} from '@pearl33atelier/shared'
import { createSupabaseAdminClient } from '../../supabaseAdmin'
import {
  checkProductAvailabilityInputSchema,
  type ProductPurchasability,
} from './checkProductAvailabilitySchema'

function toPurchasability(availability: AvailabilityKind): ProductPurchasability {
  if (availability === 'IN_STOCK') return 'available'
  if (availability === 'PREORDER') return 'preorder'
  return 'unavailable'
}

export async function checkProductAvailability(input: unknown) {
  const { productIds } = checkProductAvailabilityInputSchema.parse(input)
  const uniqueProductIds = Array.from(new Set(productIds))
  const supabase = createSupabaseAdminClient()
  const { data: products, error } = await supabase
    .from('catalog_products')
    .select('id, title, published, availability, preorder_note')
    .in('id', uniqueProductIds)

  if (error) {
    throw new Error(`Product availability lookup failed: ${error.message}`)
  }

  const publishedProducts = (products || []).filter((product) => product.published)
  const productsById = new Map(
    publishedProducts.map((product) => [product.id, product])
  )
  const materialsByProductId = await fetchProductMaterialInputsByProductIds(
    supabase,
    publishedProducts.map((product) => product.id)
  )

  return {
    products: uniqueProductIds.map((productId) => {
      const product = productsById.get(productId)

      if (!product) {
        return {
          productId,
          title: null,
          purchasability: 'unavailable' as const,
          preorderNote: null,
        }
      }

      const inventorySummary = computeProductInventorySummary(
        materialsByProductId.get(product.id) || [],
        product.availability
      )
      const effectiveAvailability = resolveProductAvailability(
        product.availability,
        inventorySummary
      )
      const purchasability = toPurchasability(effectiveAvailability)

      return {
        productId: product.id,
        title: product.title,
        purchasability,
        preorderNote:
          purchasability === 'preorder' ? product.preorder_note ?? null : null,
      }
    }),
  }
}
