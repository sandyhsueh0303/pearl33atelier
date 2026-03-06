import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import { getProductImageUrl } from '@pearl33atelier/shared'
import ProductList from './ProductList'
import type { ProductListImage, ProductListItem } from './ProductList'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

interface ProductWithImages extends ProductListItem {
  primaryImage?: ProductListImage
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'
const DEFAULT_PRODUCT_IMAGE = `${SITE_URL}/images/default-product.jpg`

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }> | { page?: string }
}): Promise<Metadata> {
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const parsedPage = Number(resolvedSearchParams?.page ?? '1')
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
  const canonicalPath = page > 1 ? `/products?page=${page}` : '/products'
  const title = page > 1 ? `Collection (Page ${page})` : 'Collection'
  const description =
    'Explore handcrafted pearl jewelry by 33 Pearl Atelier, including necklaces, earrings, bracelets, rings, and bespoke-ready pieces.'
  const ogUrl = `${SITE_URL}${canonicalPath}`

  return {
    title,
    description,
    keywords: [
      'pearl jewelry collection',
      'handcrafted pearl jewelry',
      'akoya pearls',
      'south sea pearls',
      'tahitian pearls',
      'fine pearl jewelry',
      '33 Pearl Atelier',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} | 33 Pearl Atelier`,
      description,
      type: 'website',
      url: ogUrl,
      siteName: '33 Pearl Atelier',
      locale: 'en_US',
      images: [
        {
          url: DEFAULT_PRODUCT_IMAGE,
          width: 1200,
          height: 630,
          alt: '33 Pearl Atelier Collection',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | 33 Pearl Atelier`,
      description,
      images: [DEFAULT_PRODUCT_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
  }
}

// ISR cache to reduce cold-load latency for collection page
export const revalidate = 300
const PAGE_SIZE = 20

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }> | { page?: string }
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const pageParam = resolvedSearchParams?.page

  // Canonical URL: page=1 should always resolve to /products
  if (pageParam === '1') {
    redirect('/products')
  }

  const parsedPage = Number(pageParam ?? '1')
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get published products
  const { data: productsData, error: productsError } = await supabase
    .from('catalog_products')
    .select('id, title, slug, pearl_type, size_mm, sell_price, original_price, category, availability, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (productsError) {
    // Server-side error, safe to log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading products:', productsError)
    }
    return (
      <main style={{ 
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        padding: '2rem',
                display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#fee', 
          border: '1px solid #c00',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <strong>Error:</strong> Failed to load products
        </div>
      </main>
    )
  }

  // Get primary images only for the current paged products (max 20)
  const productsListRaw = productsData || []
  const hasNextPage = productsListRaw.length > PAGE_SIZE
  const productsList = hasNextPage ? productsListRaw.slice(0, PAGE_SIZE) : productsListRaw
  const pagedProductIds = productsList.map((p) => p.id)
  
  let imagesList: ProductListImage[] = []
  if (pagedProductIds.length > 0) {
    const { data: imagesData } = await supabase
      .from('product_images')
      .select('product_id, storage_path')
      .in('product_id', pagedProductIds)
      .eq('published', true)
      .eq('is_primary', true)

    imagesList = imagesData || []
  }

  const imageByProductId = new Map(imagesList.map((img) => [img.product_id, img]))

  // Combine products with their primary images
  const products: ProductWithImages[] = productsList.map(product => ({
    ...product,
    primaryImage: imageByProductId.get(product.id)
  }))

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '33 Pearl Atelier Collection',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: from + index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.title,
      image: product.primaryImage
        ? getProductImageUrl(product.primaryImage.storage_path)
        : DEFAULT_PRODUCT_IMAGE,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ProductList products={products} currentPage={page} hasNextPage={hasNextPage} />
    </>
  )
}
