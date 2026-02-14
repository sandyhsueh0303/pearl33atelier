'use client'

import { useState } from 'react'
import ImageZoom from '../../components/ImageZoom'
import ProductInquiryModal from '../../components/ProductInquiryModal'
import { getProductImageUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import { colors, typography, spacing, transitions, shadows } from '../../constants/design'

interface ProductDetailClientProps {
  product: CatalogProduct
  images: ProductImage[]
}

export default function ProductDetailClient({ product, images }: ProductDetailClientProps) {
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const categoryLabels: Record<string, string> = {
    BRACELETS: 'Bracelets',
    NECKLACES: 'Necklaces',
    EARRINGS: 'Earrings',
    STUDS: 'Studs',
    RINGS: 'Rings',
    PENDANTS: 'Pendants',
    LOOSE_PEARLS: 'Loose Pearls',
    BROOCHES: 'Brooches',
  }
  
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
            ← Back to Products
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
                    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                      <ImageZoom
                        src={getProductImageUrl(currentImage.storage_path)}
                        alt={product.title}
                        zoomScale={2.2}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
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
              {product.category && (
                <span style={{
                  padding: `${spacing.xs} ${spacing.md}`,
                  backgroundColor: '#f3e5f5',
                  color: colors.darkGray,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  {categoryLabels[product.category] || product.category}
                </span>
              )}
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
                {product.availability === 'IN_STOCK' ? 'In Stock' : 'Pre-order'}
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
                  $ {product.sell_price.toLocaleString()}
                </div>
              )}
              {product.original_price && product.original_price > (product.sell_price || 0) && (
                <div style={{ 
                  fontSize: typography.fontSize.lg,
                  color: colors.textLight,
                  textDecoration: 'line-through'
                }}>
                  Original Price $ {product.original_price.toLocaleString()}
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
                  Description
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
                Specifications
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
                        Shape
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
                        Material
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
                      Product Code
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
                <strong style={{ color: colors.gold }}>Pre-order Note:</strong>
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
                Interested in this item?
              </p>
              <p style={{ 
                color: colors.textSecondary,
                fontSize: typography.fontSize.sm,
                marginBottom: spacing.md
              }}>
                Contact us to learn more or ask about this product.
              </p>
              <button
                onClick={() => setInquiryOpen(true)}
                style={{
                  padding: `${spacing.md} ${spacing.xl}`,
                  backgroundColor: colors.gold,
                  color: colors.white,
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.base,
                  cursor: 'pointer',
                  boxShadow: shadows.soft,
                  transition: transitions.fast
                }}
              >
                Inquire About This Product
              </button>
              <ProductInquiryModal
                open={inquiryOpen}
                onClose={() => setInquiryOpen(false)}
                productTitle={product.title}
                productSlug={product.slug}
              />
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
            Browse More Products
          </Link>
        </div>
      </div>
    </main>
  )
}
