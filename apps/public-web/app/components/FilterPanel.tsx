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
  const [isSortOpen, setIsSortOpen] = useState(false)

  const sortOptions = [
    { value: '', label: 'Sort By' },
    { value: 'editors-picks', label: 'Editor Picks' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'date-old', label: 'Oldest First' },
    { value: 'date-new', label: 'Newest First' },
  ] as const

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

          <div className={styles.filterSelectShell}>
            <button
              type="button"
              className={styles.filterSelectTrigger}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              onClick={() => setIsSortOpen((prev) => !prev)}
            >
              <span>
                {sortOptions.find(
                  (option) => option.value === (filters.editorsPick ? 'editors-picks' : filters.sortBy || '')
                )?.label || 'Sort By'}
              </span>
              <span className={styles.filterSelectArrow} aria-hidden="true">
                {isSortOpen ? '▴' : '▾'}
              </span>
            </button>
            {isSortOpen && (
              <div className={styles.filterSelectMenu} role="listbox" aria-label="Sort products">
                {sortOptions.map((option) => {
                  const selectedValue = filters.editorsPick ? 'editors-picks' : filters.sortBy || ''
                  const isSelected = selectedValue === option.value

                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      key={option.value || 'default'}
                      className={`${styles.filterSelectOption} ${
                        isSelected ? styles.filterSelectOptionActive : ''
                      }`}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          editorsPick: option.value === 'editors-picks' ? true : undefined,
                          sortBy:
                            option.value && option.value !== 'editors-picks'
                              ? (option.value as ProductFilters['sortBy'])
                              : undefined,
                        }))
                        setIsSortOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

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
