'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@33pearlatelier/shared/supabase'
import type { CatalogProduct, ProductImage } from '@33pearlatelier/shared/types'
import Link from 'next/link'

interface ProductWithImages extends CatalogProduct {
  primaryImage?: ProductImage
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Get published products
      const { data: productsData, error: productsError } = await supabase
        .from('catalog_products')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (productsError) throw productsError

      // Get primary images for all products
      const productsList = productsData as any[] || []
      const productIds = productsList.map(p => p.id)
      
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .eq('published', true)
        .eq('is_primary', true)

      const imagesList = imagesData as any[] || []

      // Combine products with their primary images
      const combined = productsList.map(product => ({
        ...product,
        primaryImage: imagesList.find(img => img.product_id === product.id)
      }))

      setProducts(combined)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ 
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        padding: '2rem',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>載入中...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ 
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      padding: '2rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            33 Pearl Atelier
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>
            精選珍珠珠寶系列
          </p>
        </header>

        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fee', 
            border: '1px solid #c00',
            borderRadius: '8px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <strong>錯誤:</strong> {error}
          </div>
        )}

        {products.length === 0 ? (
          <div style={{ 
            padding: '4rem',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>
              目前尚無商品
            </p>
            <p style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.5rem' }}>
              敬請期待我們即將推出的精選珠寶
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.quality}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block'
                }}
              >
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }}
                >
                  {/* Image */}
                  <div style={{
                    width: '100%',
                    paddingBottom: '100%',
                    position: 'relative',
                    backgroundColor: '#f5f5f5'
                  }}>
                    {product.primaryImage ? (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                      }}>
                        <span style={{ fontSize: '0.875rem' }}>商品圖片</span>
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
                        color: '#ccc'
                      }}>
                        <span style={{ fontSize: '3rem' }}>📷</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ 
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#333'
                    }}>
                      {product.title}
                    </h2>

                    <div style={{ 
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {product.pearl_type}
                      </span>
                      {product.size_mm && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}>
                          {product.size_mm}mm
                        </span>
                      )}
                    </div>

                    {product.description && (
                      <p style={{ 
                        color: '#666',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
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
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#1976d2'
                          }}>
                            NT$ {product.sell_price.toLocaleString()}
                          </div>
                        )}
                        {product.original_price && product.original_price > (product.sell_price || 0) && (
                          <div style={{ 
                            fontSize: '0.875rem',
                            color: '#999',
                            textDecoration: 'line-through'
                          }}>
                            NT$ {product.original_price.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <span style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: product.availability === 'IN_STOCK' ? '#e8f5e9' : '#fff3e0',
                        color: product.availability === 'IN_STOCK' ? '#2e7d32' : '#ef6c00',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {product.availability === 'IN_STOCK' ? '現貨' : '預購'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer style={{ 
          marginTop: '4rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#999',
          fontSize: '0.875rem'
        }}>
          <p>© 2026 33 Pearl Atelier. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
