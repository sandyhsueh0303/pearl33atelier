'use client'

import { useState, useEffect } from 'react'
import { computeProductInventorySummary } from '@pearl33atelier/shared'
import styles from './ProductMaterials.module.css'

interface InventoryItem {
  id: string
  name: string | null
  category: string | null
  cost: number | null
  total_quantity: number
  allocated_quantity: number
  remaining_quantity: number
  internal_note: string | null
}

interface ProductMaterial {
  id: string
  product_id: string
  inventory_item_id: string
  quantity_per_unit: number
  unit_cost_snapshot: number | null
  sort_order: number
  notes: string | null
  inventory_items: InventoryItem
}

interface Props {
  productId: string
  refreshToken?: number
}

interface Product {
  id: string
  title: string
  sell_price: number | null
}

export default function ProductMaterials({ productId, refreshToken = 0 }: Props) {
  const [product, setProduct] = useState<Product | null>(null)
  const [materials, setMaterials] = useState<ProductMaterial[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  
  // Add form state
  const [selectedItemId, setSelectedItemId] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [materialSearch, setMaterialSearch] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')

  const materialCategoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'loose_pearl', label: 'Loose Pearl' },
    { value: 'finished_jewelry', label: 'Finished Jewelry' },
    { value: 'pt900', label: 'Pt900' },
    { value: '925_silver', label: '925 Silver' },
    { value: '18k', label: '18K Gold' },
    { value: 'package', label: 'Packaging' },
    { value: 'shipment', label: 'Shipping' },
  ] as const

  useEffect(() => {
    void loadData()
  }, [productId])

  useEffect(() => {
    if (refreshToken <= 0) return
    void loadData()
  }, [refreshToken])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadProduct(), loadMaterials(), loadInventoryItems()])
    } finally {
      setLoading(false)
    }
  }

  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data.product || data)
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    }
  }

  const loadMaterials = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/materials`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Failed to load materials:', error)
    }
  }

  const loadInventoryItems = async () => {
    try {
      const pageSize = 100
      let page = 1
      const allItems: InventoryItem[] = []

      while (true) {
        const res = await fetch(
          `/api/inventory?page=${page}&pageSize=${pageSize}&status=all&sortBy=date&sortOrder=desc`,
          { cache: 'no-store' }
        )
        if (!res.ok) break
        const data = await res.json()
        const pageItems: InventoryItem[] = data.items || []
        allItems.push(...pageItems)
        if (pageItems.length < pageSize) break
        page += 1
      }

      const dedupedItems = Array.from(new Map(allItems.map((item) => [item.id, item])).values())
      setInventoryItems(dedupedItems)
    } catch (error) {
      console.error('Failed to load inventory:', error)
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId) return

    setAdding(true)
    try {
      const selectedItem = inventoryItems.find(item => item.id === selectedItemId)
      
      const res = await fetch(`/api/products/${productId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory_item_id: selectedItemId,
          quantity_per_unit: parseInt(quantity),
          unit_cost_snapshot: selectedItem?.cost,
          notes
        })
      })

      if (!res.ok) throw new Error('Failed to add material')

      setSelectedItemId('')
      setQuantity('1')
      setNotes('')
      await loadData()
    } catch (error) {
      alert('Add failed: ' + (error instanceof Error ? error.message : ''))
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Delete this material?')) return

    try {
      const res = await fetch(
        `/api/products/${productId}/materials?materialId=${materialId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) throw new Error('Failed to delete')

      await loadData()
    } catch (error) {
      alert('Delete failed')
    }
  }

  const totalMaterialCost = materials.reduce((sum, m) => {
    return sum + (m.quantity_per_unit * (m.unit_cost_snapshot || 0))
  }, 0)
  const sellingPrice = product?.sell_price || 0
  const profit = sellingPrice - totalMaterialCost
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0
  const inventorySummary = computeProductInventorySummary(
    materials.map((material) => ({
      inventory_item_id: material.inventory_item_id,
      quantity_per_unit: material.quantity_per_unit,
      inventory_item: {
        name: material.inventory_items.name,
        total_quantity: material.inventory_items.total_quantity,
        allocated_quantity: material.inventory_items.allocated_quantity,
      },
    }))
  )
  const normalizedSearch = materialSearch.trim().toLowerCase()
  const filteredInventoryItems = inventoryItems.filter((item) => {
    const categoryMatched = categoryFilter === 'all' || item.category === categoryFilter
    const searchMatched =
      normalizedSearch.length === 0 ||
      (item.name || '').toLowerCase().includes(normalizedSearch)
    return categoryMatched && searchMatched
  })

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  const profitToneClass = profit >= 0 ? styles.positive : styles.negative
  const profitCardClass = profit >= 0 ? styles.profitPositive : styles.profitNegative

  return (
    <div className={`admin-bom-card ${styles.card}`}>
      <div className={`admin-bom-stats-grid ${styles.statsGrid}`}>
        <div className={`${styles.statCard} ${styles.costCard}`}>
          <div className={`admin-bom-stat-label ${styles.statLabel} ${styles.costText}`}>Total Cost</div>
          <div className={`admin-bom-stat-value ${styles.statValue} ${styles.costText}`}>${totalMaterialCost.toFixed(2)}</div>
        </div>
        <div className={`${styles.statCard} ${styles.priceCard}`}>
          <div className={`admin-bom-stat-label ${styles.statLabel} ${styles.priceLabel}`}>Sell Price</div>
          <div className={`admin-bom-stat-value ${styles.statValue} ${styles.priceValue}`}>${sellingPrice.toFixed(2)}</div>
        </div>
        <div className={`${styles.statCard} ${profitCardClass}`}>
          <div className={`admin-bom-stat-label ${styles.statLabel} ${profitToneClass}`}>Profit</div>
          <div className={`admin-bom-stat-value ${styles.statValue} ${profitToneClass}`}>${profit.toFixed(2)}</div>
          <div className={`${styles.profitMargin} ${profitToneClass}`}>
            {profitMargin.toFixed(1)}% Profit Margin
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.availableCard}`}>
          <div className={`admin-bom-stat-label ${styles.statLabel} ${styles.availableLabel}`}>Available Units</div>
          <div className={`admin-bom-stat-value ${styles.statValue} ${styles.availableLabel}`}>{inventorySummary.availableQuantity ?? '-'}</div>
          <div className={styles.availableMeta}>
            {inventorySummary.limitingMaterialName
              ? `Limited by ${inventorySummary.limitingMaterialName}`
              : 'Based on current material inventory'}
          </div>
        </div>
      </div>
      <h2 className={styles.title}>
        🧾 BOM Materials List (BOM)
      </h2>

      {/* Materials List */}
      {materials.length > 0 ? (
        <div className={styles.materialsSection}>
          <div className="admin-bom-table-wrap">
            <table className={`admin-table ${styles.table}`}>
              <thead>
                <tr className={styles.tableHeaderRow}>
                  <th className={`${styles.tableCell} ${styles.leftCell}`}>Name</th>
                  <th className={`${styles.tableCell} ${styles.rightCell}`}>Qty/Unit</th>
                  <th className={`${styles.tableCell} ${styles.rightCell}`}>Unit Cost</th>
                  <th className={`${styles.tableCell} ${styles.rightCell}`}>Subtotal</th>
                  <th className={`${styles.tableCell} ${styles.rightCell}`}>Remaining</th>
                  <th className={`${styles.tableCell} ${styles.leftCell}`}>Notes</th>
                  <th className={`${styles.tableCell} ${styles.centerCell}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      {material.inventory_items.name || '-'}
                    </td>
                    <td className={`${styles.tableCell} ${styles.rightCell} ${styles.mediumCell}`}>
                      {material.quantity_per_unit}
                    </td>
                    <td className={`${styles.tableCell} ${styles.rightCell}`}>
                      ${(material.unit_cost_snapshot || 0).toFixed(2)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.rightCell} ${styles.subtotalCell}`}>
                      ${(material.quantity_per_unit * (material.unit_cost_snapshot || 0)).toFixed(2)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.rightCell}`}>
                      <span className={`${styles.remainingPill} ${material.inventory_items.remaining_quantity > 0 ? styles.positivePill : styles.negativePill}`}>
                        {material.inventory_items.remaining_quantity}
                      </span>
                    </td>
                    <td className={`${styles.tableCell} ${styles.noteCell}`}>
                      {material.notes || material.inventory_items.internal_note || '-'}
                    </td>
                    <td className={`${styles.tableCell} ${styles.centerCell}`}>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className={`admin-btn admin-btn-delete ${styles.deleteButton}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td colSpan={3} className={`${styles.tableCell} ${styles.rightCell}`}>
                    Total material cost:
                  </td>
                  <td className={`${styles.tableCell} ${styles.rightCell} ${styles.totalCell}`}>
                    ${totalMaterialCost.toFixed(2)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="admin-bom-mobile-list">
            {materials.map((material) => (
              <article key={material.id} className="admin-bom-mobile-card">
                <div className="admin-bom-mobile-header">
                  <div className="admin-bom-mobile-name">{material.inventory_items.name || '-'}</div>
                  <span
                    className={`admin-bom-mobile-remaining ${material.inventory_items.remaining_quantity > 0 ? styles.positivePill : styles.negativePill}`}
                  >
                    Rem: {material.inventory_items.remaining_quantity}
                  </span>
                </div>

                <div className="admin-bom-mobile-grid">
                  <div>
                    <div className="admin-bom-mobile-label">Qty/Unit</div>
                    <div className="admin-bom-mobile-value">{material.quantity_per_unit}</div>
                  </div>
                  <div>
                    <div className="admin-bom-mobile-label">Unit Cost</div>
                    <div className="admin-bom-mobile-value">${(material.unit_cost_snapshot || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="admin-bom-mobile-label">Subtotal</div>
                    <div className={`admin-bom-mobile-value ${styles.mobileSubtotal}`}>
                      ${(material.quantity_per_unit * (material.unit_cost_snapshot || 0)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="admin-bom-mobile-label">Notes</div>
                    <div className="admin-bom-mobile-note">{material.notes || material.inventory_items.internal_note || '-'}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="admin-btn admin-btn-delete admin-bom-mobile-delete"
                >
                  Delete
                </button>
              </article>
            ))}

            <div className="admin-bom-mobile-total">
              <span>Total material cost</span>
              <strong>${totalMaterialCost.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          No materials added yet
        </div>
      )}

      {/* Add Material Form */}
      <div className={`admin-bom-add-card ${styles.addCard}`}>
        <h3 className={styles.addTitle}>
          ➕ Add Material
        </h3>
        <form onSubmit={handleAddMaterial}>
          <div className={`admin-bom-add-grid ${styles.addGrid}`}>
            <div>
              <label className={styles.label} htmlFor="product-material-category-filter">
                Category
              </label>
              <select
                id="product-material-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`${styles.control} ${styles.selectControl}`}
              >
                {materialCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={styles.label} htmlFor="product-material-search">
                Search
              </label>
              <input
                id="product-material-search"
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Search material name..."
                className={styles.control}
              />
            </div>

            <div>
              <label className={styles.label} htmlFor="product-material-item">
                Select inventory material
              </label>
              <select
                id="product-material-item"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
                className={`${styles.control} ${styles.selectControl}`}
              >
                <option value="">-- Select material --</option>
                {filteredInventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name || 'Unnamed'} ({item.category || 'uncategorized'}) - Remaining: {item.remaining_quantity} - ${item.cost?.toFixed(2) || '0.00'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={styles.label} htmlFor="product-material-quantity">
                Qty/Unit
              </label>
              <input
                id="product-material-quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
                className={styles.control}
              />
            </div>

            <div>
              <label className={styles.label} htmlFor="product-material-notes">
                Notes (Optional)
              </label>
              <input
                id="product-material-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Main pearl"
                className={styles.control}
              />
            </div>

            <button
              type="submit"
              disabled={adding || !selectedItemId}
              className={`admin-bom-add-button ${styles.addButton}`}
            >
              {adding ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
