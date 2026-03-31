'use client'

import type { CatalogProduct } from '@pearl33atelier/shared/types'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

// Extended product type with cost and profit
interface ProductWithStats extends CatalogProduct {
  total_cost?: number
  profit?: number
}

interface ProductSummaryStats {
  total: number
  published: number
  draft: number
  sold: number
  preorder: number
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="admin-page"><div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div></main>}>
      <ProductsPageContent />
    </Suspense>
  )
}

function ProductsPageContent() {
  const ITEMS_PER_PAGE = 30
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page') || '1')
    return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  })
  const [pearlTypes, setPearlTypes] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [filterStatus, setFilterStatus] = useState<
    'active' | 'all' | 'published' | 'draft' | 'in_stock' | 'preorder' | 'sold'
  >(() => {
    const value = searchParams.get('status')
    const allowed = ['active', 'all', 'published', 'draft', 'in_stock', 'preorder', 'sold'] as const
    return allowed.includes(value as (typeof allowed)[number])
      ? (value as 'active' | 'all' | 'published' | 'draft' | 'in_stock' | 'preorder' | 'sold')
      : 'active'
  })
  const [filterPearlType, setFilterPearlType] = useState<string>(
    () => searchParams.get('pearlType') || 'all'
  )
  const [filterCategory, setFilterCategory] = useState<string>(
    () => searchParams.get('category') || 'all'
  )
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'created'>(() => {
    const value = searchParams.get('sortBy')
    return value === 'title' || value === 'price' || value === 'created' ? value : 'created'
  })
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const value = searchParams.get('sortOrder')
    return value === 'asc' || value === 'desc' ? value : 'desc'
  })
  const [summaryStats, setSummaryStats] = useState<ProductSummaryStats>({
    total: 0,
    published: 0,
    draft: 0,
    sold: 0,
    preorder: 0,
  })

  const returnToParams = new URLSearchParams()
  if (searchQuery.trim()) returnToParams.set('search', searchQuery.trim())
  if (filterStatus !== 'active') returnToParams.set('status', filterStatus)
  if (filterPearlType !== 'all') returnToParams.set('pearlType', filterPearlType)
  if (filterCategory !== 'all') returnToParams.set('category', filterCategory)
  if (sortBy !== 'created') returnToParams.set('sortBy', sortBy)
  if (sortOrder !== 'desc') returnToParams.set('sortOrder', sortOrder)
  if (currentPage > 1) returnToParams.set('page', String(currentPage))
  const returnToQuery = returnToParams.toString()
  const returnToUrl = returnToQuery ? `${pathname}?${returnToQuery}` : pathname
  const returnToParam = encodeURIComponent(returnToUrl)

  useEffect(() => {
    const page = Number(searchParams.get('page') || '1')
    const nextPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
    setCurrentPage((prevPage) => (prevPage === nextPage ? prevPage : nextPage))
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (filterStatus !== 'active') params.set('status', filterStatus)
    if (filterPearlType !== 'all') params.set('pearlType', filterPearlType)
    if (filterCategory !== 'all') params.set('category', filterCategory)
    if (sortBy !== 'created') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    if (currentPage > 1) params.set('page', String(currentPage))

    const nextQuery = params.toString()
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [
    currentPage,
    searchQuery,
    filterStatus,
    filterPearlType,
    filterCategory,
    sortBy,
    sortOrder,
    pathname,
    router,
  ])
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

  const formatMoney = (value?: number) => (
    value !== undefined ? `$ ${value.toLocaleString()}` : '-'
  )

  const getAvailabilityMeta = (availability: ProductWithStats['availability']) => {
    if (availability === 'IN_STOCK') {
      return {
        label: 'In Stock',
        className: 'admin-pill admin-pill-success',
        style: {},
      }
    }

    if (availability === 'PREORDER') {
      return {
        label: 'Preorder',
        className: 'admin-pill admin-pill-gold',
        style: {},
      }
    }

    return {
      label: 'Sold',
      className: 'admin-pill',
      style: {
        background: '#FEE2E2',
        color: '#B91C1C',
      },
    }
  }

  useEffect(() => {
    void loadProducts(currentPage)
  }, [currentPage, searchQuery, filterStatus, filterPearlType, filterCategory, sortBy, sortOrder])

  useEffect(() => {
    void loadSummaryStats()
  }, [searchQuery, filterStatus, filterPearlType, filterCategory])

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

  const loadSummaryStats = async () => {
    try {
      const pageSize = 100
      let page = 1
      let totalPagesForSummary = 1
      const allFilteredProducts: ProductWithStats[] = []

      while (page <= totalPagesForSummary) {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          search: searchQuery,
          status: filterStatus,
          pearlType: filterPearlType,
          category: filterCategory,
          // Sorting does not affect totals, keep fixed for consistency.
          sortBy: 'created',
          sortOrder: 'desc',
        })

        const response = await fetch(`/api/products?${params.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (!response.ok) throw new Error('Failed to load product summary')
        const data = await response.json()
        allFilteredProducts.push(...(data.products || []))
        totalPagesForSummary = data.pagination?.totalPages || 1
        page += 1
      }

      const total = allFilteredProducts.length
      const published = allFilteredProducts.filter((p) => p.published).length
      const draft = total - published
      const sold = allFilteredProducts.filter((p) => p.availability === 'OUT_OF_STOCK').length
      const preorder = allFilteredProducts.filter((p) => p.availability === 'PREORDER').length

      setSummaryStats({
        total,
        published,
        draft,
        sold,
        preorder,
      })
    } catch (e) {
      // Keep previous summary values if loading summary fails.
      console.error('Failed to load product summary stats', e)
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

  const hasFilters = searchQuery !== '' || filterStatus !== 'active' || filterPearlType !== 'all' || filterCategory !== 'all'
  const resetFilters = () => {
    setSearchQuery('')
    setFilterStatus('active')
    setFilterPearlType('all')
    setFilterCategory('all')
    setSortBy('created')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const publishedCount = summaryStats.published
  const draftCount = summaryStats.draft
  const soldCount = summaryStats.sold
  const preorderCount = summaryStats.preorder
  const paginatedProducts = filteredProducts
  const statCards = [
    { label: 'Total', value: summaryStats.total, accent: '#C9A961' },
    { label: 'Published', value: publishedCount, accent: '#10B981' },
    { label: 'Draft', value: draftCount, accent: '#F59E0B' },
    { label: 'Preorder', value: preorderCount, accent: '#A162F7' },
    { label: 'Sold', value: soldCount, accent: '#EF4444' },
  ]

  useEffect(() => {
    if (loading) return
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages, loading])

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
          href={`/admin/products/new?returnTo=${returnToParam}`}
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
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
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
              onChange={(e) => {
                setFilterStatus(
                  e.target.value as 'active' | 'all' | 'published' | 'draft' | 'in_stock' | 'preorder' | 'sold'
                )
                setCurrentPage(1)
              }}
              className="admin-control"
            >
              <option value="active">Hide Sold</option>
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="in_stock">In Stock</option>
              <option value="preorder">Preorder</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          {/* Pearl Type Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <label className="admin-filter-label">
              💎 Pearl Type
            </label>
            <select
              value={filterPearlType}
              onChange={(e) => {
                setFilterPearlType(e.target.value)
                setCurrentPage(1)
              }}
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
              onChange={(e) => {
                setFilterCategory(e.target.value)
                setCurrentPage(1)
              }}
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
              onChange={(e) => {
                setSortBy(e.target.value as 'title' | 'price' | 'created')
                setCurrentPage(1)
              }}
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
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc')
                setCurrentPage(1)
              }}
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
          {filterStatus !== 'active' &&
            ` • ${
              filterStatus === 'all'
                ? 'All'
                : filterStatus === 'published'
                ? 'Published'
                : filterStatus === 'draft'
                ? 'Draft'
                : filterStatus === 'in_stock'
                ? 'In Stock'
                : filterStatus === 'preorder'
                ? 'Preorder'
                : 'Sold'
            }`}
          {filterPearlType !== 'all' && ` • ${filterPearlType}`}
          {filterCategory !== 'all' && ` • ${formatCategory(filterCategory)}`}
        </div>
      </div>

      <div className="admin-stats-row">
        <div
          className="admin-products-stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            width: '100%',
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              className="admin-stat-card"
              style={{
                padding: '1rem 1rem 1rem 1.1rem',
                borderLeft: `4px solid ${card.accent}`,
                backgroundColor: '#fffdf9',
                minHeight: '88px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#777', margin: '0 0 0.35rem 0', letterSpacing: '0.02em' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <p className="admin-empty-title">
            {products.length === 0 ? 'No products yet' : 'No matching products'}
          </p>
          {products.length === 0 ? (
            <Link
              href={`/admin/products/new?returnTo=${returnToParam}`}
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
        <>
          <div className="admin-card admin-table-card admin-products-table-wrap">
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="admin-table-head-row">
                  <th>Status</th>
                  <th>SKU</th>
                  <th>Available</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Pearl Type</th>
                  <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Total Cost</th>
                  <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Sell Price</th>
                  <th className="admin-th-right" style={{ minWidth: '140px' }}>Profit</th>
                  <th className="admin-th-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const availabilityMeta = getAvailabilityMeta(product.availability)

                  return (
                    <tr key={product.id} className="admin-row-divider">
                      <td>
                        <span className={`admin-pill ${product.published ? 'admin-pill-success' : 'admin-pill-warning'}`}>
                          {product.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="admin-cell-mono">
                        {product.sku || '-'}
                      </td>
                      <td>
                        <span
                          className={availabilityMeta.className}
                          style={{
                            fontSize: '0.875rem',
                            ...availabilityMeta.style,
                          }}
                        >
                          {availabilityMeta.label}
                        </span>
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
                        {formatMoney(product.total_cost)}
                      </td>
                      <td className="admin-cell-right admin-money">
                        {product.sell_price ? formatMoney(product.sell_price) : '-'}
                      </td>
                      <td style={{ minWidth: '140px' }} className="admin-cell-right admin-money">
                        {product.profit !== undefined ? (
                          <span style={{
                            color: product.profit >= 0 ? '#10B981' : '#EF4444',
                          }}>
                            {formatMoney(product.profit)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="admin-cell-center">
                        <div className="admin-action-group">
                          <Link
                            href={`/admin/products/${product.id}?returnTo=${returnToParam}`}
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
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-products-mobile-list">
            {paginatedProducts.map((product) => {
              const availabilityMeta = getAvailabilityMeta(product.availability)
              const profitColor = product.profit !== undefined && product.profit < 0 ? '#EF4444' : '#10B981'

              return (
                <article key={product.id} className="admin-card admin-products-mobile-card">
                  <div className="admin-products-mobile-card-header">
                    <div style={{ minWidth: 0 }}>
                      <h2 className="admin-products-mobile-title">{product.title}</h2>
                      <p className="admin-products-mobile-sku">{product.sku || 'No SKU'}</p>
                    </div>
                    <div className="admin-products-mobile-badges">
                      <span className={`admin-pill ${product.published ? 'admin-pill-success' : 'admin-pill-warning'}`}>
                        {product.published ? 'Published' : 'Draft'}
                      </span>
                      <span className={availabilityMeta.className} style={availabilityMeta.style}>
                        {availabilityMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="admin-products-mobile-summary">
                    <div className="admin-products-mobile-price">
                      <span className="admin-products-mobile-meta-label">Sell Price</span>
                      <span className="admin-money">{product.sell_price ? formatMoney(product.sell_price) : '-'}</span>
                    </div>
                    <div className="admin-products-mobile-price">
                      <span className="admin-products-mobile-meta-label">Profit</span>
                      <span className="admin-money" style={{ color: profitColor }}>
                        {product.profit !== undefined ? formatMoney(product.profit) : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="admin-products-mobile-inline-meta">
                    <span>{product.category ? formatCategory(product.category) : '-'}</span>
                    <span>{product.pearl_type || '-'}</span>
                  </div>

                  <div className="admin-action-group admin-products-mobile-actions">
                    <Link
                      href={`/admin/products/${product.id}?returnTo=${returnToParam}`}
                      className="admin-btn admin-btn-edit admin-link-btn admin-btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      className="admin-btn admin-btn-delete admin-btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="admin-products-pagination" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
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
