'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageHeader from '../components/AdminPageHeader'
import styles from './EtsyListingWorkspace.module.css'

type ProductOption = {
  id: string
  sku: string | null
  title: string
  category: string | null
  published: boolean
}

type ProductSelectorResponse = {
  products: ProductOption[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

const PAGE_SIZE = 20

export default function EtsyListingWorkspacePage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    })
    if (debouncedSearch) params.set('search', debouncedSearch)

    setLoading(true)
    setError(null)
    setSelectedProductId(null)

    void fetch(`/api/products/etsy-listing?${params.toString()}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load products.')
        }
        return data as ProductSelectorResponse
      })
      .then((data) => {
        setProducts(data.products || [])
        setTotalItems(data.pagination?.totalItems || 0)
        setTotalPages(data.pagination?.totalPages || 1)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setProducts([])
        setTotalItems(0)
        setTotalPages(1)
        setError(requestError instanceof Error ? requestError.message : 'Failed to load products.')
      })
      .finally(() => {
        if (activeRequest.current !== controller) return
        activeRequest.current = null
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      if (activeRequest.current === controller) activeRequest.current = null
    }
  }, [debouncedSearch, page])

  const selectedProduct = products.find((product) => product.id === selectedProductId)

  const openEditor = () => {
    if (!selectedProductId) return
    router.push(`/admin/products/${selectedProductId}/etsy-listing`)
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="Etsy Listing Workspace"
        description="Choose one existing product to prepare in the Etsy Listing editor."
      />

      <section className={`admin-card ${styles.selector}`}>
        <label htmlFor="etsy-product-search" className={styles.searchLabel}>
          Search products
        </label>
        <input
          id="etsy-product-search"
          type="search"
          value={searchInput}
          onChange={(event) => {
            activeRequest.current?.abort()
            setLoading(true)
            setSearchInput(event.target.value)
          }}
          placeholder="Search by product title or SKU"
          className={styles.searchInput}
          autoComplete="off"
        />
        <p className={styles.resultSummary} aria-live="polite">
          {loading ? 'Loading products…' : `${totalItems} product${totalItems === 1 ? '' : 's'} found`}
        </p>
      </section>

      {error ? (
        <div className="admin-error-banner" role="alert">
          <strong>Unable to load products:</strong> {error}
        </div>
      ) : null}

      <section className={`admin-card ${styles.results}`} aria-busy={loading}>
        {loading ? (
          <div className={styles.stateMessage}>Loading products…</div>
        ) : products.length === 0 ? (
          <div className={styles.stateMessage}>
            {debouncedSearch
              ? `No products found for “${debouncedSearch}”.`
              : 'No products are available to select.'}
          </div>
        ) : (
          <div className={styles.productList} role="radiogroup" aria-label="Select one product">
            {products.map((product) => {
              const selected = product.id === selectedProductId
              return (
                <label
                  key={product.id}
                  className={`${styles.productOption} ${selected ? styles.productOptionSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="etsy-product"
                    value={product.id}
                    checked={selected}
                    onChange={() => setSelectedProductId(product.id)}
                    className={styles.radio}
                  />
                  <span className={styles.productIdentity}>
                    <span className={styles.productTitle}>{product.title}</span>
                    <span className={styles.productMeta}>
                      {product.sku || 'No SKU'}
                      {product.category ? ` · ${product.category.replaceAll('_', ' ')}` : ''}
                    </span>
                  </span>
                  <span className={product.published ? styles.published : styles.draft}>
                    {product.published ? 'Published' : 'Draft'}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </section>

      <div className={styles.footer}>
        <div className={styles.pagination} aria-label="Product result pages">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={loading || page <= 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={loading || page >= totalPages}
          >
            Next
          </button>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openEditor}
          disabled={!selectedProduct || loading}
        >
          Continue to Etsy Editor
        </button>
      </div>
    </main>
  )
}
