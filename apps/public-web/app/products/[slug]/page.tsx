import { createSupabaseClient } from '@33pearlatelier/shared/supabase'
import type { CatalogProduct, ProductImage } from '@33pearlatelier/shared/types'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

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

    product = productData as any

    if (product) {
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (!imagesError && imagesData) {
        images = imagesData as any[]
      }
    }
  } catch (e) {
    console.error('Error loading product:', e)
  }

  if (!product) {
    return notFound()
  }

  return <ProductDetailClient product={product} images={images} />
}
