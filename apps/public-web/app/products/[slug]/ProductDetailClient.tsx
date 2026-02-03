'use client'

import { useState } from 'react'
import { getProductImageUrl } from '@33pearlatelier/shared'
import type { CatalogProduct, ProductImage } from '@33pearlatelier/shared/types'
import Link from 'next/link'

interface ProductDetailClientProps {
  product: CatalogProduct
  images: ProductImage[]
}

export default function ProductDetailClient({ product, images }: ProductDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
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
      backgroundColor: '#fafafa',
      padding: '2rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            href="/products"
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            ← Back to Products
          </Link>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Images Section */}
          <div>
            {/* Main Image with Navigation */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{
                width: '100%',
                paddingBottom: '100%',
                position: 'relative',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
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
                      borderRadius: '8px'
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
                    color: '#ccc'
                  }}>
                    <span style={{ fontSize: '4rem' }}>📷</span>
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
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    }}
                  >
                    ›
                  </button>

                  {/* Image Counter */}
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
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
                gap: '0.5rem'
              }}>
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      paddingBottom: '100%',
                      position: 'relative',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      border: index === currentImageIndex ? '3px solid #1976d2' : '1px solid #ddd',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (index !== currentImageIndex) {
                        e.currentTarget.style.borderColor = '#1976d2'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentImageIndex) {
                        e.currentTarget.style.borderColor = '#ddd'
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
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#333'
            }}>
              {product.title}
            </h1>

            <div style={{ 
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {product.pearl_type}
              </span>
              {product.size_mm && (
                <span style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {product.size_mm}mm
                </span>
              )}
              <span style={{
                padding: '0.5rem 1rem',
                backgroundColor: product.availability === 'IN_STOCK' ? '#e8f5e9' : '#fff3e0',
                color: product.availability === 'IN_STOCK' ? '#2e7d32' : '#ef6c00',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                {product.availability === 'IN_STOCK' ? 'In Stock' : 'Pre-order'}
              </span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '2rem' }}>
              {product.sell_price && (
                <div style={{ 
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1976d2',
                  marginBottom: '0.25rem'
                }}>
                  US$ {product.sell_price.toLocaleString()}
                </div>
              )}
              {product.original_price && product.original_price > (product.sell_price || 0) && (
                <div style={{ 
                  fontSize: '1.125rem',
                  color: '#999',
                  textDecoration: 'line-through'
                }}>
                  Original Price US$ {product.original_price.toLocaleString()}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ 
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: '#fafafa',
                borderRadius: '8px'
              }}>
                <h3 style={{ 
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: '#333'
                }}>
                  Description
                </h3>
                <p style={{ 
                  color: '#666',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div style={{ 
              borderTop: '1px solid #eee',
              paddingTop: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#333'
              }}>
                Specifications
              </h3>
              <table style={{ width: '100%' }}>
                <tbody>
                  {product.shape && (
                    <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ 
                        padding: '0.75rem 0',
                        color: '#666',
                        fontSize: '0.875rem'
                      }}>
                        Shape
                      </td>
                      <td style={{ 
                        padding: '0.75rem 0',
                        color: '#333',
                        fontWeight: '500',
                        fontSize: '0.875rem'
                      }}>
                        {product.shape}
                      </td>
                    </tr>
                  )}
                  {product.material && (
                    <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ 
                        padding: '0.75rem 0',
                        color: '#666',
                        fontSize: '0.875rem'
                      }}>
                        Material
                      </td>
                      <td style={{ 
                        padding: '0.75rem 0',
                        color: '#333',
                        fontWeight: '500',
                        fontSize: '0.875rem'
                      }}>
                        {product.material}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ 
                      padding: '0.75rem 0',
                      color: '#666',
                      fontSize: '0.875rem'
                    }}>
                      Product Code
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0',
                      color: '#333',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
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
                padding: '1rem',
                backgroundColor: '#fff3e0',
                border: '1px solid #ff9800',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <strong style={{ color: '#ef6c00' }}>Pre-order Note:</strong>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                  {product.preorder_note}
                </span>
              </div>
            )}

            {/* Contact CTA */}
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ 
                color: '#1976d2',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Interested in this item?
              </p>
              <p style={{ 
                color: '#666',
                fontSize: '0.875rem'
              }}>
                Contact us to learn more
              </p>
            </div>
          </div>
        </div>

        {/* Back to list */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              backgroundColor: 'white',
              color: '#1976d2',
              border: '2px solid #1976d2',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Browse More Products
          </Link>
        </div>
      </div>
    </main>
  )
}
