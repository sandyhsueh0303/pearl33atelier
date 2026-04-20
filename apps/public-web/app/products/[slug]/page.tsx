import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import {
  computeProductInventorySummary,
  getProductImageUrl,
  resolveProductAvailability,
  type MaterialInventoryInput,
  type ProductInventorySummary,
} from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'

// Disable caching for this page to always show latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'
const DEFAULT_IMAGE_URL = `${SITE_URL}/images/default-product.jpg`

function getAvailabilityText(availability: CatalogProduct['availability']) {
  if (availability === 'IN_STOCK') return 'In stock.'
  if (availability === 'PREORDER') return 'Available for pre-order.'
  return 'Currently sold out.'
}

function getAvailabilityMetaValue(availability: CatalogProduct['availability']) {
  if (availability === 'IN_STOCK') return 'in stock'
  if (availability === 'PREORDER') return 'preorder'
  return 'out of stock'
}

function getAvailabilitySchemaUrl(availability: CatalogProduct['availability']) {
  if (availability === 'IN_STOCK') return 'https://schema.org/InStock'
  if (availability === 'PREORDER') return 'https://schema.org/PreOrder'
  return 'https://schema.org/OutOfStock'
}

const getPublishedProductBySlug = async (slug: string) => {
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
  const { data: materialsData, error: materialsError } = await supabase
    .from('product_materials')
    .select(`
      inventory_item_id,
      quantity_per_unit,
      inventory_items (
        name,
        total_quantity,
        allocated_quantity
      )
    `)
    .eq('product_id', productData.id)

  if (materialsError) {
    throw new Error(`Failed to load product materials: ${materialsError.message}`)
  }

  const inventorySummary = computeProductInventorySummary(
    ((materialsData || []) as Array<MaterialInventoryInput & { inventory_items?: MaterialInventoryInput['inventory_item'] | MaterialInventoryInput['inventory_item'][] }>).map((material) => ({
      inventory_item_id: material.inventory_item_id,
      quantity_per_unit: material.quantity_per_unit,
      inventory_item: Array.isArray(material.inventory_items)
        ? material.inventory_items[0] ?? null
        : material.inventory_items ?? null,
    })),
    (productData as CatalogProduct).availability
  )

  const { data: videosData, error: videosError } = await (supabase as any)
    .from('product_videos')
    .select('*')
    .eq('product_id', productData.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  const videos = !videosError && videosData ? videosData : []

  return {
    product: productData as CatalogProduct,
    images: images as ProductImage[],
    videos: videos as ProductVideo[],
    inventorySummary,
  }
}

function buildProductDescription(product: CatalogProduct) {
  const availabilityText = getAvailabilityText(product.availability)

  if (product.description?.trim()) {
    return `${product.description.trim()} ${availabilityText}`.slice(0, 160)
  }

  const parts = [
    product.pearl_type,
    product.category?.replace('_', ' '),
    product.size_mm ? `${product.size_mm}mm` : null,
    product.material,
  ].filter(Boolean)

  return `${product.title} by 33 Pearl Atelier${parts.length ? ` - ${parts.join(', ')}` : ''}. ${availabilityText}`.slice(0, 160)
}

function buildProductTitle(product: CatalogProduct) {
  return product.size_mm ? `${product.title} ${product.size_mm}mm` : product.title
}

function parseSeoKeywords(value: string | null | undefined) {
  return String(value || '')
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
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
  const effectiveAvailability = resolveProductAvailability(product.availability, result.inventorySummary)
  const productWithEffectiveAvailability = { ...product, availability: effectiveAvailability }
  const fallbackTitle = buildProductTitle(product)
  const title = product.seo_title?.trim() || fallbackTitle
  const description =
    product.seo_description?.trim() || buildProductDescription(productWithEffectiveAvailability)
  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const imageUrl = primaryImage ? getProductImageUrl(primaryImage.storage_path) : DEFAULT_IMAGE_URL
  const productUrl = `${SITE_URL}/products/${slug}`
  const keywords = parseSeoKeywords(product.seo_keywords)

  return {
    title,
    description,
    keywords:
      keywords.length > 0
        ? keywords
        : [
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
          alt: product.og_image_alt?.trim() || fallbackTitle,
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
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    other: {
      'product:price:amount': String(product.sell_price || 0),
      'product:price:currency': 'USD',
      'product:availability': getAvailabilityMetaValue(effectiveAvailability),
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
  const videos: ProductVideo[] = result.videos
  const inventorySummary: ProductInventorySummary = result.inventorySummary
  const effectiveAvailability = resolveProductAvailability(product.availability, inventorySummary)

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
      price: String(product.sell_price || 0),
      itemCondition: 'https://schema.org/NewCondition',
      availability: getAvailabilitySchemaUrl(effectiveAvailability),
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
      <ProductDetailClient
        product={{ ...product, availability: effectiveAvailability }}
        images={images}
        videos={videos}
      />
    </>
  )
}
