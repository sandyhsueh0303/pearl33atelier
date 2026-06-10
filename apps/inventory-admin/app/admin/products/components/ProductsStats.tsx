'use client'

import type { ProductSummaryStats } from './productsPageTypes'
import styles from './ProductsStats.module.css'

interface ProductsStatsProps {
  summaryStats: ProductSummaryStats
}

export default function ProductsStats({ summaryStats }: ProductsStatsProps) {
  const statCards = [
    { label: 'Total', value: summaryStats.total, className: styles.total },
    { label: 'Published', value: summaryStats.published, className: styles.published },
    { label: 'Draft', value: summaryStats.draft, className: styles.draft },
    { label: 'Preorder', value: summaryStats.preorder, className: styles.preorder },
    { label: 'Sold', value: summaryStats.sold, className: styles.sold },
  ]

  return (
    <div className="admin-stats-row">
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat-card admin-stat-card-body">
            <p className="admin-stat-label">{card.label}</p>
            <p className={`admin-stat-value ${card.className}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
