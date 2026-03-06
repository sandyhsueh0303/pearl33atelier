import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage } from '@pearl33atelier/shared/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import ProductDetailClient from './ProductDetailClient'

// Disable caching for this page to always show latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'
const DEFAULT_IMAGE_URL = `${SITE_URL}/images/default-product.jpg`

const getPublishedProductBySlug = cache(async (slug: string) => {
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

  if (productError) {
    // PGRST116 means no rows found for .single() - treat as 404.
    if (productError.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to load product: ${productError.message}`)
  }

  if (!productData) {
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
})

function buildProductDescription(product: CatalogProduct) {
  const availabilityText =
    product.availability === 'IN_STOCK'
      ? 'In stock.'
      : product.availability === 'PREORDER'
      ? 'Available for pre-order.'
      : 'Currently out of stock.'

  if (product.description?.trim()) {
    return `${product.description.trim()} ${availabilityText}`.slice(0, 155)
  }

  const parts = [
    product.pearl_type,
    product.category?.replace('_', ' '),
    product.size_mm ? `${product.size_mm}mm` : null,
    product.material,
  ].filter(Boolean)

  return `${product.title} by 33 Pearl Atelier${parts.length ? ` - ${parts.join(', ')}` : ''}. ${availabilityText}`.slice(0, 155)
}

function getCategoryName(category: string | null | undefined): string {
  const names: Record<string, string> = {
    NECKLACES: 'Necklace',
    EARRINGS: 'Earrings',
    STUDS: 'Stud Earrings',
    BRACELETS: 'Bracelet',
    RINGS: 'Ring',
    PENDANTS: 'Pendant',
    LOOSE_PEARLS: 'Loose Pearls',
    BROOCHES: 'Brooch',
  }
  return category ? names[category] || category : ''
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  let result: Awaited<ReturnType<typeof getPublishedProductBySlug>>
  try {
    result = await getPublishedProductBySlug(slug)
  } catch {
    return {
      title: 'Product | 33 Pearl Atelier',
      description: 'Product details are temporarily unavailable. Please try again shortly.',
    }
  }

  if (!result) {
    return {
      title: 'Product Not Found',
      description: 'This product is currently unavailable.',
    }
  }

  const { product, images } = result
  const description = buildProductDescription(product)
  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const imageUrl = primaryImage ? getProductImageUrl(primaryImage.storage_path) : DEFAULT_IMAGE_URL
  const productUrl = `${SITE_URL}/products/${slug}`
  const title = product.size_mm ? `${product.title} ${product.size_mm}mm` : product.title

  return {
    title,
    description,
    keywords: [
      product.title,
      product.pearl_type || '',
      getCategoryName(product.category),
      product.material || '',
      'pearl jewelry',
      'fine jewelry',
      '33 Pearl Atelier',
    ].filter(Boolean),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: productUrl,
      siteName: '33 Pearl Atelier',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
    other: {
      'product:price:amount': String(product.sell_price || 0),
      'product:price:currency': 'USD',
      'product:availability':
        product.availability === 'IN_STOCK'
          ? 'in stock'
          : product.availability === 'PREORDER'
          ? 'preorder'
          : 'out of stock',
      'product:condition': 'new',
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let result: Awaited<ReturnType<typeof getPublishedProductBySlug>>
  try {
    result = await getPublishedProductBySlug(slug)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading product:', error)
    }
    return (
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          color: '#2e2e2e',
        }}
      >
        Product details are temporarily unavailable. Please try again in a moment.
      </main>
    )
  }

  if (!result) {
    return notFound()
  }
  const product: CatalogProduct = result.product
  const images: ProductImage[] = result.images

  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const imageUrl = primaryImage ? getProductImageUrl(primaryImage.storage_path) : DEFAULT_IMAGE_URL
  const productUrl = `${SITE_URL}/products/${slug}`

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    url: productUrl,
    name: product.title,
    image: images.length
      ? images.map((img) => getProductImageUrl(img.storage_path))
      : [imageUrl],
    description: product.description || buildProductDescription(product),
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    category: getCategoryName(product.category),
    material: product.material || undefined,
    brand: {
      '@type': 'Brand',
      name: '33 Pearl Atelier',
    },
    additionalProperty: [
      product.pearl_type
        ? {
            '@type': 'PropertyValue',
            name: 'Pearl Type',
            value: product.pearl_type,
          }
        : null,
      product.size_mm
        ? {
            '@type': 'PropertyValue',
            name: 'Size',
            value: `${product.size_mm}mm`,
          }
        : null,
      product.shape
        ? {
            '@type': 'PropertyValue',
            name: 'Shape',
            value: product.shape,
          }
        : null,
    ].filter(Boolean),
    offers: {
      '@type': 'Offer',
      '@id': `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: 'USD',
      price: product.sell_price || 0,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.availability === 'IN_STOCK'
          ? 'https://schema.org/InStock'
          : product.availability === 'PREORDER'
          ? 'https://schema.org/PreOrder'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: '33 Pearl Atelier',
      },
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
      { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} images={images} />
    </>
  )
}
