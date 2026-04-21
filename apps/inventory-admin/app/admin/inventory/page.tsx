'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import AdminPageHeader from '../components/AdminPageHeader'

interface InventoryItem {
  id: string
  name: string | null
  purchase_date: string | null
  cost: number | null
  total_quantity: number
  allocated_quantity: number
  internal_note: string | null
  category: string | null
  created_at: string
  updated_at: string
}

// Category options
const CATEGORIES = [
  { value: 'loose_pearl', label: 'Loose Pearl', color: '#FCE7F3', textColor: '#BE185D' },
  { value: 'finished_jewelry', label: 'Finished Jewelry', color: '#FFF4E6', textColor: '#9A3412' },
  { value: 'pt900', label: 'Pt900 Platinum 900', color: '#F3E5F5', textColor: '#7B1FA2' },
  { value: '925_silver', label: '925 Silver', color: '#E0F2FE', textColor: '#0369A1' },
  { value: '18k', label: '18K Gold', color: '#FEF3C7', textColor: '#92400E' },
  { value: 'package', label: 'Packaging', color: '#F3F4F6', textColor: '#111827' },
  { value: 'shipment', label: 'Shipping', color: '#F3F4F6', textColor: '#111827' }
] as const

interface InventorySummary {
  total_items: number
  total_quantity: number
  available_quantity: number
  total_value: number
  remaining_value: number
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<main className="admin-page"><div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div></main>}>
      <InventoryPageContent />
    </Suspense>
  )
}

