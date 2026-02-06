'use client'

import { useState } from 'react'
import { colors, typography, spacing } from '../constants/design'

interface FilterPanelProps {
  onFilterChange: (filters: ProductFilters) => void
}

export interface ProductFilters {
  searchQuery?: string
  pearlType?: string
  category?: string
  priceRange?: { min: number; max: number }
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular'
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<ProductFilters>({})

  const handleSearchChange = (searchQuery: string) => {
    const newFilters = {
      ...filters,
      searchQuery: searchQuery || undefined,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePearlTypeChange = (type: string) => {
    const newFilters = {
      ...filters,
      pearlType: type || undefined,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleCategoryChange = (category: string) => {
    const newFilters = {
      ...filters,
      category: category || undefined,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (sort: ProductFilters['sortBy']) => {
    const newFilters = {
      ...filters,
      sortBy: sort === 'newest' ? undefined : sort,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const hasActiveFilters = Boolean(
    filters.searchQuery || filters.pearlType || filters.category || filters.priceRange || filters.sortBy
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
            Search
          </h3>
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            onFilterChange({})
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
