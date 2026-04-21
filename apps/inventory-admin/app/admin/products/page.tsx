'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import ProductsFilters from './components/ProductsFilters'
import ProductsPagination from './components/ProductsPagination'
import ProductsStats from './components/ProductsStats'
import ProductsTable from './components/ProductsTable'
import {
  formatCategory,
  type ProductFilterStatus,
  type ProductSummaryStats,
  type ProductWithStats,
} from './components/productsPageTypes'

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
  const [filterStatus, setFilterStatus] = useState<ProductFilterStatus>(() => {
    const value = searchParams.get('status')
    const allowed = ['active', 'all', 'published', 'draft', 'in_stock', 'preorder', 'sold'] as const
    return allowed.includes(value as ProductFilterStatus)
      ? (value as ProductFilterStatus)
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

  useEffect(() => {
    if (loading) return
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages, loading])

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="Products"
        onRefresh={async () => {
          setLoading(true)
          setError(null)
          try {
            await loadProducts(currentPage)
          } catch (e) {
            setError('Refresh failed, please try again')
          }
        }}
        refreshLabel="Reload product list"
        refreshing={loading}
        actions={
          <>
            <Link
              href={`/admin/products/ai-draft?returnTo=${returnToParam}`}
              className="admin-link-btn admin-link-btn-soft"
            >
              <span aria-hidden="true" className="admin-link-btn-soft-icon">✦</span>
              <span>Create with AI</span>
            </Link>
            <Link
              href={`/admin/products/new?returnTo=${returnToParam}`}
              className="admin-link-btn admin-link-btn-primary"
            >
              + Add Product
            </Link>
          </>
        }
      />

      {error && (
        <div className="admin-error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {notice && (
        <div className="admin-banner admin-banner-success">{notice}</div>
      )}

      <ProductsFilters
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        filterPearlType={filterPearlType}
        filterCategory={filterCategory}
        sortBy={sortBy}
        sortOrder={sortOrder}
        pearlTypes={pearlTypes}
        categories={categories}
        hasFilters={hasFilters}
        filteredCount={filteredProducts.length}
        totalItems={totalItems}
        formatCategory={formatCategory}
        onSearchQueryChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        onFilterStatusChange={(value) => {
          setFilterStatus(value)
          setCurrentPage(1)
        }}
        onFilterPearlTypeChange={(value) => {
          setFilterPearlType(value)
          setCurrentPage(1)
        }}
        onFilterCategoryChange={(value) => {
          setFilterCategory(value)
          setCurrentPage(1)
        }}
        onSortByChange={(value) => {
          setSortBy(value)
          setCurrentPage(1)
        }}
        onSortOrderChange={(value) => {
          setSortOrder(value)
          setCurrentPage(1)
        }}
        onReset={resetFilters}
      />

      <ProductsStats summaryStats={summaryStats} />

      {filteredProducts.length === 0 ? (
        <div className="admin-card admin-empty-state">
          <p className="admin-empty-title">
            {products.length === 0 ? 'No products yet' : 'No matching products'}
          </p>
          {products.length === 0 ? (
            <Link
              href={`/admin/products/new?returnTo=${returnToParam}`}
              className="admin-link-btn admin-link-btn-primary admin-empty-action"
            >
              Create first product
            </Link>
          ) : (
            <button
              type="button"
              onClick={resetFilters}
              className="admin-btn admin-btn-primary"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ProductsTable
          products={paginatedProducts}
          returnToParam={returnToParam}
          onDelete={handleDelete}
        />
      )}

      {filteredProducts.length > 0 ? (
        <ProductsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        />
      ) : null}
    </main>
  )
}
