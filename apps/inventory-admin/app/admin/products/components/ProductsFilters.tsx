'use client'

import type { ProductFilterStatus } from './productsPageTypes'

interface ProductsFiltersProps {
  searchQuery: string
  filterStatus: ProductFilterStatus
  filterPearlType: string
  filterCategory: string
  sortBy: 'title' | 'price' | 'created'
  sortOrder: 'asc' | 'desc'
  pearlTypes: string[]
  categories: string[]
  hasFilters: boolean
  filteredCount: number
  totalItems: number
  formatCategory: (category: string) => string
  onSearchQueryChange: (value: string) => void
  onFilterStatusChange: (value: ProductFilterStatus) => void
  onFilterPearlTypeChange: (value: string) => void
  onFilterCategoryChange: (value: string) => void
  onSortByChange: (value: 'title' | 'price' | 'created') => void
  onSortOrderChange: (value: 'asc' | 'desc') => void
  onReset: () => void
}

export default function ProductsFilters({
  searchQuery,
  filterStatus,
  filterPearlType,
  filterCategory,
  sortBy,
  sortOrder,
  pearlTypes,
  categories,
  hasFilters,
  filteredCount,
  totalItems,
  formatCategory,
  onSearchQueryChange,
  onFilterStatusChange,
  onFilterPearlTypeChange,
  onFilterCategoryChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
}: ProductsFiltersProps) {
  return (
    <div className="admin-card admin-filter-panel">
      <div className="admin-filter-row">
        <div className="admin-filter-item-wide">
          <label className="admin-filter-label">
            🔍 Search products
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search title, slug, or description..."
            className="admin-control"
          />
        </div>

        <div className="admin-filter-item-sm">
          <label className="admin-filter-label">
            📌 Status
          </label>
          <select
            value={filterStatus}
            onChange={(event) => onFilterStatusChange(event.target.value as ProductFilterStatus)}
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

        <div className="admin-filter-item-md">
          <label className="admin-filter-label">
            💎 Pearl Type
          </label>
          <select
            value={filterPearlType}
            onChange={(event) => onFilterPearlTypeChange(event.target.value)}
            className="admin-control"
          >
            <option value="all">All Types</option>
            {pearlTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter-item-md">
          <label className="admin-filter-label">
            📂 Category
          </label>
          <select
            value={filterCategory}
            onChange={(event) => onFilterCategoryChange(event.target.value)}
            className="admin-control"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter-item-sm">
          <label className="admin-filter-label">
            📊 Sort By
          </label>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as 'title' | 'price' | 'created')}
            className="admin-control"
          >
            <option value="created">Created Time</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
          </select>
        </div>

        <div style={{ flex: '0 1 130px' }}>
          <label className="admin-filter-label">
            ↕️ Order
          </label>
          <select
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value as 'asc' | 'desc')}
            className="admin-control"
          >
            <option value="desc">Descending ↓</option>
            <option value="asc">Ascending ↑</option>
          </select>
        </div>

        {hasFilters ? (
          <div className="admin-filter-item-auto">
            <button
              type="button"
              onClick={onReset}
              className="admin-btn admin-btn-secondary"
              style={{ padding: '0.75rem 1rem' }}
            >
              🔄 Reset
            </button>
          </div>
        ) : null}
      </div>

      <div className="admin-filter-results">
        Showing <strong>{filteredCount}</strong> / {totalItems} products
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
  )
}
