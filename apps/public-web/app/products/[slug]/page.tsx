import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import type { CatalogProduct, ProductImage } from '@pearl33atelier/shared/types'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

// Disable caching for this page to always show latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let product: CatalogProduct | null = null
  let images: ProductImage[] = []

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: productData, error: productError } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (productError || !productData) {
      return notFound()
    }

    product = productData

    if (product) {
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (!imagesError && imagesData) {
        images = imagesData
      }
    }
  } catch (e) {
    // Server-side error, safe to log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading product:', e)
    }
  }

  if (!product) {
    return notFound()
  }

  return <ProductDetailClient product={product} images={images} />
}
