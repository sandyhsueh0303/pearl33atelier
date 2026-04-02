'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
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
  const productWithPearlDetails = product as CatalogProduct & {
    luster?: string | null
    overtone?: string | null
  }
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [cartNotice, setCartNotice] = useState<string | null>(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [liveAvailability, setLiveAvailability] = useState(product.availability)
  const [isPearlDetailsOpen, setIsPearlDetailsOpen] = useState(false)
  const [isCareOpen, setIsCareOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { addItem } = useCart()
  const effectiveAvailability = liveAvailability
  const descriptionParagraphs = (product.description || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const shortDescription = descriptionParagraphs[0] || null
  const lifestyleHook =
    'A soft, luminous glow that makes you look effortlessly put together.'
  const normalizeSectionHeading = (value: string) =>
    value.replace(/['’]/g, '').replace(/\s+/g, ' ').trim().toUpperCase()
  const whyHeading = 'WHY YOULL LOVE IT'
  const perfectForHeading = 'PERFECT FOR'
  const whyHeadingIndex = descriptionParagraphs.findIndex(
    (paragraph) => normalizeSectionHeading(paragraph) === whyHeading
  )
  const perfectForHeadingIndex = descriptionParagraphs.findIndex(
    (paragraph) => normalizeSectionHeading(paragraph) === perfectForHeading
  )
  const explicitWhyLoveCopy =
    whyHeadingIndex >= 0
      ? descriptionParagraphs
          .slice(
            whyHeadingIndex + 1,
            perfectForHeadingIndex > whyHeadingIndex ? perfectForHeadingIndex : undefined
          )
          .join('\n')
      : ''
  const explicitPerfectForCopy =
    perfectForHeadingIndex >= 0
      ? descriptionParagraphs.slice(perfectForHeadingIndex + 1).join('\n')
      : ''
  const fallbackWhyLoveCopy =
    whyHeadingIndex === -1 && perfectForHeadingIndex === -1 ? descriptionParagraphs[0] || '' : ''
  const fallbackPerfectForCopy =
    whyHeadingIndex === -1 && perfectForHeadingIndex === -1
      ? descriptionParagraphs.slice(1).join('\n\n')
      : ''
  const whyLoveCopy = explicitWhyLoveCopy || fallbackWhyLoveCopy || lifestyleHook
  const perfectForCopy =
    explicitPerfectForCopy ||
    fallbackPerfectForCopy ||
    '• Everyday office wear\n• An effortless polished look\n• Weddings, dinners, and special occasions'
  const careServiceCopy =
    effectiveAvailability === 'PREORDER' && product.preorder_note
      ? product.preorder_note
      : 'Made for everyday wear, with care guidance whenever you need it.'
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

  const selectGalleryItem = (index: number) => {
    const item = galleryItems[index]
    setCurrentGalleryIndex(index)

    if (item?.kind === 'video') {
      window.requestAnimationFrame(() => {
        void videoRef.current?.play().catch(() => {
          // Keep controls visible if autoplay is blocked for any reason.
        })
      })
    }
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
  const formatPearlTypeLabel = (value: string) =>
    value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
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
                    ref={videoRef}
                    src={getProductVideoUrl(currentGalleryItem.video.storage_path)}
                    controls
                    preload="metadata"
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
              Shown in natural light to reveal the pearl&apos;s true luster.
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
                    onClick={() => selectGalleryItem(index)}
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
              marginBottom: spacing.sm,
              color: colors.darkGray,
              letterSpacing: '0.02em',
            }}>
              {product.title}
            </h1>

            <div style={{ marginBottom: spacing.lg }}>
              <p
                style={{
                  margin: 0,
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.8,
                  letterSpacing: '0.02em',
                }}
              >
                {[
                  formatPearlTypeLabel(product.pearl_type),
                  product.size_mm ? `${product.size_mm}mm` : null,
                  productWithPearlDetails.luster ? `Luster: ${productWithPearlDetails.luster}` : null,
                  productWithPearlDetails.overtone ? `overtone: ${productWithPearlDetails.overtone}` : null,
                ]
                  .filter(Boolean)
                  .join('｜')}
              </p>
              <p
                style={{
                  margin: `${spacing.xs} 0 0`,
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.base,
                  lineHeight: 1.8,
                }}
              >
                {lifestyleHook}
              </p>
            </div>
            <div style={{ 
              display: 'flex',
              gap: spacing.xs,
              marginBottom: spacing.lg,
              flexWrap: 'wrap'
            }}>
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.md,
                flexWrap: 'wrap',
                marginBottom: spacing.xl,
              }}
            >
              <div style={{ display: 'grid', gap: '0.2rem' }}>
                {product.sell_price && (
                  <div style={{ 
                    fontSize: typography.fontSize['5xl'],
                    fontWeight: typography.fontWeight.light,
                    color: colors.darkGray,
                    lineHeight: 1
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

              <button
                onClick={handleAddToCart}
                disabled={effectiveAvailability === 'OUT_OF_STOCK'}
                style={{
                  minWidth: '168px',
                  padding: `${spacing.sm} ${spacing.lg}`,
                  backgroundColor:
                    effectiveAvailability === 'OUT_OF_STOCK' ? '#d7cbbd' : '#f6efe3',
                  color: effectiveAvailability === 'OUT_OF_STOCK' ? '#7b6a58' : colors.darkGray,
                  border: `1px solid ${
                    effectiveAvailability === 'OUT_OF_STOCK' ? '#d7cbbd' : '#d8c7ae'
                  }`,
                  borderRadius: '999px',
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.sm,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: effectiveAvailability === 'OUT_OF_STOCK' ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 24px rgba(110, 89, 52, 0.10)',
                  transition: transitions.fast,
                }}
              >
                {effectiveAvailability === 'OUT_OF_STOCK' ? 'Sold Out' : 'Add to Bag'}
              </button>
            </div>

            {cartNotice && (
              <div
                style={{
                  marginTop: `-${spacing.md}`,
                  marginBottom: spacing.sm,
                  color: '#2e7d32',
                  fontSize: typography.fontSize.sm,
                }}
              >
                {cartNotice}
              </div>
            )}

            <p
              style={{
                margin: `0 0 ${spacing.lg}`,
                color: colors.textLight,
                fontSize: typography.fontSize.sm,
                lineHeight: 1.7,
              }}
            >
              Each pearl is naturally unique, and only a few pieces are available.
            </p>

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
                Why You&apos;ll Love It ⭐
              </h3>
              <p
                style={{
                  margin: 0,
                  color: colors.textSecondary,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {whyLoveCopy}
              </p>
              <div style={{ marginTop: spacing.md }}>
                <p
                  style={{
                    margin: `0 0 ${spacing.xs}`,
                    color: colors.darkGray,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Perfect For
                </p>
                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    lineHeight: 1.9,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {perfectForCopy}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div style={{ 
              borderTop: `1px solid ${colors.lightGray}`,
              paddingTop: spacing.xs,
              marginBottom: spacing.xl
            }}>
              <button
                type="button"
                onClick={() => setIsPearlDetailsOpen((prev) => !prev)}
                aria-expanded={isPearlDetailsOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.md,
                  background: 'transparent',
                  border: 'none',
                  padding: `${spacing.xs} 0`,
                  cursor: 'pointer',
                  color: colors.darkGray,
                }}
              >
                <span style={{ 
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  Product Details
                </span>
                <span style={{ fontSize: typography.fontSize.lg, color: colors.textLight }}>
                  {isPearlDetailsOpen ? '−' : '+'}
                </span>
              </button>
              {isPearlDetailsOpen && (
                <>
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
                      {productWithPearlDetails.luster && (
                        renderSpecRow('Luster', productWithPearlDetails.luster)
                      )}
                      {productWithPearlDetails.overtone && (
                        renderSpecRow('Overtone', productWithPearlDetails.overtone)
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
                </>
              )}
            </div>

            <div
              style={{
                borderTop: `1px solid ${colors.lightGray}`,
                paddingTop: spacing.xs,
                marginBottom: spacing['2xl'],
              }}
            >
              <button
                type="button"
                onClick={() => setIsCareOpen((prev) => !prev)}
                aria-expanded={isCareOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.md,
                  background: 'transparent',
                  border: 'none',
                  padding: `${spacing.xs} 0`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  margin: 0,
                  color: colors.darkGray,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                <span>Care</span>
                <span style={{ fontSize: typography.fontSize.lg, color: colors.textLight }}>
                  {isCareOpen ? '−' : '+'}
                </span>
              </button>
              {isCareOpen && (
                <>
                  <p
                    style={{
                      margin: `${spacing.sm} 0 0`,
                      color: colors.textSecondary,
                      lineHeight: 1.9,
                    }}
                  >
                    {careServiceCopy}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: spacing.sm,
                      flexWrap: 'wrap',
                      marginTop: spacing.md,
                    }}
                  >
                    <button
                      onClick={() => setInquiryOpen(true)}
                      style={{
                        minWidth: '168px',
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: '#f6efe3',
                        color: colors.darkGray,
                        border: '1px solid #d8c7ae',
                        borderRadius: '999px',
                        fontWeight: typography.fontWeight.medium,
                        fontSize: typography.fontSize.sm,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 10px 24px rgba(110, 89, 52, 0.10)',
                        transition: transitions.fast,
                      }}
                    >
                      Ask About This Piece
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

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
