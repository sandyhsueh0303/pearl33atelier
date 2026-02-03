'use client'

import type { CatalogProduct } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to load products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string, productTitle: string) => {
    if (!confirm(`確定要刪除「${productTitle}」嗎？此操作無法復原。`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Reload products list
      loadProducts()
      alert('產品已刪除')
    } catch (e) {
      alert('刪除失敗: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  const publishedCount = products.filter(p => p.published).length
  const draftCount = products.filter(p => !p.published).length

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>產品管理</h1>
        <Link
          href="/admin/products/new"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1976d2',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          + 新增產品
        </Link>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #c00',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>錯誤:</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>總計</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
            {products.length}
          </p>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>已發布</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32', margin: 0 }}>
            {publishedCount}
          </p>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>草稿</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef6c00', margin: 0 }}>
            {draftCount}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ 
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>
            尚無產品
          </p>
          <Link
            href="/admin/products/new"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            建立第一個產品
          </Link>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>狀態</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Slug</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>標題</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>珍珠類型</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>售價</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: product.published ? '#e8f5e9' : '#fff3e0',
                      color: product.published ? '#2e7d32' : '#ef6c00'
                    }}>
                      {product.published ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#666' }}>
                    {product.slug}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>
                    {product.title}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '12px',
                      fontSize: '0.875rem'
                    }}>
                      {product.pearl_type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                    {product.sell_price ? `NT$ ${product.sell_price.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        編輯
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
