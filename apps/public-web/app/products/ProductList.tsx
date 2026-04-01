'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { AvailabilityKind, ProductCategory } from '@pearl33atelier/shared/types'
import { colors, typography, spacing, transitions, shadows } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'
import FilterPanel, { type ProductFilters } from '../components/FilterPanel'
import { useCart } from '../components/CartProvider'

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
  const editorsPickBadgeStyle = {
    position: 'absolute' as const,
    top: spacing.md,
    left: spacing.md,
    zIndex: 2,
    padding: `${spacing.xs} ${spacing.sm}`,
    background: 'rgba(255, 252, 246, 0.94)',
    border: '1px solid rgba(201, 169, 97, 0.34)',
    color: colors.darkGray,
    fontSize: typography.fontSize.xs,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    boxShadow: shadows.soft,
  }
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
    <main style={{ ...pageHeroStyles.main, minHeight: '100vh' }}>
      <PageHero
        eyebrow="Collection"
        title={pageTitle || 'Collection'}
        description={
          `${
            pageDescription ||
            'Explore hand-selected pearl jewelry designed for everyday elegance, from ready-to-wear pieces to styles that can inspire your custom inquiry.'
          } Hand-selected pearls. Exact piece shown. Small batch production.`
        }
      />

      <section style={{ padding: `clamp(1rem, 3vw, ${spacing['3xl']})` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              margin: `${spacing.lg} 0 ${spacing.xl}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing.md,
              flexWrap: 'wrap',
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.02em',
            }}
          >
            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
            </span>
            <FilterPanel onFilterChange={setFilters} initialFilters={initialFilters} />
          </div>

        {filteredProducts.length === 0 ? (
          <div style={{ 
            padding: spacing['4xl'],
            textAlign: 'center',
            backgroundColor: colors.pearl,
          }}>
            <p style={{ 
              fontSize: typography.fontSize.xl, 
              color: colors.textSecondary 
            }}>
              No products found
            </p>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textLight, 
              marginTop: spacing.sm 
            }}>
              Try adjusting your filters to see more items
            </p>
          </div>
        ) : (
          <div
            className="productGrid"
            style={{
              display: 'grid',
              gap: spacing['2xl'],
            }}
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                style={{
                  height: '100%',
                }}
              >
                <div style={{
                  backgroundColor: colors.white,
                  overflow: 'hidden',
                  boxShadow: shadows.subtle,
                  transition: transitions.normal,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  opacity: product.availability === 'OUT_OF_STOCK' ? 0.72 : 1,
                }}
                className="productCard"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '100%',
                      paddingBottom: '133.333%',
                      position: 'relative',
                      backgroundColor: colors.pearl
                    }}>
                      {product.editors_pick && product.availability !== 'OUT_OF_STOCK' ? (
                        <div style={editorsPickBadgeStyle}>Editor&apos;s Pick</div>
                      ) : null}
                      {product.primaryImage ? (
                        <Image
                          src={getProductImageUrl(product.primaryImage.storage_path)}
                          alt={`${product.pearl_type || 'Pearl'} ${getCategoryLabel(product.category) || 'Jewelry'} - ${product.title}`}
                          fill
                          priority={index < 2}
                          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          style={{
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#C9A961'
                        }}>
                          <span style={{ fontSize: '3rem' }}>✦</span>
                          <div style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                            Photo Coming Soon
                          </div>
                        </div>
                      )}
                      {product.availability === 'OUT_OF_STOCK' && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(255, 255, 255, 0.22)',
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h2 style={{ 
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs,
                        color: colors.darkGray,
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}>
                        {product.title}
                      </h2>

                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto',
                        gap: spacing.sm,
                      }}>
                        <div>
                          {product.sell_price && (
                            <div style={{ 
                              fontSize: typography.fontSize.xl,
                              fontWeight: typography.fontWeight.semibold,
                              color: colors.darkGray
                            }}>
                              $ {product.sell_price.toLocaleString()}
                            </div>
                          )}
                          {product.original_price && product.original_price > (product.sell_price || 0) && (
                            <div style={{ 
                              fontSize: typography.fontSize.sm,
                              color: colors.textLight,
                              textDecoration: 'line-through'
                            }}>
                              $ {product.original_price.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.xs,
                            flexShrink: 0,
                          }}
                        >
                          {product.availability === 'OUT_OF_STOCK' && (
                            <span
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#fbe9e7',
                                color: '#b71c1c',
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.semibold,
                              }}
                            >
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
                              style={{
                                width: '30px',
                                height: '30px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${colors.gold}`,
                                backgroundColor: 'rgba(201, 169, 97, 0.08)',
                                color: colors.gold,
                                fontSize: typography.fontSize.lg,
                                lineHeight: 1,
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
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
            <div style={{ marginTop: spacing['2xl'], textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: spacing.xs, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href={previousPageHref}
                  prefetch
                  style={{
                    pointerEvents: currentPage === 1 ? 'none' : 'auto',
                    textDecoration: 'none',
                    padding: `${spacing.xs} ${spacing.md}`,
                    border: `1px solid ${colors.lightGray}`,
                    backgroundColor: currentPage === 1 ? colors.pearl : colors.white,
                    color: colors.darkGray,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </Link>

                <Link
                  href={nextPageHref}
                  prefetch
                  style={{
                    pointerEvents: hasNextPage ? 'auto' : 'none',
                    textDecoration: 'none',
                    padding: `${spacing.xs} ${spacing.md}`,
                    border: `1px solid ${colors.lightGray}`,
                    backgroundColor: hasNextPage ? colors.white : colors.pearl,
                    color: colors.darkGray,
                    cursor: hasNextPage ? 'pointer' : 'not-allowed',
                  }}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <style jsx>{`
        .productGrid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        @media (max-width: 1200px) {
          .productGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .productGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .productGrid {
            grid-template-columns: 1fr;
          }
        }

        .productCard:hover {
          box-shadow: ${shadows.medium};
        }
      `}</style>
    </main>
  )
}
