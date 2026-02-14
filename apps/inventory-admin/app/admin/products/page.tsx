'use client'

import type { CatalogProduct } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Extended product type with cost and profit
interface ProductWithStats extends CatalogProduct {
  total_cost?: number
  profit?: number
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [filterPearlType, setFilterPearlType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'created'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const formatCategory = (category: string) => {
    const labels: Record<string, string> = {
      BRACELETS: 'Bracelets',
      NECKLACES: 'Necklaces',
      EARRINGS: 'Earrings',
      STUDS: 'Studs',
      RINGS: 'Rings',
      PENDANTS: 'Pendants',
      LOOSE_PEARLS: 'Loose Pearls',
      BROOCHES: 'Brooches',
    }
    return labels[category] || category
  }

  useEffect(() => {
    loadProducts()
    
    // Listen for focus event to reload when returning to this page
    const handleFocus = () => {
      loadProducts()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
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
    if (!confirm(`Delete "${productTitle}"? This action cannot be undone.`)) {
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
      alert('Product deleted')
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  // Get unique pearl types for filter
  const pearlTypes = Array.from(new Set(products.map(p => p.pearl_type).filter(Boolean)))
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((category): category is Exclude<ProductWithStats['category'], null> => category !== null)
    )
  )

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const title = (product.title || '').toLowerCase()
        const slug = (product.slug || '').toLowerCase()
        const description = (product.description || '').toLowerCase()
        if (!title.includes(query) && !slug.includes(query) && !description.includes(query)) {
          return false
        }
      }
      
      // Status filter
      if (filterStatus === 'published' && !product.published) return false
      if (filterStatus === 'draft' && product.published) return false
      
      // Pearl type filter
      if (filterPearlType !== 'all' && product.pearl_type !== filterPearlType) return false

      // Category filter
      if (filterCategory !== 'all' && product.category !== filterCategory) return false
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '')
      } else if (sortBy === 'price') {
        comparison = (a.sell_price || 0) - (b.sell_price || 0)
      } else if (sortBy === 'created') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        comparison = dateA - dateB
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const hasFilters = searchQuery !== '' || filterStatus !== 'all' || filterPearlType !== 'all' || filterCategory !== 'all'
  const resetFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setFilterPearlType('all')
    setFilterCategory('all')
    setSortBy('created')
    setSortOrder('desc')
  }

  const publishedCount = filteredProducts.filter(p => p.published).length
  const draftCount = filteredProducts.filter(p => !p.published).length
  
  // Calculate totals
  const totalCost = filteredProducts.reduce((sum, p) => sum + (p.total_cost || 0), 0)
  const totalRevenue = filteredProducts.reduce((sum, p) => sum + (p.sell_price || 0), 0)
  const totalProfit = filteredProducts.reduce((sum, p) => sum + (p.profit || 0), 0)
  const totalProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0 }}>Products</h1>
          <button
            onClick={async () => {
              console.log('🔄 Refresh button clicked')
              setLoading(true)
              setError(null)
              try {
                await loadProducts()
                console.log('✅ Product list updated')
              } catch (e) {
                console.error('❌ Refresh failed:', e)
                setError('Refresh failed, please try again')
              }
            }}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#e0e0e0' : '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            title="Reload product list"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
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
          + Add Product
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
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              🔍 Search products
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, slug, or description..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: '0 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              📌 Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Pearl Type Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              💎 Pearl Type
            </label>
            <select
              value={filterPearlType}
              onChange={(e) => setFilterPearlType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Types</option>
              {pearlTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              📂 Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{formatCategory(category)}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ flex: '0 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              📊 Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'price' | 'created')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="created">Created Time</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
            </select>
          </div>

          {/* Sort Order */}
          <div style={{ flex: '0 1 130px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              ↕️ Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="desc">Descending ↓</option>
              <option value="asc">Ascending ↑</option>
            </select>
          </div>

          {/* Reset Button */}
          {hasFilters && (
            <div style={{ flex: '0 0 auto' }}>
              <button
                onClick={resetFilters}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                🔄 Reset
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Showing <strong>{filteredProducts.length}</strong> / {products.length} products
          {filterStatus !== 'all' && ` • ${filterStatus === 'published' ? 'Published' : 'Draft'}`}
          {filterPearlType !== 'all' && ` • ${filterPearlType}`}
          {filterCategory !== 'all' && ` • ${formatCategory(filterCategory)}`}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {/* Small Stats */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: '100px'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.25rem 0' }}>Total</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
              {filteredProducts.length}
            </p>
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: '100px'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.25rem 0' }}>Published</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32', margin: 0 }}>
              {publishedCount}
            </p>
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: '100px'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.25rem 0' }}>Draft</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef6c00', margin: 0 }}>
              {draftCount}
            </p>
          </div>
        </div>
        
        {/* Large Financial Stats */}
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #d32f2f'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Cost</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>
            $ {totalCost.toLocaleString()}
          </p>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #1976d2'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Selling Price</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
            $ {totalRevenue.toLocaleString()}
          </p>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid ' + (totalProfit >= 0 ? '#4caf50' : '#d32f2f')
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Profit</p>
          <p style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: totalProfit >= 0 ? '#4caf50' : '#d32f2f', 
            margin: 0 
          }}>
            {totalProfit >= 0 ? '+' : ''}$ {totalProfit.toLocaleString()}
          </p>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: totalProfit >= 0 ? '#2e7d32' : '#c62828', 
            margin: '0.5rem 0 0 0'
          }}>
            {totalProfitMargin.toFixed(1)}% Profit Margin
          </p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ 
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>
            {products.length === 0 ? 'No products yet' : 'No matching products'}
          </p>
          {products.length === 0 ? (
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
              Create first product
            </Link>
          ) : (
            <button
              onClick={resetFilters}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear filters
            </button>
          )}
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
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Slug</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Title</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Pearl Type</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Total Cost</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Sell Price</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', minWidth: '140px' }}>Profit</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
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
                      {product.published ? 'Published' : 'Draft'}
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
                      backgroundColor: '#f3e5f5',
                      borderRadius: '12px',
                      fontSize: '0.875rem'
                    }}>
                      {product.category ? formatCategory(product.category) : '-'}
                    </span>
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
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500', color: '#d32f2f' }}>
                    {product.total_cost !== undefined ? `$ ${product.total_cost.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                    {product.sell_price ? `$ ${product.sell_price.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', minWidth: '140px' }}>
                    {product.profit !== undefined ? (
                      <span style={{ 
                        color: product.profit >= 0 ? '#2e7d32' : '#d32f2f',
                        fontWeight: '700'
                      }}>
                        $ {product.profit.toLocaleString()}
                      </span>
                    ) : '-'}
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
                        Edit
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
                        Delete
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
