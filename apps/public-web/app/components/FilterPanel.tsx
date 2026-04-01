'use client'

import { useEffect, useMemo, useState } from 'react'
import { colors, typography, spacing, shadows } from '../constants/design'

interface FilterPanelProps {
  onFilterChange: (filters: ProductFilters) => void
  initialFilters?: ProductFilters
}

export interface ProductFilters {
  searchQuery?: string
  pearlType?: string
  category?: string
  saleOnly?: boolean
  editorsPick?: boolean
  priceRange?: { min: number; max: number }
  sortBy?: 'price-low' | 'price-high' | 'date-old' | 'date-new'
}

export default function FilterPanel({ onFilterChange, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const [searchInput, setSearchInput] = useState(initialFilters?.searchQuery || '')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setFilters(initialFilters || {})
    setSearchInput(initialFilters?.searchQuery || '')
  }, [initialFilters])

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        searchQuery: searchInput || undefined,
      }))
    }, 200)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
      filters.pearlType ||
      filters.category ||
      filters.saleOnly ||
      filters.editorsPick ||
      filters.priceRange ||
      filters.sortBy
  )

  const activeCount = useMemo(() => {
    return [
      filters.searchQuery,
      filters.pearlType,
      filters.category,
      filters.saleOnly,
      filters.editorsPick,
      filters.sortBy,
    ].filter(Boolean).length
  }, [filters])

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing.xs,
          padding: `${spacing.xs} ${spacing.md}`,
          border: `1px solid ${hasActiveFilters ? colors.gold : 'rgba(44, 44, 44, 0.14)'}`,
          backgroundColor: colors.white,
          color: colors.darkGray,
          cursor: 'pointer',
          fontSize: typography.fontSize.sm,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          boxShadow: shadows.subtle,
        }}
      >
        <span>Filter</span>
        {activeCount > 0 ? (
          <span
            style={{
              display: 'inline-flex',
              minWidth: '18px',
              height: '18px',
              padding: '0 5px',
              borderRadius: '999px',
              backgroundColor: colors.gold,
              color: colors.white,
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: typography.fontSize.xs,
            }}
          >
            {activeCount}
          </span>
        ) : null}
        <span>{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: `calc(100% + ${spacing.sm})`,
            right: 0,
            width: 'min(92vw, 360px)',
            padding: spacing.md,
            border: '1px solid rgba(44, 44, 44, 0.12)',
            backgroundColor: colors.white,
            boxShadow: shadows.medium,
            zIndex: 20,
            display: 'grid',
            gap: spacing.sm,
          }}
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            style={{
              width: '100%',
              padding: `${spacing.xs} ${spacing.sm}`,
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: '#fffdf8',
              fontSize: typography.fontSize.sm,
            }}
          />

          <select
            value={filters.editorsPick ? 'editors-picks' : filters.sortBy || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                editorsPick: e.target.value === 'editors-picks' ? true : undefined,
                sortBy:
                  e.target.value && e.target.value !== 'editors-picks'
                    ? (e.target.value as ProductFilters['sortBy'])
                    : undefined,
              }))
            }
            style={{
              width: '100%',
              padding: `${spacing.xs} ${spacing.sm}`,
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: '#fffdf8',
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            <option value="">Sort By</option>
            <option value="editors-picks">Editor Picks</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="date-old">Oldest First</option>
            <option value="date-new">Newest First</option>
          </select>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing.sm,
              marginTop: spacing.xs,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setFilters({})
                setSearchInput('')
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: colors.gold,
                fontSize: typography.fontSize.sm,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                border: `1px solid ${colors.lightGray}`,
                background: colors.white,
                color: colors.darkGray,
                fontSize: typography.fontSize.sm,
                cursor: 'pointer',
                padding: `${spacing.xs} ${spacing.sm}`,
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
