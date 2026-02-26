import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage } from '@pearl33atelier/shared/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'

// Disable caching for this page to always show latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPublishedProductBySlug(slug: string) {
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
    return null
  }

  const { data: imagesData, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productData.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  const images = !imagesError && imagesData ? imagesData : []
  return { product: productData as CatalogProduct, images: images as ProductImage[] }
}

function buildProductDescription(product: CatalogProduct) {
  if (product.description?.trim()) {
    return product.description.trim().slice(0, 155)
  }

  const parts = [
    product.pearl_type,
    product.category?.replace('_', ' '),
    product.size_mm ? `${product.size_mm}mm` : null,
    product.material,
  ].filter(Boolean)

  return `${product.title} by 33 Pearl Atelier${parts.length ? ` - ${parts.join(', ')}` : ''}.`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getPublishedProductBySlug(slug)

  if (!result) {
    return {
      title: 'Product Not Found',
      description: 'This product is currently unavailable.',
    }
  }

  const { product, images } = result
  const description = buildProductDescription(product)
  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const imageUrl = primaryImage ? getProductImageUrl(primaryImage.storage_path) : undefined

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: product.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let product: CatalogProduct | null = null
  let images: ProductImage[] = []

  try {
    const result = await getPublishedProductBySlug(slug)
    if (!result) {
      return notFound()
    }

    product = result.product
    images = result.images
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
