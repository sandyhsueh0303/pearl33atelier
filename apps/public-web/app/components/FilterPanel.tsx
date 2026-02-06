'use client'

import { useState } from 'react'
import { colors, typography, spacing } from '../constants/design'

interface FilterPanelProps {
  onFilterChange: (filters: ProductFilters) => void
}

export interface ProductFilters {
  pearlType?: string
  priceRange?: { min: number; max: number }
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular'
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<ProductFilters>({})

  const handlePearlTypeChange = (type: string) => {
    const newFilters = {
      ...filters,
      pearlType: filters.pearlType === type ? undefined : type,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (sort: ProductFilters['sortBy']) => {
    const newFilters = { ...filters, sortBy: sort }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

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
            Pearl Type
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
            {['Akoya', 'South Sea', 'Tahitian', 'Freshwater'].map((type) => (
              <button
                key={type}
                onClick={() => handlePearlTypeChange(type)}
                style={{
                  padding: `${spacing.xs} ${spacing.md}`,
                  backgroundColor: filters.pearlType === type ? colors.gold : colors.white,
                  color: filters.pearlType === type ? colors.white : colors.darkGray,
                  border: `1px solid ${filters.pearlType === type ? colors.gold : colors.lightGray}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  transition: 'all 0.2s',
                }}
              >
                {type}
              </button>
            ))}
          </div>
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
            value={filters.sortBy || 'newest'}
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
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

      </div>

      {Object.keys(filters).length > 0 && (
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
