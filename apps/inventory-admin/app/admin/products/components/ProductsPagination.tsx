'use client'

import styles from './ProductsPagination.module.css'

interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

export default function ProductsPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: ProductsPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="admin-pagination admin-products-pagination">
      <button
        type="button"
        className={`admin-btn admin-btn-secondary admin-btn-sm ${styles.paginationButton}`}
        onClick={onPrevious}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="admin-pagination-label">
        Page {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        className={`admin-btn admin-btn-secondary admin-btn-sm ${styles.paginationButton}`}
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )
}
