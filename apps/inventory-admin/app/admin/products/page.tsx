'use client'

import type { CatalogProduct } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Extended product type with cost and profit
interface ProductWithStats extends CatalogProduct {
  total_cost?: number
  profit?: number
}

export default function ProductsPage() {
  const ITEMS_PER_PAGE = 30
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pearlTypes, setPearlTypes] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  
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
    void loadProducts(currentPage)
  }, [currentPage, searchQuery, filterStatus, filterPearlType, filterCategory, sortBy, sortOrder])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const loadProducts = async (targetPage = currentPage) => {
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        pageSize: String(ITEMS_PER_PAGE),
        search: searchQuery,
        status: filterStatus,
        pearlType: filterPearlType,
        category: filterCategory,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/products?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) throw new Error('Failed to load products')
      const data = await response.json()
      setProducts(data.products || [])
      setPearlTypes(data.filters?.pearlTypes || [])
      setCategories(data.filters?.categories || [])
      setTotalItems(data.pagination?.totalItems || 0)
      setTotalPages(data.pagination?.totalPages || 1)
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
      setError(null)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Reload products list
      await loadProducts()
      setNotice('Product deleted')
    } catch (e) {
      setError('Delete failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  const filteredProducts = products

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
  const paginatedProducts = filteredProducts

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus, filterPearlType, filterCategory, sortBy, sortOrder])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title-row">
          <h1 className="admin-page-title">Products</h1>
          <button
            onClick={async () => {
              setLoading(true)
              setError(null)
              try {
                await loadProducts(currentPage)
              } catch (e) {
                setError('Refresh failed, please try again')
              }
            }}
            disabled={loading}
            className="admin-btn admin-btn-secondary"
            style={{ backgroundColor: loading ? '#e0e0e0' : '#f5f5f5', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            title="Reload product list"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
        <Link
          href="/admin/products/new"
          className="admin-link-btn admin-link-btn-primary"
        >
          + Add Product
        </Link>
      </div>

      {error && (
        <div className="admin-error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {notice && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #A7F3D0',
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            fontWeight: 600,
          }}
        >
          {notice}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="admin-card admin-filter-panel">
        <div className="admin-filter-row">
          {/* Search Input */}
          <div className="admin-filter-item-wide">
            <label className="admin-filter-label">
              🔍 Search products
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, slug, or description..."
              className="admin-control"
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: '0 1 150px' }}>
            <label className="admin-filter-label">
              📌 Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
              className="admin-control"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Pearl Type Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <label className="admin-filter-label">
              💎 Pearl Type
            </label>
            <select
              value={filterPearlType}
              onChange={(e) => setFilterPearlType(e.target.value)}
              className="admin-control"
            >
              <option value="all">All Types</option>
              {pearlTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <label className="admin-filter-label">
              📂 Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="admin-control"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{formatCategory(category)}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ flex: '0 1 150px' }}>
            <label className="admin-filter-label">
              📊 Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'price' | 'created')}
              className="admin-control"
            >
              <option value="created">Created Time</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
            </select>
          </div>

          {/* Sort Order */}
          <div style={{ flex: '0 1 130px' }}>
            <label className="admin-filter-label">
              ↕️ Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="admin-control"
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
                className="admin-btn admin-btn-secondary"
                style={{ padding: '0.75rem 1rem' }}
              >
                🔄 Reset
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="admin-filter-results">
          Showing <strong>{filteredProducts.length}</strong> / {totalItems} products
          {filterStatus !== 'all' && ` • ${filterStatus === 'published' ? 'Published' : 'Draft'}`}
          {filterPearlType !== 'all' && ` • ${filterPearlType}`}
          {filterCategory !== 'all' && ` • ${formatCategory(filterCategory)}`}
        </div>
      </div>

      <div className="admin-stats-row">
        {/* Small Stats */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="admin-stat-card" style={{ 
            padding: '1rem', 
            minWidth: '100px'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.25rem 0' }}>Total</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C9A961', margin: 0 }}>
              {filteredProducts.length}
            </p>
          </div>
          <div className="admin-stat-card" style={{ 
            padding: '1rem', 
            minWidth: '100px'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.25rem 0' }}>Published</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981', margin: 0 }}>
              {publishedCount}
            </p>
          </div>
          <div className="admin-stat-card" style={{ 
            padding: '1rem', 
            minWidth: '100px'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.25rem 0' }}>Draft</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F59E0B', margin: 0 }}>
              {draftCount}
            </p>
          </div>
        </div>
        
        {/* Large Financial Stats */}
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Cost</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EF4444', margin: 0 }}>
            $ {totalCost.toLocaleString()}
          </p>
        </div>
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Selling Price</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9A961', margin: 0 }}>
            $ {totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Profit</p>
          <p style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: totalProfit >= 0 ? '#10B981' : '#EF4444', 
            margin: 0 
          }}>
            {totalProfit >= 0 ? '+' : ''}$ {totalProfit.toLocaleString()}
          </p>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: totalProfit >= 0 ? '#10B981' : '#EF4444', 
            margin: '0.5rem 0 0 0'
          }}>
            {totalProfitMargin.toFixed(1)}% Profit Margin
          </p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <p className="admin-empty-title">
            {products.length === 0 ? 'No products yet' : 'No matching products'}
          </p>
          {products.length === 0 ? (
            <Link
              href="/admin/products/new"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#C9A961',
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
                backgroundColor: '#C9A961',
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
        <div className="admin-card admin-table-card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="admin-table-head-row">
                <th>Status</th>
                <th>Slug</th>
                <th>Title</th>
                <th>Category</th>
                <th>Pearl Type</th>
                <th className="admin-th-right">Total Cost</th>
                <th className="admin-th-right">Sell Price</th>
                <th className="admin-th-right" style={{ minWidth: '140px' }}>Profit</th>
                <th className="admin-th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="admin-row-divider">
                  <td>
                    <span className={`admin-pill ${product.published ? 'admin-pill-success' : 'admin-pill-warning'}`}>
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="admin-cell-mono">
                    {product.slug}
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {product.title}
                  </td>
                  <td>
                    <span className="admin-pill admin-pill-lilac" style={{ fontSize: '0.875rem' }}>
                      {product.category ? formatCategory(product.category) : '-'}
                    </span>
                  </td>
                  <td>
                    <span className="admin-pill admin-pill-sky" style={{ fontSize: '0.875rem' }}>
                      {product.pearl_type}
                    </span>
                  </td>
                  <td className="admin-cell-right admin-money admin-money-danger">
                    {product.total_cost !== undefined ? `$ ${product.total_cost.toLocaleString()}` : '-'}
                  </td>
                  <td className="admin-cell-right admin-money">
                    {product.sell_price ? `$ ${product.sell_price.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ minWidth: '140px' }} className="admin-cell-right admin-money">
                    {product.profit !== undefined ? (
                      <span style={{ 
                        color: product.profit >= 0 ? '#10B981' : '#EF4444',
                      }}>
                        $ {product.profit.toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="admin-cell-center">
                    <div className="admin-action-group">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="admin-btn admin-btn-edit admin-link-btn admin-btn-md"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        className="admin-btn admin-btn-delete admin-btn-md"
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

      {filteredProducts.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </main>
  )
}
