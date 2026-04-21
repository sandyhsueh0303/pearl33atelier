'use client'

import Link from 'next/link'
import {
  formatCategory,
  formatMoney,
  getAvailabilityMeta,
  type ProductWithStats,
} from './productsPageTypes'

interface ProductsTableProps {
  products: ProductWithStats[]
  returnToParam: string
  onDelete: (productId: string, productTitle: string) => void
}

export default function ProductsTable({
  products,
  returnToParam,
  onDelete,
}: ProductsTableProps) {
  return (
    <>
      <div className="admin-card admin-table-card admin-products-table-wrap">
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr className="admin-table-head-row">
              <th>Status</th>
              <th>SKU</th>
              <th>Available</th>
              <th>Title</th>
              <th>Category</th>
              <th>Pearl Type</th>
              <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Total Cost</th>
              <th className="admin-th-right" style={{ whiteSpace: 'nowrap' }}>Sell Price</th>
              <th className="admin-th-right" style={{ minWidth: '140px' }}>Profit</th>
              <th className="admin-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const availabilityMeta = getAvailabilityMeta(product.availability)

              return (
                <tr key={product.id} className="admin-row-divider">
                  <td>
                    <span className={`admin-pill ${product.published ? 'admin-pill-success' : 'admin-pill-warning'}`}>
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="admin-cell-mono">
                    {product.sku || '-'}
                  </td>
                  <td>
                    <span
                      className={availabilityMeta.className}
                      style={{
                        fontSize: '0.875rem',
                        ...availabilityMeta.style,
                      }}
                    >
                      {availabilityMeta.label}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {product.title}
                  </td>
                  <td>
                    <span className="admin-pill admin-pill-lilac" style={{ fontSize: '0.875rem' }}>
                      {product.category ? formatCategory(product.category) : '-'}
                    </span>
                  </td>
                  <td>
                    <span className="admin-pill admin-pill-sky" style={{ fontSize: '0.875rem' }}>
                      {product.pearl_type}
                    </span>
                  </td>
                  <td className="admin-cell-right admin-money admin-money-danger">
                    {formatMoney(product.total_cost)}
                  </td>
                  <td className="admin-cell-right admin-money">
                    {product.sell_price ? formatMoney(product.sell_price) : '-'}
                  </td>
                  <td style={{ minWidth: '140px' }} className="admin-cell-right admin-money">
                    {product.profit !== undefined ? (
                      <span style={{ color: product.profit >= 0 ? '#10B981' : '#EF4444' }}>
                        {formatMoney(product.profit)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="admin-cell-center">
                    <div className="admin-action-group">
                      <Link
                        href={`/admin/products/${product.id}?returnTo=${returnToParam}`}
                        className="admin-btn admin-btn-edit admin-link-btn admin-btn-md"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id, product.title)}
                        className="admin-btn admin-btn-delete admin-btn-md"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-products-mobile-list">
        {products.map((product) => {
          const availabilityMeta = getAvailabilityMeta(product.availability)
          const profitColor = product.profit !== undefined && product.profit < 0 ? '#EF4444' : '#10B981'

          return (
            <article key={product.id} className="admin-card admin-products-mobile-card">
              <div className="admin-products-mobile-card-header">
                <div style={{ minWidth: 0 }}>
                  <h2 className="admin-products-mobile-title">{product.title}</h2>
                  <p className="admin-products-mobile-sku">{product.sku || 'No SKU'}</p>
                </div>
                <div className="admin-products-mobile-badges">
                  <span className={`admin-pill ${product.published ? 'admin-pill-success' : 'admin-pill-warning'}`}>
                    {product.published ? 'Published' : 'Draft'}
                  </span>
                  <span className={availabilityMeta.className} style={availabilityMeta.style}>
                    {availabilityMeta.label}
                  </span>
                </div>
              </div>

              <div className="admin-products-mobile-summary">
                <div className="admin-products-mobile-price">
                  <span className="admin-products-mobile-meta-label">Sell Price</span>
                  <span className="admin-money">{product.sell_price ? formatMoney(product.sell_price) : '-'}</span>
                </div>
                <div className="admin-products-mobile-price">
                  <span className="admin-products-mobile-meta-label">Profit</span>
                  <span className="admin-money" style={{ color: profitColor }}>
                    {product.profit !== undefined ? formatMoney(product.profit) : '-'}
                  </span>
                </div>
              </div>

              <div className="admin-products-mobile-inline-meta">
                <span>{product.category ? formatCategory(product.category) : '-'}</span>
                <span>{product.pearl_type || '-'}</span>
              </div>

              <div className="admin-action-group admin-products-mobile-actions">
                <Link
                  href={`/admin/products/${product.id}?returnTo=${returnToParam}`}
                  className="admin-btn admin-btn-edit admin-link-btn admin-btn-sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(product.id, product.title)}
                  className="admin-btn admin-btn-delete admin-btn-sm"
                >
                  Delete
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
