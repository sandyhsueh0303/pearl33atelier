'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage } from '@pearl33atelier/shared/types'
import { colors, typography, spacing, transitions, shadows } from '../constants/design'
import FilterPanel, { type ProductFilters } from '../components/FilterPanel'

interface ProductWithImages extends CatalogProduct {
  primaryImage?: ProductImage
}

interface ProductListProps {
  products: ProductWithImages[]
}

export default function ProductList({ products }: ProductListProps) {
  const [filters, setFilters] = useState<ProductFilters>({})

  // Helper to safely compare enum values (handles possible undefined/null)
  const getAvailability = (a: any) => (typeof a === 'string' ? a : '')
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

    if (filters.searchQuery) {
      const query = normalize(filters.searchQuery)
      result = result.filter((product) => {
        const title = normalize(product.title || '')
        const slug = normalize(product.slug || '')
        const description = normalize(product.description || '')
        const pearlType = normalize(String(product.pearl_type || ''))
        const category = normalize(getCategoryLabel(product.category) || '')
        return (
          title.includes(query) ||
          slug.includes(query) ||
          description.includes(query) ||
          pearlType.includes(query) ||
          category.includes(query)
        )
      })
    }

    if (filters.pearlType) {
      const selected = normalize(filters.pearlType)
      result = result.filter((product) => {
        const productType = normalize(String(product.pearl_type))
        if (selected === 'akoya') return productType.includes('akoya')
        if (selected === 'southsea') return productType.includes('southsea')
        return productType.includes(selected)
      })
    }

    if (filters.category) {
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
      const targetCategory = categoryMap[filters.category]
      if (targetCategory) {
        result = result.filter((product) => product.category === targetCategory)
      }
    }

    if (filters.priceRange) {
      const { min, max } = filters.priceRange
      result = result.filter((product) => {
        if (typeof product.sell_price !== 'number') return false
        return product.sell_price >= min && product.sell_price <= max
      })
    }

    const sortBy = filters.sortBy || 'newest'
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
        return getTimestamp(b.updated_at) - getTimestamp(a.updated_at)
      }

      return getTimestamp(b.published_at || b.created_at) - getTimestamp(a.published_at || a.created_at)
    })

    return result
  }, [products, filters])

  return (
    <main style={{ 
      minHeight: '100vh',
      backgroundColor: colors.white,
      padding: spacing['3xl'],
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
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: spacing['2xl']
          }}>
            {filteredProducts.map((product) => (
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = shadows.medium
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = shadows.subtle
                }}
                >
                  {/* Image */}
                  <div style={{
                    width: '100%',
                    paddingBottom: '100%',
                    position: 'relative',
                    backgroundColor: colors.pearl
                  }}>
                    {product.primaryImage ? (
                      <img 
                        src={getProductImageUrl(product.primaryImage.storage_path)}
                        alt={product.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
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
                            getAvailability(product.availability) === 'IN_STOCK'
                              ? '#e8f5e9'
                              : getAvailability(product.availability) === 'OUT_OF_STOCK'
                              ? '#fbe9e7'
                              : colors.champagne,
                          color:
                            getAvailability(product.availability) === 'IN_STOCK'
                              ? '#2e7d32'
                              : getAvailability(product.availability) === 'OUT_OF_STOCK'
                              ? '#b71c1c'
                              : colors.gold,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {getAvailability(product.availability) === 'IN_STOCK'
                          ? 'In Stock'
                          : getAvailability(product.availability) === 'OUT_OF_STOCK'
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
      </div>
    </main>
  )
}
