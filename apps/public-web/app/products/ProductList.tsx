'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProductImageUrl, getProductImageVariantUrl } from '@pearl33atelier/shared'
import type { AvailabilityKind, ProductCategory } from '@pearl33atelier/shared/types'
import FilterPanel, { type ProductFilters } from '../components/FilterPanel'
import PageHero from '../components/PageHero'
import PearlFinderQuiz from '../components/PearlFinderQuiz'
import { useCart } from '../components/CartProvider'
import styles from './ProductList.module.css'

export interface ProductListItem {
  id: string
  title: string
  slug: string
  editors_pick: boolean
  pearl_type: string
  size_mm: string | null
  sell_price: number | null
  original_price: number | null
  category: ProductCategory | null
  availability: AvailabilityKind
  published_at: string | null
}

export interface ProductListImage {
  product_id: string
  storage_path: string
}

interface ProductWithImages extends ProductListItem {
  primaryImage?: ProductListImage
}

interface ProductListProps {
  products: ProductWithImages[]
  currentPage: number
  hasNextPage: boolean
  pageTitle?: string
  pageDescription?: string
  initialFilters?: ProductFilters
}

export default function ProductList({
  products,
  currentPage,
  hasNextPage,
  pageTitle,
  pageDescription,
  initialFilters,
}: ProductListProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const deferredFilters = useDeferredValue(filters)
  const { addItem } = useCart()

  const getCategoryLabel = (category: string | null | undefined) => {
    const labels: Record<string, string> = {
      BRACELETS: 'Bracelets',
      NECKLACES: 'Necklaces',
      EARRINGS: 'Earrings',
      STUDS: 'Studs',
      RINGS: 'Rings',
      PENDANTS: 'Pendants',
      LOOSE_PEARLS: 'Loose Pearls',
      BROOCHES: 'Brooches',
    }
    return category ? labels[category] || category : null
  }
  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '')
  const getTimestamp = (value?: string | null) => (value ? new Date(value).getTime() : 0)
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (deferredFilters.searchQuery) {
      const query = normalize(deferredFilters.searchQuery)
      result = result.filter((product) => {
        const title = normalize(product.title || '')
        const slug = normalize(product.slug || '')
        const pearlType = normalize(String(product.pearl_type || ''))
        const category = normalize(getCategoryLabel(product.category) || '')
        return (
          title.includes(query) ||
          slug.includes(query) ||
          pearlType.includes(query) ||
          category.includes(query)
        )
      })
    }

    if (deferredFilters.pearlType) {
      const selected = normalize(deferredFilters.pearlType)
      result = result.filter((product) => {
        const productType = normalize(String(product.pearl_type))
        if (selected === 'akoya') return productType.includes('akoya')
        if (selected === 'southsea') return productType.includes('southsea')
        if (selected === 'more') {
          return !productType.includes('akoya') &&
            !productType.includes('southsea') &&
            !productType.includes('tahitian')
        }
        return productType.includes(selected)
      })
    }

    if (deferredFilters.saleOnly) {
      result = result.filter((product) => {
        return (
          typeof product.original_price === 'number' &&
          typeof product.sell_price === 'number' &&
          product.original_price !== product.sell_price
        )
      })
    }

    if (deferredFilters.category) {
      const categoryMap: Record<string, string[]> = {
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
      const targetCategories = categoryMap[deferredFilters.category]
      if (targetCategories) {
        result = result.filter((product) =>
          Boolean(product.category && targetCategories.includes(product.category))
        )
      }
    }

    if (deferredFilters.editorsPick) {
      result = result.filter((product) => product.editors_pick)
    }

    if (deferredFilters.priceRange) {
      const { min, max } = deferredFilters.priceRange
      result = result.filter((product) => {
        if (typeof product.sell_price !== 'number') return false
        return product.sell_price >= min && product.sell_price <= max
      })
    }

    const sortBy = deferredFilters.sortBy || 'date-new'
    result.sort((a, b) => {
      if (sortBy === 'price-low') {
        const aPrice = typeof a.sell_price === 'number' ? a.sell_price : Number.POSITIVE_INFINITY
        const bPrice = typeof b.sell_price === 'number' ? b.sell_price : Number.POSITIVE_INFINITY
        return aPrice - bPrice
      }

      if (sortBy === 'price-high') {
        const aPrice = typeof a.sell_price === 'number' ? a.sell_price : Number.NEGATIVE_INFINITY
        const bPrice = typeof b.sell_price === 'number' ? b.sell_price : Number.NEGATIVE_INFINITY
        return bPrice - aPrice
      }

      if (sortBy === 'date-old') {
        return getTimestamp(a.published_at) - getTimestamp(b.published_at)
      }

      return getTimestamp(b.published_at) - getTimestamp(a.published_at)
    })

    return result
  }, [products, deferredFilters])
  const hasActiveFilters = Boolean(
      deferredFilters.searchQuery ||
      deferredFilters.pearlType ||
      deferredFilters.saleOnly ||
      deferredFilters.category ||
      deferredFilters.editorsPick ||
      deferredFilters.priceRange ||
      deferredFilters.sortBy
  )
  const paginationParams = new URLSearchParams()
  if (initialFilters?.category) paginationParams.set('category', initialFilters.category)
  if (initialFilters?.pearlType) paginationParams.set('pearlType', initialFilters.pearlType)
  if (initialFilters?.saleOnly) paginationParams.set('sale', 'true')
  if (initialFilters?.sortBy) paginationParams.set('sortBy', initialFilters.sortBy)
  const previousPageHref = (() => {
    const params = new URLSearchParams(paginationParams)
    if (currentPage > 2) params.set('page', String(currentPage - 1))
    return params.toString() ? `/products?${params.toString()}` : '/products'
  })()
  const nextPageHref = (() => {
    const params = new URLSearchParams(paginationParams)
    params.set('page', String(currentPage + 1))
    return `/products?${params.toString()}`
  })()

  return (
    <main className={styles.main}>
      <PearlFinderQuiz />
      <PageHero
        eyebrow="Collection"
        title={pageTitle || 'Collection'}
        description={`${pageDescription || 'Accessible luxury for everyday wear'}\nHand-selected pearls • Exact piece shown • Small batch production`}
      />
      <section className={styles.section}>
        <div className={styles.shell}>
          <div className={styles.toolbar}>
            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
            </span>
            <FilterPanel onFilterChange={setFilters} initialFilters={initialFilters} />
          </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              No products found
            </p>
            <p className={styles.emptyCopy}>
              Try adjusting your filters to see more items
            </p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {filteredProducts.map((product, index) => (
              <div key={product.id} className={styles.productItem}>
                <div
                  className={`${styles.productCard} ${
                    product.availability === 'OUT_OF_STOCK' ? styles.soldProductCard : ''
                  }`}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className={styles.productLink}
                  >
                    {/* Image */}
                    <div className={styles.imageFrame}>
                      {product.editors_pick && product.availability !== 'OUT_OF_STOCK' ? (
                        <div className={styles.editorsPickBadge}>Editor&apos;s Pick</div>
                      ) : null}
                      {product.primaryImage ? (
                        <Image
                          src={getProductImageVariantUrl(product.primaryImage.storage_path, 'medium')}
                          alt={`${product.pearl_type || 'Pearl'} ${getCategoryLabel(product.category) || 'Jewelry'} - ${product.title}`}
                          fill
                          priority={index < 2}
                          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <span className={styles.placeholderIcon}>✦</span>
                          <div className={styles.placeholderText}>
                            Photo Coming Soon
                          </div>
                        </div>
                      )}
                      {product.availability === 'OUT_OF_STOCK' && (
                        <div
                          aria-hidden="true"
                          className={styles.soldOverlay}
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className={styles.productInfo}>
                      <h2 className={styles.productTitle}>
                        {product.title}
                      </h2>

                      <div className={styles.productMetaRow}>
                        <div>
                          {product.sell_price && (
                            <div className={styles.currentPrice}>
                              $ {product.sell_price.toLocaleString()}
                            </div>
                          )}
                          {product.original_price && product.original_price > (product.sell_price || 0) && (
                            <div className={styles.originalPrice}>
                              $ {product.original_price.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className={styles.productActions}>
                          {product.availability === 'OUT_OF_STOCK' && (
                            <span className={styles.soldBadge}>
                              Sold
                            </span>
                          )}
                          {product.availability !== 'OUT_OF_STOCK' && (
                            <button
                              type="button"
                              aria-label={`Add ${product.title} to cart`}
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                addItem({
                                  id: product.id,
                                  slug: product.slug,
                                  title: product.title,
                                  imageUrl: product.primaryImage
                                    ? getProductImageUrl(product.primaryImage.storage_path)
                                    : null,
                                  pearlType: product.pearl_type || null,
                                  sizeMm: product.size_mm || null,
                                  price: typeof product.sell_price === 'number' ? product.sell_price : null,
                                  availability: product.availability,
                                })
                              }}
                              className={styles.addToCartButton}
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

          {!hasActiveFilters && filteredProducts.length > 0 && (currentPage > 1 || hasNextPage) && (
            <div className={styles.pagination}>
              <div className={styles.paginationControls}>
                <Link
                  href={previousPageHref}
                  prefetch
                  className={`${styles.paginationLink} ${
                    currentPage === 1 ? styles.paginationLinkDisabled : ''
                  }`}
                >
                  Previous
                </Link>

                <Link
                  href={nextPageHref}
                  prefetch
                  className={`${styles.paginationLink} ${
                    hasNextPage ? '' : styles.paginationLinkDisabled
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
