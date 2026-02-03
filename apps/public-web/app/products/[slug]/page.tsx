import { createSupabaseClient } from '@33pearlatelier/shared/supabase'
import type { CatalogProduct, ProductImage } from '@33pearlatelier/shared/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let product: CatalogProduct | null = null
  let images: ProductImage[] = []
  let error: string | null = null

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get product by slug (RLS will filter to only published)
    const { data: productData, error: productError } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (productError || !productData) {
      return notFound()
    }

    product = productData as any

    // Get published images for this product
    if (product) {
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (!imagesError && imagesData) {
        images = imagesData as any[]
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  if (!product) {
    return notFound()
  }

  // Find primary image or use first image
  const primaryImage = images.find(img => img.is_primary) || images[0]

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
            ← 返回商品列表
          </Link>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fee', 
            border: '1px solid #c00',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <strong>錯誤:</strong> {error}
          </div>
        )}

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
            {/* Main Image */}
            <div style={{
              width: '100%',
              paddingBottom: '100%',
              position: 'relative',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              {primaryImage ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product_image/${primaryImage.storage_path}`}
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
                    style={{
                      paddingBottom: '100%',
                      position: 'relative',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      border: image.is_primary ? '2px solid #1976d2' : '1px solid #ddd',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product_image/${image.storage_path}`}
                      alt={`${product.title} - 圖片 ${index + 1}`}
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
                {product.availability === 'IN_STOCK' ? '現貨供應' : '接受預購'}
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
                  NT$ {product.sell_price.toLocaleString()}
                </div>
              )}
              {product.original_price && product.original_price > (product.sell_price || 0) && (
                <div style={{ 
                  fontSize: '1.125rem',
                  color: '#999',
                  textDecoration: 'line-through'
                }}>
                  原價 NT$ {product.original_price.toLocaleString()}
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
                  商品描述
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
                商品規格
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
                        形狀
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
                        材質
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
                      商品編號
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
                <strong style={{ color: '#ef6c00' }}>預購說明：</strong>
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
                對這件商品有興趣？
              </p>
              <p style={{ 
                color: '#666',
                fontSize: '0.875rem'
              }}>
                歡迎聯繫我們了解更多詳情
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
            瀏覽更多商品
          </Link>
        </div>
      </div>
    </main>
  )
}
