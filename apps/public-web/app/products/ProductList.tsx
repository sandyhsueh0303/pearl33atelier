'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { AvailabilityKind, ProductCategory } from '@pearl33atelier/shared/types'
import { colors, typography, spacing, transitions, shadows } from '../constants/design'
import FilterPanel, { type ProductFilters } from '../components/FilterPanel'

export interface ProductListItem {
  id: string
  title: string
  slug: string
  pearl_type: string
  size_mm: number | null
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
}

export default function ProductList({ products, currentPage, hasNextPage }: ProductListProps) {
  const [filters, setFilters] = useState<ProductFilters>({})
  const deferredFilters = useDeferredValue(filters)

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
        return productType.includes(selected)
      })
    }

    if (deferredFilters.category) {
      const categoryMap: Record<string, string> = {
        Bracelets: 'BRACELETS',
        Necklaces: 'NECKLACES',
        Earrings: 'EARRINGS',
        Studs: 'STUDS',
        Rings: 'RINGS',
        Pendants: 'PENDANTS',
        'Loose Pearls': 'LOOSE_PEARLS',
        Brooches: 'BROOCHES',
      }
      const targetCategory = categoryMap[deferredFilters.category]
      if (targetCategory) {
        result = result.filter((product) => product.category === targetCategory)
      }
    }

    if (deferredFilters.priceRange) {
      const { min, max } = deferredFilters.priceRange
      result = result.filter((product) => {
        if (typeof product.sell_price !== 'number') return false
        return product.sell_price >= min && product.sell_price <= max
      })
    }

    const sortBy = deferredFilters.sortBy || 'newest'
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

      if (sortBy === 'popular') {
        return getTimestamp(b.published_at) - getTimestamp(a.published_at)
      }

      return getTimestamp(b.published_at) - getTimestamp(a.published_at)
    })

    return result
  }, [products, deferredFilters])
  const hasActiveFilters = Boolean(
    deferredFilters.searchQuery ||
      deferredFilters.pearlType ||
      deferredFilters.category ||
      deferredFilters.priceRange ||
      deferredFilters.sortBy
  )
  const previousPageHref = currentPage <= 2 ? '/products' : `/products?page=${currentPage - 1}`
  const nextPageHref = `/products?page=${currentPage + 1}`

  return (
    <main style={{ 
      minHeight: '100vh',
      backgroundColor: colors.white,
      padding: `clamp(1rem, 3vw, ${spacing['3xl']})`,
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: spacing['3xl'], textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: typography.fontSize['5xl'], 
            fontWeight: typography.fontWeight.light,
            marginBottom: spacing.md,
            color: colors.darkGray,
            letterSpacing: '0.02em',
          }}>
            Collection
          </h1>
          <p style={{ 
            fontSize: typography.fontSize.lg, 
            color: colors.textSecondary 
          }}>
            Curated Pearl Jewelry Collection
          </p>
        </header>

        <FilterPanel onFilterChange={setFilters} />

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
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: spacing['2xl']
          }}>
            {filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block'
                }}
              >
                <div style={{
                  backgroundColor: colors.white,
                  overflow: 'hidden',
                  boxShadow: shadows.subtle,
                  transition: transitions.normal,
                  cursor: 'pointer'
                }}
                className="productCard"
                >
                  {/* Image */}
                  <div style={{
                    width: '100%',
                    paddingBottom: '100%',
                    position: 'relative',
                    backgroundColor: colors.pearl
                  }}>
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.textLight
                      }}>
                        <span style={{ fontSize: '3rem' }}>✦</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: spacing.lg }}>
                    <h2 style={{ 
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.medium,
                      marginBottom: spacing.xs,
                      color: colors.darkGray
                    }}>
                      {product.title}
                    </h2>

                    <div style={{ 
                      display: 'flex',
                      gap: spacing.xs,
                      marginBottom: spacing.sm
                    }}>
                      {product.category && (
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: '#f3e5f5',
                          color: colors.darkGray,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                        }}>
                          {getCategoryLabel(product.category)}
                        </span>
                      )}
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: colors.pearl,
                        color: colors.gold,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        letterSpacing: '0.05em',
                      }}>
                        {product.pearl_type}
                      </span>
                      {product.size_mm && (
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: colors.lightGray,
                          color: colors.textSecondary,
                          fontSize: typography.fontSize.xs
                        }}>
                          {product.size_mm}mm
                        </span>
                      )}
                    </div>

                    {/* Description removed from card view; only shown on detail page */}

                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
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

                      <span
                        style={{
                          padding: '6px 12px',
                          backgroundColor:
                            product.availability === 'IN_STOCK'
                              ? '#e8f5e9'
                              : product.availability === 'OUT_OF_STOCK'
                              ? '#fbe9e7'
                              : colors.champagne,
                          color:
                            product.availability === 'IN_STOCK'
                              ? '#2e7d32'
                              : product.availability === 'OUT_OF_STOCK'
                              ? '#b71c1c'
                              : colors.gold,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {product.availability === 'IN_STOCK'
                          ? 'In Stock'
                          : product.availability === 'OUT_OF_STOCK'
                          ? 'Out of Stock'
                          : 'Pre-order'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
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
      <style jsx>{`
        .productCard:hover {
          box-shadow: ${shadows.medium};
        }
      `}</style>
    </main>
  )
}
