'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import ImageZoom from '../../components/ImageZoom'
import ProductInquiryModal from '../../components/ProductInquiryModal'
import { useCart } from '../../components/CartProvider'
import { getProductImageUrl, getProductVideoUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import { colors, typography, spacing, transitions, shadows } from '../../constants/design'

interface ProductDetailClientProps {
  product: CatalogProduct
  images: ProductImage[]
  videos: ProductVideo[]
}

type GalleryItem =
  | { kind: 'image'; id: string; image: ProductImage }
  | { kind: 'video'; id: string; video: ProductVideo }

export default function ProductDetailClient({ product, images, videos }: ProductDetailClientProps) {
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [cartNotice, setCartNotice] = useState<string | null>(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [liveAvailability, setLiveAvailability] = useState(product.availability)
  const { addItem } = useCart()
  const effectiveAvailability = liveAvailability
  const descriptionParagraphs = (product.description || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const shortDescription = descriptionParagraphs[0] || null
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
  const orderedImages = images.length > 0
    ? [...images].sort((a, b) => {
        if (a.is_primary === b.is_primary) return 0
        return a.is_primary ? -1 : 1
      })
    : []
  const galleryItems: GalleryItem[] = [
    ...orderedImages.map((image) => ({ kind: 'image' as const, id: image.id, image })),
    ...videos.map((video) => ({ kind: 'video' as const, id: video.id, video })),
  ]
  const hasGallery = galleryItems.length > 0
  const currentGalleryItem = hasGallery ? galleryItems[currentGalleryIndex] || galleryItems[0] : null
  const currentImage =
    currentGalleryItem?.kind === 'image'
      ? currentGalleryItem.image
      : orderedImages[0] || null
  const firstImage = orderedImages[0] || null

  useEffect(() => {
    let cancelled = false

    const loadAvailability = async () => {
      try {
        const response = await fetch(`/api/products/${product.id}/availability`, {
          cache: 'no-store',
        })
        if (!response.ok) return
        const data = await response.json()
        if (!cancelled && data?.availability) {
          setLiveAvailability(data.availability)
        }
      } catch {
        // Keep server-rendered availability if live refresh fails.
      }
    }

    void loadAvailability()

    return () => {
      cancelled = true
    }
  }, [product.id])

  const nextImage = () => {
    if (!hasGallery) return
    setCurrentGalleryIndex((prev) => (prev + 1) % galleryItems.length)
  }

  const prevImage = () => {
    if (!hasGallery) return
    setCurrentGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const handleAddToCart = () => {
    if (effectiveAvailability === 'OUT_OF_STOCK') return
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      imageUrl: currentImage ? getProductImageUrl(currentImage.storage_path) : null,
      pearlType: product.pearl_type || null,
      sizeMm: product.size_mm || null,
      price: product.sell_price || null,
      availability: effectiveAvailability,
    })
    setCartNotice('Added to cart')
    setTimeout(() => setCartNotice(null), 1800)
  }

  const specRowStyle: CSSProperties = { borderBottom: `1px solid ${colors.pearl}` }
  const specLabelCellStyle: CSSProperties = {
    padding: `${spacing.xs} 0`,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  }
  const specValueCellStyle: CSSProperties = {
    padding: `${spacing.xs} 0`,
    color: colors.darkGray,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.sm,
  }
  const specCodeValueCellStyle: CSSProperties = {
    ...specValueCellStyle,
    fontFamily: 'monospace',
    fontWeight: typography.fontWeight.normal,
  }

  const renderSpecRow = (label: string, value: ReactNode, valueStyle: CSSProperties = specValueCellStyle) => (
    <tr style={specRowStyle}>
      <td style={specLabelCellStyle}>{label}</td>
      <td style={valueStyle}>{value}</td>
    </tr>
  )
  const editorsPickBadgeStyle: CSSProperties = {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 2,
    padding: `${spacing.xs} ${spacing.sm}`,
    background: 'rgba(255, 252, 246, 0.94)',
    border: '1px solid rgba(201, 169, 97, 0.34)',
    color: colors.darkGray,
    fontSize: typography.fontSize.xs,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    boxShadow: shadows.soft,
  }

  return (
    <main style={{ 
      minHeight: '100vh',
      backgroundColor: colors.white,
      padding: `clamp(1rem, 3vw, ${spacing['3xl']})`,
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing['3xl'],
          backgroundColor: colors.white,
        }}>
          {/* Images Section */}
          <div>
            {/* Main Image with Navigation */}
            <div style={{ position: 'relative', marginBottom: spacing.md }}>
              <div style={{
                width: '100%',
                paddingBottom: '133.333%',
                position: 'relative',
                backgroundColor: colors.pearl,
                overflow: 'hidden'
              }}>
                {product.editors_pick && (
                  <div style={editorsPickBadgeStyle}>Editor&apos;s Pick</div>
                )}
                {currentGalleryItem?.kind === 'video' ? (
                  <video
                    src={getProductVideoUrl(currentGalleryItem.video.storage_path)}
                    controls
                    preload="metadata"
                    poster={firstImage ? getProductImageUrl(firstImage.storage_path) : undefined}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      backgroundColor: colors.pearl,
                    }}
                  />
                ) : currentImage ? (
                    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                      <ImageZoom
                        src={getProductImageUrl(currentImage.storage_path)}
                        alt={`${product.pearl_type || 'Pearl'} ${categoryLabels[product.category || ''] || 'Jewelry'} - ${product.title}`}
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
              {galleryItems.length > 1 && (
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
                    {currentGalleryIndex + 1} / {galleryItems.length}
                  </div>
                </>
              )}
            </div>

            <p
              style={{
                margin: `0 0 ${spacing.md}`,
                color: colors.textLight,
                fontSize: typography.fontSize.sm,
                lineHeight: 1.6,
                letterSpacing: '0.02em',
              }}
            >
              Shown in different lighting to reflect natural luster
            </p>

            {/* Image Thumbnails */}
            {galleryItems.length > 1 && (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: spacing.xs
              }}>
                {galleryItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentGalleryIndex(index)}
                    style={{
                      paddingBottom: '100%',
                      position: 'relative',
                      backgroundColor: colors.pearl,
                      border: index === currentGalleryIndex ? `2px solid ${colors.gold}` : `1px solid ${colors.lightGray}`,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: transitions.fast
                    }}
                    onMouseEnter={(e) => {
                      if (index !== currentGalleryIndex) {
                        e.currentTarget.style.borderColor = colors.gold
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentGalleryIndex) {
                        e.currentTarget.style.borderColor = colors.lightGray
                      }
                    }}
                  >
                    {item.kind === 'image' ? (
                      <img 
                        src={getProductImageUrl(item.image.storage_path)}
                        alt={`${product.pearl_type || 'Pearl'} ${categoryLabels[product.category || ''] || 'Jewelry'} detail view ${index + 1} - ${product.title}`}
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
                      <>
                        <video
                          src={getProductVideoUrl(item.video.storage_path)}
                          preload="metadata"
                          muted
                          playsInline
                          poster={firstImage ? getProductImageUrl(firstImage.storage_path) : undefined}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(20, 20, 20, 0.18)',
                            color: colors.white,
                            fontSize: '1.5rem',
                          }}
                        >
                          ▶
                        </div>
                      </>
                    )}
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
              <span style={{
                padding: `${spacing.xs} ${spacing.md}`,
                backgroundColor:
                  effectiveAvailability === 'IN_STOCK' ? '#e8f5e9' : effectiveAvailability === 'OUT_OF_STOCK' ? '#f5efe6' : colors.champagne,
                color:
                  effectiveAvailability === 'IN_STOCK' ? '#2e7d32' : effectiveAvailability === 'OUT_OF_STOCK' ? '#76624c' : colors.gold,
                border: effectiveAvailability === 'OUT_OF_STOCK' ? '1px solid rgba(196, 173, 145, 0.4)' : 'none',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}>
                {effectiveAvailability === 'IN_STOCK' ? 'In Stock' : effectiveAvailability === 'OUT_OF_STOCK' ? 'Sold Out' : 'Pre-order'}
              </span>
            </div>
            {/* Price */}
            <div style={{ marginBottom: spacing.md }}>
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

            {shortDescription && (
              <div
                style={{
                  marginBottom: spacing.lg,
                  padding: `${spacing.md} ${spacing.lg}`,
                  background: '#fbf8f2',
                  border: '1px solid #e5dccb',
                  borderRadius: '14px',
                }}
              >
                <h3
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    marginBottom: spacing.xs,
                    color: colors.darkGray,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  At a Glance
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    lineHeight: 1.8,
                  }}
                >
                  {shortDescription}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div style={{ 
              borderTop: `1px solid ${colors.lightGray}`,
              paddingTop: spacing.xs,
              marginBottom: spacing.xl
            }}>
              <h3 style={{ 
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.sm,
                color: colors.darkGray
              }}>
                Specifications
              </h3>
              <p
                style={{
                  margin: `0 0 ${spacing.sm}`,
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.8,
                }}
              >
                Each pair is carefully matched for luster, tone, and proportion — the details that define how pearls look on the skin.
              </p>
              <table style={{ width: '100%' }}>
                <tbody>
                  {renderSpecRow('Pearl Type', product.pearl_type)}
                  {product.category && (
                    renderSpecRow('Category', categoryLabels[product.category] || product.category)
                  )}
                  {product.size_mm && (
                    renderSpecRow('Size', `${product.size_mm}mm`)
                  )}
                  {product.shape && (
                    renderSpecRow('Shape', product.shape)
                  )}
                  {product.material && (
                    renderSpecRow('Material', product.material)
                  )}
                  {renderSpecRow('Product Code', product.slug, specCodeValueCellStyle)}
                </tbody>
              </table>
              <div
                style={{
                  marginTop: spacing.lg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.md,
                  flexWrap: 'wrap',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.sm,
                    lineHeight: 1.7,
                    flex: '1 1 240px',
                    textAlign: 'left',
                  }}
                >
                  * Free shipping on orders over $200.
                  <br />
                  * Need help choosing? We&apos;re happy to guide you.
                </p>
                <button
                  onClick={handleAddToCart}
                  disabled={effectiveAvailability === 'OUT_OF_STOCK'}
                  style={{
                    marginLeft: 'auto',
                    padding: `${spacing.md} ${spacing.xl}`,
                    backgroundColor:
                      effectiveAvailability === 'OUT_OF_STOCK' ? '#b4a28e' : colors.darkGray,
                    color: colors.white,
                    border: `1px solid ${
                      effectiveAvailability === 'OUT_OF_STOCK' ? '#b4a28e' : colors.darkGray
                    }`,
                    borderRadius: '999px',
                    fontWeight: typography.fontWeight.medium,
                    fontSize: typography.fontSize.sm,
                    letterSpacing: '0.04em',
                    cursor: effectiveAvailability === 'OUT_OF_STOCK' ? 'not-allowed' : 'pointer',
                    boxShadow: shadows.soft,
                    transition: transitions.fast,
                  }}
                >
                  {effectiveAvailability === 'OUT_OF_STOCK' ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            </div>

            <div
              style={{
                padding: `${spacing.lg} ${spacing.xl}`,
                background: 'linear-gradient(135deg, #fffdf8 0%, #faf6ee 100%)',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                borderRadius: '16px',
                boxShadow: '0 10px 24px rgba(45, 36, 24, 0.05)',
                marginBottom: spacing['2xl'],
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: colors.gold,
                  fontSize: typography.fontSize.xs,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                The 33 Pearl Atelier Standard
              </p>
              <ul
                style={{
                  margin: `${spacing.md} 0 0`,
                  paddingLeft: '1.2rem',
                  color: colors.textSecondary,
                  lineHeight: 1.9,
                }}
              >
                <li>You receive the exact pair shown</li>
                <li>Hand-selected by a GIA-certified gemologist</li>
                <li>Small-batch production</li>
                <li>Complimentary cleaning and maintenance</li>
              </ul>
            </div>

            {/* Preorder Note */}
            {effectiveAvailability === 'PREORDER' && product.preorder_note && (
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
          </div>
        </div>

        {/* Description and CTA below image/specifications */}
        <section style={{ marginTop: spacing.lg }}>
            {product.description && (
              <div
                style={{
                  marginBottom: spacing['2xl'],
                  padding: `${spacing.lg} ${spacing.xl}`,
                  backgroundColor: '#fbf8f2',
                  border: `1px solid #e5dccb`,
                  borderRadius: '14px',
                  boxShadow: '0 10px 24px rgba(45, 36, 24, 0.06)',
                }}
              >
                <h3
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.medium,
                    marginBottom: spacing.sm,
                    color: colors.darkGray,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
                  }}
                >
                  Description
                </h3>
                <p
                  style={{
                    color: colors.textSecondary,
                    lineHeight: 1.9,
                    whiteSpace: 'pre-wrap',
                    fontSize: typography.fontSize.base,
                    fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
                    letterSpacing: '0.02em',
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}

            <div
              style={{
                padding: `${spacing.lg} ${spacing.xl}`,
                backgroundColor: '#fffdf9',
                borderTop: `1px solid ${colors.lightGray}`,
                borderBottom: `1px solid ${colors.lightGray}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.lg,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: '260px', flex: 1 }}>
                <p
                  style={{
                    color: colors.darkGray,
                    marginBottom: spacing.xs,
                    fontWeight: typography.fontWeight.medium,
                    fontSize: typography.fontSize.lg,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Interested in this piece?
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.base,
                    lineHeight: 1.7,
                  }}
                >
                  Add it to your cart to continue to secure checkout, or contact us for personal guidance before ordering.
                </p>
              </div>
              <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setInquiryOpen(true)}
                  style={{
                    padding: `${spacing.md} ${spacing.xl}`,
                    backgroundColor: colors.gold,
                    color: colors.white,
                    border: `1px solid ${colors.gold}`,
                    borderRadius: '999px',
                    fontWeight: typography.fontWeight.medium,
                    fontSize: typography.fontSize.sm,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: shadows.soft,
                    transition: transitions.fast,
                  }}
                >
                  Inquire About This Product
                </button>
              </div>
            </div>
            {cartNotice && (
              <div style={{ marginTop: spacing.sm, color: '#2e7d32', fontSize: typography.fontSize.sm }}>
                {cartNotice}
              </div>
            )}
        </section>

        <ProductInquiryModal
          open={inquiryOpen}
          onClose={() => setInquiryOpen(false)}
          productTitle={product.title}
          productSlug={product.slug}
        />

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
