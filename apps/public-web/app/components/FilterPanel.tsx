'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './FilterPanel.module.css'

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

  const filterButtonClassName = hasActiveFilters
    ? `${styles.filterButton} ${styles.filterButtonActive}`
    : styles.filterButton

  return (
    <div className={styles.filterPanel}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={filterButtonClassName}
      >
        <span>Filter</span>
        {activeCount > 0 ? <span className={styles.filterCount}>{activeCount}</span> : null}
        <span>{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div className={styles.filterPopover}>
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search"
            className={styles.filterInput}
          />

          <select
            value={filters.editorsPick ? 'editors-picks' : filters.sortBy || ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                editorsPick: event.target.value === 'editors-picks' ? true : undefined,
                sortBy:
                  event.target.value && event.target.value !== 'editors-picks'
                    ? (event.target.value as ProductFilters['sortBy'])
                    : undefined,
              }))
            }
            className={styles.filterSelect}
          >
            <option value="">Sort By</option>
            <option value="editors-picks">Editor Picks</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="date-old">Oldest First</option>
            <option value="date-new">Newest First</option>
          </select>

          <div className={styles.filterActions}>
            <button
              type="button"
              onClick={() => {
                setFilters({})
                setSearchInput('')
              }}
              className={styles.clearButton}
            >
              Clear
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className={styles.doneButton}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
