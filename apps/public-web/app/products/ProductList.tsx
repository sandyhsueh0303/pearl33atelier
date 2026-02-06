'use client'

import Link from 'next/link'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage } from '@pearl33atelier/shared/types'
import { colors, typography, spacing, transitions, shadows } from '../constants/design'

interface ProductWithImages extends CatalogProduct {
  primaryImage?: ProductImage
}

interface ProductListProps {
  products: ProductWithImages[]
}

export default function ProductList({ products }: ProductListProps) {
  // Helper to safely compare enum values (handles possible undefined/null)
  const getAvailability = (a: any) => (typeof a === 'string' ? a : '')
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

        {products.length === 0 ? (
          <div style={{ 
            padding: spacing['4xl'],
            textAlign: 'center',
            backgroundColor: colors.pearl,
          }}>
            <p style={{ 
              fontSize: typography.fontSize.xl, 
              color: colors.textSecondary 
            }}>
              No products available
            </p>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textLight, 
              marginTop: spacing.sm 
            }}>
              Stay tuned for our upcoming curated jewelry collection
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: spacing['2xl']
          }}>
            {products.map((product) => (
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

                    {product.description && (
                      <p style={{ 
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.sm,
                        marginBottom: spacing.md,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: typography.lineHeight.relaxed,
                      }}>
                        {product.description}
                      </p>
                    )}

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
                            US$ {product.sell_price.toLocaleString()}
                          </div>
                        )}
                        {product.original_price && product.original_price > (product.sell_price || 0) && (
                          <div style={{ 
                            fontSize: typography.fontSize.sm,
                            color: colors.textLight,
                            textDecoration: 'line-through'
                          }}>
                            US$ {product.original_price.toLocaleString()}
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
