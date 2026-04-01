import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { ProductCategory } from '@pearl33atelier/shared/types'
import ProductList from './ProductList'
import type { ProductListImage, ProductListItem } from './ProductList'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

type CollectionSortBy = 'price-low' | 'price-high' | 'date-old' | 'date-new'
type ProductSearchParams = {
  page?: string
  category?: string
  pearlType?: string
  sortBy?: string
  sale?: string
}

interface ProductWithImages extends ProductListItem {
  primaryImage?: ProductListImage
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'
const DEFAULT_PRODUCT_IMAGE = `${SITE_URL}/images/default-product.jpg`

const CATEGORY_LABELS: Record<string, string> = {
  Bracelets: 'Bracelets',
  Necklaces: 'Necklaces',
  Earrings: 'Earrings',
  Studs: 'Studs',
  Rings: 'Rings',
  Pendants: 'Pendants',
  'Loose Pearls': 'Loose Pearls',
  Brooches: 'Brooches',
  Others: 'Others',
}

const CATEGORY_QUERY_VALUES: Record<string, ProductCategory[]> = {
  Bracelets: ['BRACELETS'],
  Necklaces: ['NECKLACES'],
  Earrings: ['EARRINGS', 'STUDS'],
  Studs: ['STUDS'],
  Rings: ['RINGS'],
  Pendants: ['PENDANTS'],
  'Loose Pearls': ['LOOSE_PEARLS'],
  Brooches: ['BROOCHES'],
  Others: ['PENDANTS', 'LOOSE_PEARLS', 'BROOCHES'],
}

const PEARL_TYPE_LABELS: Record<string, string> = {
  Akoya: 'Akoya Pearls',
  'South Sea': 'South Sea Pearls',
  Tahitian: 'Tahitian Pearls',
  More: 'More',
}

const PEARL_TYPE_QUERY_MODES: Record<string, { mode: 'include' | 'exclude'; tokens: string[] }> = {
  Akoya: { mode: 'include', tokens: ['Akoya'] },
  'South Sea': { mode: 'include', tokens: ['SouthSea'] },
  Tahitian: { mode: 'include', tokens: ['Tahitian'] },
  More: { mode: 'exclude', tokens: ['Akoya', 'SouthSea', 'Tahitian'] },
}

function getCollectionContext(category?: string, pearlType?: string, sale?: string) {
  const categoryLabel = category ? CATEGORY_LABELS[category] ?? category : null
  const pearlTypeLabel = pearlType ? PEARL_TYPE_LABELS[pearlType] ?? pearlType : null
  const isSaleCollection = sale === 'true'
  const sharedDescription = 'Accessible luxury for everyday wear'

  if (isSaleCollection) {
    return {
      title: 'Sales',
      description: sharedDescription,
      schemaName: 'Pearl Jewelry Sales',
    }
  }

  if (pearlTypeLabel) {
    return {
      title: `${pearlTypeLabel} Collection`,
      description: sharedDescription,
      schemaName: `${pearlTypeLabel} Pearl Collection`,
    }
  }

  if (categoryLabel) {
    return {
      title: categoryLabel,
      description: sharedDescription,
      schemaName: categoryLabel,
    }
  }

  return {
    title: 'Collection',
    description: sharedDescription,
    schemaName: '33 Pearl Atelier Collection',
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<ProductSearchParams> | ProductSearchParams
}): Promise<Metadata> {
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const parsedPage = Number(resolvedSearchParams?.page ?? '1')
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
  const category = resolvedSearchParams?.category
  const pearlType = resolvedSearchParams?.pearlType
  const sortBy = resolvedSearchParams?.sortBy
  const sale = resolvedSearchParams?.sale
  const collection = getCollectionContext(category, pearlType, sale)
  const canonicalParams = new URLSearchParams()
  if (page > 1) canonicalParams.set('page', String(page))
  if (category) canonicalParams.set('category', category)
  if (pearlType) canonicalParams.set('pearlType', pearlType)
  if (sortBy) canonicalParams.set('sortBy', sortBy)
  if (sale === 'true') canonicalParams.set('sale', 'true')
  const canonicalPath = canonicalParams.toString() ? `/products?${canonicalParams.toString()}` : '/products'
  const title = page > 1 ? `${collection.title} (Page ${page})` : collection.title
  const description = collection.description
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
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

// Read the persisted availability snapshot directly for the collection page.
export const dynamic = 'force-dynamic'
export const revalidate = 0
const PAGE_SIZE = 20

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<ProductSearchParams> | ProductSearchParams
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const pageParam = resolvedSearchParams?.page
  const categoryParam = resolvedSearchParams?.category
  const pearlTypeParam = resolvedSearchParams?.pearlType
  const sortByParam = resolvedSearchParams?.sortBy
  const saleParam = resolvedSearchParams?.sale
  const collection = getCollectionContext(categoryParam, pearlTypeParam, saleParam)

  // Canonical URL: page=1 should always resolve to /products
  if (pageParam === '1') {
    const canonicalParams = new URLSearchParams()
    if (categoryParam) canonicalParams.set('category', categoryParam)
    if (pearlTypeParam) canonicalParams.set('pearlType', pearlTypeParam)
    if (sortByParam) canonicalParams.set('sortBy', sortByParam)
    if (saleParam === 'true') canonicalParams.set('sale', 'true')
    const canonicalQuery = canonicalParams.toString()
    redirect(canonicalQuery ? `/products?${canonicalQuery}` : '/products')
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
  let productsQuery = supabase
    .from('catalog_products')
    .select(
      'id, title, slug, editors_pick, pearl_type, size_mm, sell_price, original_price, category, availability, published_at'
    )
    .eq('published', true)

  if (categoryParam && CATEGORY_QUERY_VALUES[categoryParam]) {
    const categoryValues = CATEGORY_QUERY_VALUES[categoryParam]
    productsQuery =
      categoryValues.length === 1
        ? productsQuery.eq('category', categoryValues[0])
        : productsQuery.in('category', categoryValues)
  }

  if (pearlTypeParam && PEARL_TYPE_QUERY_MODES[pearlTypeParam]) {
    const pearlTypeMode = PEARL_TYPE_QUERY_MODES[pearlTypeParam]
    if (pearlTypeMode.mode === 'include') {
      productsQuery = productsQuery.ilike('pearl_type', `%${pearlTypeMode.tokens[0]}%`)
    } else {
      for (const token of pearlTypeMode.tokens) {
        productsQuery = productsQuery.not('pearl_type', 'ilike', `%${token}%`)
      }
    }
  }

  let productsData: ProductListItem[] | null = null
  let productsError: { message?: string } | null = null

  if (saleParam === 'true') {
    const saleQueryResult = await productsQuery.order('published_at', { ascending: false })
    productsError = saleQueryResult.error
    productsData = ((saleQueryResult.data || []) as ProductListItem[]).filter((product) => {
      return (
        typeof product.original_price === 'number' &&
        typeof product.sell_price === 'number' &&
        product.original_price !== product.sell_price
      )
    })
  } else {
    const pagedQueryResult = await productsQuery
      .order('published_at', { ascending: false })
      .range(from, to)
    productsError = pagedQueryResult.error
    productsData = (pagedQueryResult.data || []) as ProductListItem[]
  }

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
  const saleFilteredProducts =
    saleParam === 'true' ? productsListRaw.slice(from, from + PAGE_SIZE + 1) : productsListRaw
  const hasNextPage = saleFilteredProducts.length > PAGE_SIZE
  const productsList = hasNextPage ? saleFilteredProducts.slice(0, PAGE_SIZE) : saleFilteredProducts
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
  const products: ProductWithImages[] = productsList.map((product) => ({
    ...product,
    primaryImage: imageByProductId.get(product.id),
  }))

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.schemaName,
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
      <ProductList
        products={products}
        currentPage={page}
        hasNextPage={hasNextPage}
        pageTitle={collection.title}
        pageDescription={collection.description}
        initialFilters={
          categoryParam || pearlTypeParam || sortByParam || saleParam === 'true'
            ? {
                ...(categoryParam ? { category: categoryParam } : {}),
                ...(pearlTypeParam ? { pearlType: pearlTypeParam } : {}),
                ...(saleParam === 'true' ? { saleOnly: true } : {}),
                ...(sortByParam ? { sortBy: sortByParam as CollectionSortBy } : {}),
              }
            : undefined
        }
      />
    </>
  )
}
