'use client'

import type { ProductSummaryStats } from './productsPageTypes'

interface ProductsStatsProps {
  summaryStats: ProductSummaryStats
}

export default function ProductsStats({ summaryStats }: ProductsStatsProps) {
  const statCards = [
    { label: 'Total', value: summaryStats.total, accent: '#C9A961' },
    { label: 'Published', value: summaryStats.published, accent: '#10B981' },
    { label: 'Draft', value: summaryStats.draft, accent: '#F59E0B' },
    { label: 'Preorder', value: summaryStats.preorder, accent: '#A162F7' },
    { label: 'Sold', value: summaryStats.sold, accent: '#EF4444' },
  ]

  return (
    <div className="admin-stats-row">
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat-card admin-stat-card-body">
            <p className="admin-stat-label">{card.label}</p>
            <p className="admin-stat-value" style={{ color: card.accent }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
