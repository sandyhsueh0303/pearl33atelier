'use client'

import { useState } from 'react'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import { colors, typography, spacing, transitions, shadows } from '../../constants/design'
import { useLanguage } from '../../i18n'

interface ProductDetailClientProps {
  product: CatalogProduct
  images: ProductImage[]
}

export default function ProductDetailClient({ product, images }: ProductDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { t } = useLanguage()
  
  // Handle case when there are no images
  const hasImages = images.length > 0
  const primaryImage = hasImages ? (images.find(img => img.is_primary) || images[0]) : null
  const currentImage = hasImages ? (images[currentImageIndex] || primaryImage) : null

  const nextImage = () => {
    if (!hasImages) return
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    if (!hasImages) return
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <main style={{ 
      minHeight: '100vh',
      backgroundColor: colors.white,
      padding: spacing['3xl'],
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: spacing['2xl'] }}>
          <Link 
            href="/products"
            style={{
              color: colors.gold,
              textDecoration: 'none',
              fontSize: typography.fontSize.sm,
              letterSpacing: '0.05em',
            }}
          >
            {t('products', 'backToProducts')}
          </Link>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing['3xl'],
          backgroundColor: colors.white,
        }}>
          {/* Images Section */}
          <div>
            {/* Main Image with Navigation */}
            <div style={{ position: 'relative', marginBottom: spacing.md }}>
              <div style={{
                width: '100%',
                paddingBottom: '100%',
                position: 'relative',
                backgroundColor: colors.pearl,
                overflow: 'hidden'
              }}>
                {currentImage ? (
                  <img 
                    src={getProductImageUrl(currentImage.storage_path)}
                    alt={product.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
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
                    <span style={{ fontSize: '4rem' }}>✦</span>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: spacing.md,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: typography.fontSize['2xl'],
                      boxShadow: shadows.soft,
                      transition: transitions.fast
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: spacing.md,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: typography.fontSize['2xl'],
                      boxShadow: shadows.soft,
                      transition: transitions.fast
                    }}
                  >
                    ›
                  </button>

                  {/* Image Counter */}
                  <div style={{
                    position: 'absolute',
                    bottom: spacing.md,
                    right: spacing.md,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: colors.white,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium
                  }}>
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: spacing.xs
              }}>
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      paddingBottom: '100%',
                      position: 'relative',
                      backgroundColor: colors.pearl,
                      border: index === currentImageIndex ? `2px solid ${colors.gold}` : `1px solid ${colors.lightGray}`,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: transitions.fast
                    }}
                    onMouseEnter={(e) => {
                      if (index !== currentImageIndex) {
                        e.currentTarget.style.borderColor = colors.gold
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentImageIndex) {
                        e.currentTarget.style.borderColor = colors.lightGray
                      }
                    }}
                  >
                    <img 
                      src={getProductImageUrl(image.storage_path)}
                      alt={`${product.title} - Image ${index + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div>
            <h1 style={{ 
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.light,
              marginBottom: spacing.md,
              color: colors.darkGray,
              letterSpacing: '0.02em',
            }}>
              {product.title}
            </h1>

            <div style={{ 
              display: 'flex',
              gap: spacing.xs,
              marginBottom: spacing.lg,
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: `${spacing.xs} ${spacing.md}`,
                backgroundColor: colors.pearl,
                color: colors.gold,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                letterSpacing: '0.05em',
              }}>
                {product.pearl_type}
              </span>
              {product.size_mm && (
                <span style={{
                  padding: `${spacing.xs} ${spacing.md}`,
                  backgroundColor: colors.lightGray,
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                }}>
                  {product.size_mm}mm
                </span>
              )}
              <span style={{
                padding: `${spacing.xs} ${spacing.md}`,
                backgroundColor: product.availability === 'IN_STOCK' ? '#e8f5e9' : colors.champagne,
                color: product.availability === 'IN_STOCK' ? '#2e7d32' : colors.gold,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}>
                {product.availability === 'IN_STOCK' 
                  ? t('products', 'inStock') 
                  : t('products', 'preOrder')}
              </span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: spacing['2xl'] }}>
              {product.sell_price && (
                <div style={{ 
                  fontSize: typography.fontSize['5xl'],
                  fontWeight: typography.fontWeight.light,
                  color: colors.darkGray,
                  marginBottom: spacing.xs
                }}>
                  US$ {product.sell_price.toLocaleString()}
                </div>
              )}
              {product.original_price && product.original_price > (product.sell_price || 0) && (
                <div style={{ 
                  fontSize: typography.fontSize.lg,
                  color: colors.textLight,
                  textDecoration: 'line-through'
                }}>
                  {t('products', 'originalPrice')} US$ {product.original_price.toLocaleString()}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ 
                marginBottom: spacing['2xl'],
                padding: spacing.lg,
                backgroundColor: colors.pearl,
              }}>
                <h3 style={{ 
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.medium,
                  marginBottom: spacing.sm,
                  color: colors.darkGray
                }}>
                  {t('products', 'description')}
                </h3>
                <p style={{ 
                  color: colors.textSecondary,
                  lineHeight: typography.lineHeight.relaxed,
                  whiteSpace: 'pre-wrap'
                }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div style={{ 
              borderTop: `1px solid ${colors.lightGray}`,
              paddingTop: spacing.lg,
              marginBottom: spacing['2xl']
            }}>
              <h3 style={{ 
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.md,
                color: colors.darkGray
              }}>
                {t('products', 'specifications')}
              </h3>
              <table style={{ width: '100%' }}>
                <tbody>
                  {product.shape && (
                    <tr style={{ borderBottom: `1px solid ${colors.pearl}` }}>
                      <td style={{ 
                        padding: `${spacing.sm} 0`,
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.sm
                      }}>
                        {t('products', 'shape')}
                      </td>
                      <td style={{ 
                        padding: `${spacing.sm} 0`,
                        color: colors.darkGray,
                        fontWeight: typography.fontWeight.medium,
                        fontSize: typography.fontSize.sm
                      }}>
                        {product.shape}
                      </td>
                    </tr>
                  )}
                  {product.material && (
                    <tr style={{ borderBottom: `1px solid ${colors.pearl}` }}>
                      <td style={{ 
                        padding: `${spacing.sm} 0`,
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.sm
                      }}>
                        {t('products', 'material')}
                      </td>
                      <td style={{ 
                        padding: `${spacing.sm} 0`,
                        color: colors.darkGray,
                        fontWeight: typography.fontWeight.medium,
                        fontSize: typography.fontSize.sm
                      }}>
                        {product.material}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: `1px solid ${colors.pearl}` }}>
                    <td style={{ 
                      padding: `${spacing.sm} 0`,
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.sm
                    }}>
                      {t('products', 'productCode')}
                    </td>
                    <td style={{ 
                      padding: `${spacing.sm} 0`,
                      color: colors.darkGray,
                      fontFamily: 'monospace',
                      fontSize: typography.fontSize.sm
                    }}>
                      {product.slug}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Preorder Note */}
            {product.availability === 'PREORDER' && product.preorder_note && (
              <div style={{ 
                padding: spacing.md,
                backgroundColor: colors.champagne,
                border: `1px solid ${colors.gold}`,
                marginBottom: spacing['2xl']
              }}>
                <strong style={{ color: colors.gold }}>{t('products', 'preorderNote')}:</strong>
                <span style={{ color: colors.textSecondary, marginLeft: spacing.xs }}>
                  {product.preorder_note}
                </span>
              </div>
            )}

            {/* Contact CTA */}
            <div style={{ 
              padding: spacing.lg,
              backgroundColor: colors.pearl,
              textAlign: 'center'
            }}>
              <p style={{ 
                color: colors.darkGray,
                marginBottom: spacing.xs,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.lg,
              }}>
                {t('products', 'interested')}
              </p>
              <p style={{ 
                color: colors.textSecondary,
                fontSize: typography.fontSize.sm
              }}>
                {t('products', 'contactUs')}
              </p>
            </div>
          </div>
        </div>

        {/* Back to list */}
        <div style={{ marginTop: spacing['3xl'], textAlign: 'center' }}>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: `${spacing.md} ${spacing['2xl']}`,
              backgroundColor: colors.white,
              color: colors.darkGray,
              border: `1px solid ${colors.darkGray}`,
              textDecoration: 'none',
              fontWeight: typography.fontWeight.medium,
              fontSize: typography.fontSize.base,
              letterSpacing: '0.05em',
              transition: transitions.normal,
            }}
          >
            {t('products', 'browseMore')}
          </Link>
        </div>
      </div>
    </main>
  )
}
