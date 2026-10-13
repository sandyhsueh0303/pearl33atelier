import type { ProductDetailsResult } from '../../app/lib/agents/shopping/getProductDetailsSchema'
import {
  createEmptyShoppingContext,
  type ShoppingContext,
} from '../../app/lib/agents/shopping/shoppingContext'
import type { SearchProductsOutput } from '../../app/lib/agents/shopping/searchProductsSchema'
import type { CheckProductAvailabilityOutput } from '../../app/lib/agents/shopping/checkProductAvailabilitySchema'

type SearchProduct = SearchProductsOutput['products'][number]
type Availability = CheckProductAvailabilityOutput['products'][number]

export const ids = {
  a: '00000000-0000-4000-8000-00000000000a',
  b: '00000000-0000-4000-8000-00000000000b',
  c: '00000000-0000-4000-8000-00000000000c',
}

export function product(
  id: string,
  values: Partial<SearchProduct> = {}
): SearchProduct {
  return {
    id,
    title: `Product ${id.at(-1)?.toUpperCase()}`,
    slug: `product-${id.at(-1)}`,
    pearl_type: 'Freshwater',
    size_mm: null,
    material: null,
    category: 'EARRINGS',
    sell_price: 200,
    url: `https://example.com/products/product-${id.at(-1)}`,
    ...values,
  }
}

export function availability(
  productId: string,
  purchasability: Availability['purchasability'] = 'available'
): Availability {
  return {
    productId,
    title: `Product ${productId.at(-1)?.toUpperCase()}`,
    purchasability,
    preorderNote: purchasability === 'preorder' ? 'Made to order' : null,
  }
}

export function details(
  searchProduct: SearchProduct,
  description: string
): ProductDetailsResult {
  return {
    ...searchProduct,
    description,
    shape: null,
    luster: null,
    overtone: null,
    original_price: null,
    editors_pick: false,
  }
}

export function context(values: Partial<ShoppingContext>): ShoppingContext {
  return {
    ...createEmptyShoppingContext(),
    ...values,
  }
}