function InventoryPageContent() {
  const ITEMS_PER_PAGE = 30
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState<InventorySummary>({
    total_items: 0,
    total_quantity: 0,
    available_quantity: 0,
    total_value: 0,
    remaining_value: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [filterCategory, setFilterCategory] = useState<string>(
    () => searchParams.get('category') || 'all'
  )
  const [filterStatus, setFilterStatus] = useState<'all' | 'instock' | 'sold'>(() => {
    const value = searchParams.get('status')
    return value === 'instock' || value === 'sold' || value === 'all' ? value : 'all'
  })
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'quantity'>(() => {
    const value = searchParams.get('sortBy')
    return value === 'date' || value === 'value' || value === 'quantity' ? value : 'date'
  })
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const value = searchParams.get('sortOrder')
    return value === 'asc' || value === 'desc' ? value : 'desc'
  })
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page') || '1')
    return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  })
  const returnToParams = new URLSearchParams()
  if (searchQuery.trim()) returnToParams.set('search', searchQuery.trim())
  if (filterCategory !== 'all') returnToParams.set('category', filterCategory)
  if (filterStatus !== 'all') returnToParams.set('status', filterStatus)
  if (sortBy !== 'date') returnToParams.set('sortBy', sortBy)
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
    if (filterCategory !== 'all') params.set('category', filterCategory)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (sortBy !== 'date') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    if (currentPage > 1) params.set('page', String(currentPage))

    const nextQuery = params.toString()
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [currentPage, searchQuery, filterCategory, filterStatus, sortBy, sortOrder, pathname, router])

  useEffect(() => {
    void loadInventory(currentPage)
  }, [currentPage, searchQuery, filterCategory, filterStatus, sortBy, sortOrder])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const loadInventory = async (targetPage = currentPage) => {
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        pageSize: String(ITEMS_PER_PAGE),
        search: searchQuery,
        category: filterCategory,
        status: filterStatus,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/inventory?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) throw new Error('Failed to load inventory')
      const data = await response.json()
      setItems(data.items || [])
      setSummary(data.summary || {
        total_items: 0,
        total_quantity: 0,
        available_quantity: 0,
        total_value: 0,
        remaining_value: 0
      })
      setTotalItems(data.pagination?.totalItems || 0)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items
  const hasFilters = searchQuery !== '' || filterCategory !== 'all' || filterStatus !== 'all'
  const paginatedItems = filteredItems

  useEffect(() => {
    if (loading) return
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages, loading])

  const resetFilters = () => {
    setSearchQuery('')
    setFilterCategory('all')
    setFilterStatus('all')
    setSortBy('date')
    setSortOrder('desc')
  }

  const handleDelete = async (item: InventoryItem) => {
    const label = item.name ? `${item.name}` : `inventory item`
    if (!confirm(`Delete ${label}? This action cannot be undone.`)) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete inventory item')
      }

      await loadInventory()
      setNotice('Inventory item deleted')
    } catch (e) {
      setError(`Delete failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="Inventory"
        onRefresh={async () => {
          setLoading(true)
          setError(null)
          try {
            await loadInventory(currentPage)
          } catch (e) {
            setError('Refresh failed, please try again')
          }
        }}
        refreshLabel="Reload inventory list"
        refreshing={loading}
        actions={
          <Link
          href={`/admin/inventory/new?returnTo=${returnToParam}`}
          className="admin-link-btn admin-link-btn-primary"
          >
            + Add Inventory
          </Link>
        }
      />

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
        <div className="admin-filter-row admin-filter-row-center">
          {/* Search Input */}
          <div className="admin-filter-item-wide">
            <label className="admin-filter-label">
              🔍 Search name or notes
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Enter item name or notes..."
              className="admin-control"
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: '0 1 220px' }}>
            <label className="admin-filter-label">
              🏷️ Category
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
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ flex: '0 1 180px' }}>
            <label className="admin-filter-label">
              📦 Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as 'all' | 'instock' | 'sold')
                setCurrentPage(1)
              }}
              className="admin-control"
            >
              <option value="all">All</option>
              <option value="instock">In Stock</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ flex: '0 1 200px' }}>
            <label className="admin-filter-label">
              📊 Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'date' | 'value' | 'quantity')
                setCurrentPage(1)
              }}
              className="admin-control"
            >
              <option value="date">Purchase Date</option>
              <option value="value">Total Value</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>

          {/* Sort Order */}
          <div style={{ flex: '0 1 150px' }}>
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
            <div style={{ flex: '0 0 auto', marginTop: 'auto' }}>
              <label className="admin-filter-label" style={{ visibility: 'hidden' }}>
                &nbsp;
              </label>
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
          Showing <strong>{filteredItems.length}</strong> / {totalItems} inventory items
        </div>
      </div>

      <div className="admin-stats-row">
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Items</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9A961', margin: 0 }}>
            {summary.total_items}
          </p>
        </div>
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Quantity</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981', margin: 0 }}>
            {summary.total_quantity}
          </p>
        </div>
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Available Quantity</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981', margin: 0 }}>
            {summary.available_quantity}
          </p>
        </div>
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Total Value</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B', margin: 0 }}>
            ${summary.total_value.toFixed(2)}
          </p>
        </div>
        <div className="admin-stat-card" style={{ 
          flex: 1,
          padding: '1.5rem', 
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>Remaining Value</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9A961', margin: 0 }}>
            ${summary.remaining_value.toFixed(2)}
          </p>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <p className="admin-empty-title">
            {items.length === 0 ? 'No inventory items yet' : 'No matching inventory items'}
          </p>
          {items.length === 0 ? (
            <Link
              href={`/admin/inventory/new?returnTo=${returnToParam}`}
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
              Create first inventory item
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
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="admin-table-head-row">
                <th className="admin-th-center">Status</th>
                <th>Name</th>
                <th>Category</th>
                <th style={{ whiteSpace: 'nowrap' }}>Purchase Date</th>
                <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Unit Cost</th>
                <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Qty</th>
                <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Remaining</th>
                <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Remaining Value</th>
                <th className="admin-th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => {
                const remainingQuantity = item.total_quantity - item.allocated_quantity
                const unitCost = item.cost || 0
                const remainingValue = remainingQuantity * unitCost
                const isSold = remainingQuantity <= 0
                const categoryInfo = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[0]
                
                return (
                  <tr
                    key={item.id}
                    className="admin-row-divider"
                    style={{
                      opacity: isSold ? 0.7 : 1,
                      backgroundColor: isSold ? '#FFFBFB' : 'transparent',
                    }}
                  >
                    <td className="admin-cell-center">
                      <span
                        className={isSold ? 'admin-pill' : 'admin-pill admin-pill-success'}
                        style={
                          isSold
                            ? { background: '#FEE2E2', color: '#B91C1C', fontSize: '0.875rem', whiteSpace: 'nowrap' }
                            : { fontSize: '0.875rem', whiteSpace: 'nowrap' }
                        }
                      >
                        {isSold ? 'Sold' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>
                        {item.name || '-'}
                      </div>
                    </td>
                    <td>
                      <span className="admin-pill admin-pill-lilac" style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {categoryInfo.label}
                      </span>
                    </td>
                    <td className="admin-cell-muted" style={{ whiteSpace: 'nowrap' }}>
                      {item.purchase_date 
                        ? new Date(item.purchase_date).toLocaleDateString('zh-TW')
                        : '-'
                      }
                    </td>
                    <td className="admin-cell-right admin-money" style={{ whiteSpace: 'nowrap' }}>
                      ${unitCost.toFixed(2)}
                    </td>
                    <td className="admin-cell-right" style={{ whiteSpace: 'nowrap' }}>
                      {item.total_quantity}
                    </td>
                    <td style={{ fontWeight: '600', whiteSpace: 'nowrap' }} className="admin-cell-right">
                      {remainingQuantity}
                    </td>
                    <td className="admin-cell-right admin-money admin-money-accent" style={{ whiteSpace: 'nowrap' }}>
                      ${remainingValue.toFixed(2)}
                    </td>
                    <td className="admin-cell-center">
                      <div className="admin-action-group admin-action-group-inline">
                        <Link
                          href={`/admin/inventory/${item.id}?returnTo=${returnToParam}`}
                          className="admin-btn admin-btn-edit admin-link-btn admin-btn-md"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
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
      )}

      {filteredItems.length > 0 && totalPages > 1 && (
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
