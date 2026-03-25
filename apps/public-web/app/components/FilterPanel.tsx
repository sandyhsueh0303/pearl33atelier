'use client'

import { useEffect, useState } from 'react'
import { colors, typography, spacing } from '../constants/design'

interface FilterPanelProps {
  onFilterChange: (filters: ProductFilters) => void
  initialFilters?: ProductFilters
}

export interface ProductFilters {
  searchQuery?: string
  pearlType?: string
  category?: string
  editorsPick?: boolean
  priceRange?: { min: number; max: number }
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular'
}

export default function FilterPanel({ onFilterChange, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const [searchInput, setSearchInput] = useState(initialFilters?.searchQuery || '')

  useEffect(() => {
    setFilters(initialFilters || {})
    setSearchInput(initialFilters?.searchQuery || '')
  }, [initialFilters])

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => {
        return {
          ...prev,
          searchQuery: searchInput || undefined,
        }
      })
    }, 200)

    return () => window.clearTimeout(timer)
  }, [searchInput, onFilterChange])

  const updateFilters = (updater: (prev: ProductFilters) => ProductFilters) => {
    setFilters((prev) => updater(prev))
  }

  const handlePearlTypeChange = (type: string) => {
    updateFilters((prev) => ({
      ...prev,
      pearlType: type || undefined,
    }))
  }

  const handleCategoryChange = (category: string) => {
    updateFilters((prev) => ({
      ...prev,
      category: category || undefined,
    }))
  }

  const handleEditorsPickChange = (checked: boolean) => {
    updateFilters((prev) => ({
      ...prev,
      editorsPick: checked || undefined,
    }))
  }

  const handleSortChange = (sort: ProductFilters['sortBy']) => {
    updateFilters((prev) => ({
      ...prev,
      sortBy: sort === 'newest' ? undefined : sort,
    }))
  }

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
      filters.pearlType ||
      filters.category ||
      filters.editorsPick ||
      filters.priceRange ||
      filters.sortBy
  )

  return (
    <div
      style={{
        marginBottom: spacing['2xl'],
        padding: spacing.lg,
        backgroundColor: colors.pearl,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.lg,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.darkGray,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Curation
          </h3>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.sm,
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              color: colors.darkGray,
              minHeight: '42px',
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(filters.editorsPick)}
              onChange={(e) => handleEditorsPickChange(e.target.checked)}
            />
            <span>Editor&apos;s Pick only</span>
          </label>
        </div>

        <div>
          <h3
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.darkGray,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Search
          </h3>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title, slug, description..."
            style={{
              width: '100%',
              padding: spacing.sm,
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 4,
              fontSize: typography.fontSize.sm,
            }}
          />
        </div>

        <div>
          <h3
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.darkGray,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Category
          </h3>
          <select
            value={filters.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.sm,
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 4,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            <option value="">All Categories</option>
            <option value="Bracelets">Bracelets</option>
            <option value="Necklaces">Necklaces</option>
            <option value="Earrings">Earrings</option>
            <option value="Studs">Studs</option>
            <option value="Rings">Rings</option>
            <option value="Pendants">Pendants</option>
            <option value="Loose Pearls">Loose Pearls</option>
            <option value="Brooches">Brooches</option>
          </select>
        </div>

        <div>
          <h3
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.darkGray,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Pearl Type
          </h3>
          <select
            value={filters.pearlType || ''}
            onChange={(e) => handlePearlTypeChange(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.sm,
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 4,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            <option value="">All Pearl Types</option>
            <option value="Akoya">Akoya</option>
            <option value="South Sea">South Sea</option>
            <option value="Tahitian">Tahitian</option>
            <option value="Freshwater">Freshwater</option>
          </select>
        </div>

        <div>
          <h3
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.darkGray,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Sort By
          </h3>
          <select
            value={filters.sortBy || ''}
            onChange={(e) => handleSortChange(e.target.value as ProductFilters['sortBy'])}
            style={{
              width: '100%',
              padding: spacing.sm,
              backgroundColor: colors.white,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 4,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            <option value="">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

      </div>

      {hasActiveFilters && (
        <button
          onClick={() => {
            setFilters({})
            setSearchInput('')
          }}
          style={{
            marginTop: spacing.md,
            padding: `${spacing.xs} ${spacing.md}`,
            backgroundColor: 'transparent',
            color: colors.gold,
            border: 'none',
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            textDecoration: 'underline',
          }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  )
}
