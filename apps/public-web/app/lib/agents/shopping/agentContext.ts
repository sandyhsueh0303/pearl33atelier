import type { ShoppingCategory } from './intent'
import type { CheckProductAvailabilityOutput } from './schemas/checkProductAvailabilitySchema'
import type { ProductDetailsResult } from './schemas/getProductDetailsSchema'
import type { RankedProduct } from './rankProducts'
import type { SearchProductsOutput } from './schemas/searchProductsSchema'
import type {
  RecommendedProduct,
  ShoppingContext,
} from './shoppingContext'
import type { RecommendedProductReferencePlan } from './referenceResolution'

export type ShoppingAgentContext = {
  explicitCategory: ShoppingCategory | null
  shoppingContext: ShoppingContext
  resolvedProductReference: RecommendedProduct | null
  referenceToolPlan: RecommendedProductReferencePlan | null
  rankingState: {
    searchResult: SearchProductsOutput | null
    availabilityResult: CheckProductAvailabilityOutput | null
    productDetails: Map<string, ProductDetailsResult>
    rankedProducts: RankedProduct[] | null
  }
}

export type ShoppingIntentAgentContext = {
  explicitCategory: ShoppingCategory | null
}