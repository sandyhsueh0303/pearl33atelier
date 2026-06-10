'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import ImageZoom from '../../components/ImageZoom'
import ProductInquiryModal from '../../components/ProductInquiryModal'
import { useCart } from '../../components/CartProvider'
import { getProductImageUrl, getProductVideoUrl } from '@pearl33atelier/shared'
import type { CatalogProduct, ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import styles from './ProductDetailClient.module.css'

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

  const renderSpecRow = (label: string, value: ReactNode, isCode = false) => (
    <tr className={styles.specRow}>
      <td className={styles.specLabelCell}>{label}</td>
      <td className={isCode ? styles.specCodeValueCell : styles.specValueCell}>{value}</td>
    </tr>
  )
  const formatPearlTypeLabel = (value: string) =>
    value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
  const availabilityClassName =
    effectiveAvailability === 'IN_STOCK'
      ? styles.availabilityInStock
      : effectiveAvailability === 'OUT_OF_STOCK'
        ? styles.availabilitySoldOut
        : styles.availabilityPreorder
  const actionButtonClassName =
    effectiveAvailability === 'OUT_OF_STOCK'
      ? `${styles.pillButton} ${styles.pillButtonDisabled}`
      : styles.pillButton

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link 
            href="/products"
            className={styles.breadcrumbLink}
          >
            ← Back to Products
          </Link>
        </div>

        <div className={styles.productLayout}>
          {/* Images Section */}
          <div>
            {/* Main Image with Navigation */}
            <div className={styles.galleryStage}>
              <div className={styles.mainMediaFrame}>
                {product.editors_pick && (
                  <div className={styles.editorsPickBadge}>Editor&apos;s Pick</div>
                )}
                {currentGalleryItem?.kind === 'video' ? (
                  <video
                    ref={videoRef}
                    src={getProductVideoUrl(currentGalleryItem.video.storage_path)}
                    controls
                    preload="metadata"
                    className={styles.mainMedia}
                  />
                ) : currentImage ? (
                    <div className={styles.zoomFrame}>
                      <ImageZoom
                        src={getProductImageUrl(currentImage.storage_path)}
                        alt={`${product.pearl_type || 'Pearl'} ${categoryLabels[product.category || ''] || 'Jewelry'} - ${product.title}`}
                        zoomScale={2.2}
                      />
                    </div>
                ) : (
                  <div className={styles.emptyMedia}>
                    <span className={styles.emptyMediaIcon}>✦</span>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {galleryItems.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className={`${styles.galleryArrow} ${styles.galleryArrowPrevious}`}
                    aria-label="Previous media"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className={`${styles.galleryArrow} ${styles.galleryArrowNext}`}
                    aria-label="Next media"
                  >
                    ›
                  </button>

                  {/* Image Counter */}
                  <div className={styles.galleryCounter}>
                    {currentGalleryIndex + 1} / {galleryItems.length}
                  </div>
                </>
              )}
            </div>

            <p className={styles.galleryNote}>
              Shown in natural light to reveal the pearl&apos;s true luster.
            </p>

            {/* Image Thumbnails */}
            {galleryItems.length > 1 && (
              <div className={styles.thumbnailGrid}>
                {galleryItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => selectGalleryItem(index)}
                    className={`${styles.thumbnail} ${
                      index === currentGalleryIndex ? styles.thumbnailActive : ''
                    }`}
                  >
                    {item.kind === 'image' ? (
                      <img 
                        src={getProductImageUrl(item.image.storage_path)}
                        alt={`${product.pearl_type || 'Pearl'} ${categoryLabels[product.category || ''] || 'Jewelry'} detail view ${index + 1} - ${product.title}`}
                        className={styles.thumbnailMedia}
                      />
                    ) : (
                      <>
                        <video
                          src={getProductVideoUrl(item.video.storage_path)}
                          preload="metadata"
                          muted
                          playsInline
                          className={styles.thumbnailMedia}
                        />
                        <div className={styles.videoPlayBadge}>
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
            <h1 className={styles.productTitle}>
              {product.title}
            </h1>

            <div className={styles.productSummary}>
              <p className={styles.productMeta}>
                {[
                  formatPearlTypeLabel(product.pearl_type),
                  product.size_mm ? `${product.size_mm}mm` : null,
                  productWithPearlDetails.luster ? `Luster: ${productWithPearlDetails.luster}` : null,
                  productWithPearlDetails.overtone ? `overtone: ${productWithPearlDetails.overtone}` : null,
                ]
                  .filter(Boolean)
                  .join('｜')}
              </p>
              <p className={styles.lifestyleHook}>
                {lifestyleHook}
              </p>
            </div>
            <div className={styles.availabilityRow}>
              <span className={`${styles.availabilityBadge} ${availabilityClassName}`}>
                {effectiveAvailability === 'IN_STOCK' ? 'In Stock' : effectiveAvailability === 'OUT_OF_STOCK' ? 'Sold Out' : 'Pre-order'}
              </span>
            </div>
            <div className={styles.purchaseRow}>
              <div className={styles.priceStack}>
                {product.sell_price && (
                  <div className={styles.currentPrice}>
                    $ {product.sell_price.toLocaleString()}
                  </div>
                )}
                {product.original_price && product.original_price > (product.sell_price || 0) && (
                  <div className={styles.originalPrice}>
                    Original Price $ {product.original_price.toLocaleString()}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={effectiveAvailability === 'OUT_OF_STOCK'}
                className={actionButtonClassName}
              >
                {effectiveAvailability === 'OUT_OF_STOCK' ? 'Sold Out' : 'Add to Bag'}
              </button>
            </div>

            {cartNotice && (
              <div className={styles.cartNotice}>
                {cartNotice}
              </div>
            )}

            <p className={styles.limitedCopy}>
              Each pearl is naturally unique, and only a few pieces are available.
            </p>

            <div className={styles.copyCard}>
              <h3 className={styles.copyCardTitle}>
                Why You&apos;ll Love It ⭐
              </h3>
              <p className={styles.copyCardText}>
                {whyLoveCopy}
              </p>
              <div className={styles.copyCardSection}>
                <p className={styles.copyCardSubheading}>
                  Perfect For
                </p>
                <p className={styles.copyCardText}>
                  {perfectForCopy}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div className={styles.accordionBlock}>
              <button
                type="button"
                onClick={() => setIsPearlDetailsOpen((prev) => !prev)}
                aria-expanded={isPearlDetailsOpen}
                className={styles.accordionButton}
              >
                <span className={styles.accordionTitle}>
                  Product Details
                </span>
                <span className={styles.accordionIcon}>
                  {isPearlDetailsOpen ? '−' : '+'}
                </span>
              </button>
              {isPearlDetailsOpen && (
                <>
                  <p className={styles.accordionCopy}>
                    Each pair is carefully matched for luster, tone, and proportion — the details that define how pearls look on the skin.
                  </p>
                  <table className={styles.specTable}>
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
                      {renderSpecRow('Product Code', product.slug, true)}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className={`${styles.accordionBlock} ${styles.careBlock}`}>
              <button
                type="button"
                onClick={() => setIsCareOpen((prev) => !prev)}
                aria-expanded={isCareOpen}
                className={styles.accordionButton}
              >
                <span className={styles.accordionTitle}>Care</span>
                <span className={styles.accordionIcon}>
                  {isCareOpen ? '−' : '+'}
                </span>
              </button>
              {isCareOpen && (
                <>
                  <p className={styles.careCopy}>
                    {careServiceCopy}
                  </p>
                  <div className={styles.careActions}>
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className={styles.pillButton}
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
        <div className={styles.backToList}>
          <Link
            href="/products"
            className={styles.browseMoreLink}
          >
            Browse More Products
          </Link>
        </div>
      </div>
    </main>
  )
}
