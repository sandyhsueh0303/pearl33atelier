'use client'

import Link from 'next/link'
import {
  formatCategory,
  formatMoney,
  getAvailabilityMeta,
  type ProductWithStats,
} from './productsPageTypes'
import styles from './ProductsTable.module.css'

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
        <table className={`admin-table ${styles.table}`}>
          <thead>
            <tr className="admin-table-head-row">
              <th>Status</th>
              <th>SKU</th>
              <th>Available</th>
              <th>Title</th>
              <th>Category</th>
              <th>Pearl Type</th>
              <th className={`admin-th-right ${styles.nowrap}`}>Total Cost</th>
              <th className={`admin-th-right ${styles.nowrap}`}>Sell Price</th>
              <th className={`admin-th-right ${styles.profitColumn}`}>Profit</th>
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
                    <span className={`${availabilityMeta.className} ${styles.availabilityPill}`}>
                      {availabilityMeta.label}
                    </span>
                  </td>
                  <td className={styles.titleCell}>
                    {product.title}
                  </td>
                  <td>
                    <span className={`admin-pill admin-pill-lilac ${styles.tablePill}`}>
                      {product.category ? formatCategory(product.category) : '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-pill admin-pill-sky ${styles.tablePill}`}>
                      {product.pearl_type}
                    </span>
                  </td>
                  <td className="admin-cell-right admin-money admin-money-danger">
                    {formatMoney(product.total_cost)}
                  </td>
                  <td className="admin-cell-right admin-money">
                    {product.sell_price ? formatMoney(product.sell_price) : '-'}
                  </td>
                  <td className={`admin-cell-right admin-money ${styles.profitColumn}`}>
                    {product.profit !== undefined ? (
                      <span className={product.profit >= 0 ? styles.profitPositive : styles.profitNegative}>
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
          const profitClass = product.profit !== undefined && product.profit < 0 ? styles.profitNegative : styles.profitPositive

          return (
            <article key={product.id} className="admin-card admin-products-mobile-card">
              <div className="admin-products-mobile-card-header">
                <div className={styles.mobileTitleWrap}>
                  <h2 className="admin-products-mobile-title">{product.title}</h2>
                  <p className="admin-products-mobile-sku">{product.sku || 'No SKU'}</p>
                </div>
                <div className="admin-products-mobile-badges">
                  <span className={`admin-pill ${product.published ? 'admin-pill-success' : 'admin-pill-warning'}`}>
                    {product.published ? 'Published' : 'Draft'}
                  </span>
                  <span className={availabilityMeta.className}>
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
                  <span className={`admin-money ${profitClass}`}>
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
