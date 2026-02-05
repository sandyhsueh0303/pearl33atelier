'use client'

import { useState, useEffect } from 'react'

interface InventoryItem {
  id: string
  vendor: string | null
  cost: number | null
  total_quantity: number
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

interface Product {
  id: string
  title: string
  sell_price: number | null
}

interface Props {
  productId: string
}

export default function ProductCostAnalysis({ productId }: Props) {
  const [product, setProduct] = useState<Product | null>(null)
  const [materials, setMaterials] = useState<ProductMaterial[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Add material form state
  const [adding, setAdding] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    try {
      await Promise.all([
        loadProduct(),
        loadMaterials(),
        loadInventoryItems()
      ])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        const product = data.product || data
        setProduct(product)
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
      const res = await fetch('/api/inventory')
      if (res.ok) {
        const data = await res.json()
        setInventoryItems(data.items || [])
      }
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
      
      await loadMaterials()
      alert('材料已新增')
    } catch (error) {
      alert('新增失敗: ' + (error instanceof Error ? error.message : ''))
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('確定要刪除這個材料嗎？')) return

    try {
      const res = await fetch(
        `/api/products/${productId}/materials?materialId=${materialId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) throw new Error('Failed to delete')

      await loadMaterials()
      alert('材料已刪除')
    } catch (error) {
      alert('刪除失敗')
    }
  }

  // Calculate costs
  const totalCost = materials.reduce((sum, m) => {
    return sum + (m.quantity_per_unit * (m.unit_cost_snapshot || 0))
  }, 0)

  const sellingPrice = product?.sell_price || 0
  const profit = sellingPrice - totalCost
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>載入中...</div>
  }

  return (
    <>
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          borderLeft: '4px solid #f44336'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#c62828', fontWeight: '500', marginBottom: '0.5rem' }}>
            💰 總成本
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f44336' }}>
            ${totalCost.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#c62828', marginTop: '0.5rem' }}>
            包含所有材料、配件、包裝
          </div>
        </div>

        <div style={{
          padding: '2rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          borderLeft: '4px solid #2196f3'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#1565c0', fontWeight: '500', marginBottom: '0.5rem' }}>
            💵 售價
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2196f3' }}>
            ${sellingPrice.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1565c0', marginTop: '0.5rem' }}>
            產品定價
          </div>
        </div>

        <div style={{
          padding: '2rem',
          backgroundColor: profit >= 0 ? '#e8f5e9' : '#ffebee',
          borderRadius: '8px',
          borderLeft: '4px solid ' + (profit >= 0 ? '#4caf50' : '#f44336')
        }}>
          <div style={{ 
            fontSize: '0.875rem', 
            color: profit >= 0 ? '#2e7d32' : '#c62828', 
            fontWeight: '500', 
            marginBottom: '0.5rem' 
          }}>
            {profit >= 0 ? '💚 利潤' : '⚠️ 虧損'}
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: profit >= 0 ? '#4caf50' : '#f44336'
          }}>
            ${profit.toFixed(2)}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: profit >= 0 ? '#2e7d32' : '#c62828', 
            marginTop: '0.5rem',
            fontWeight: '600'
          }}>
            {profitMargin.toFixed(1)}% 利潤率
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          🧾 產品材料清單 (BOM)
        </h2>

        {materials.length > 0 ? (
          <div style={{ marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>供應商</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>數量/件</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>單價</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>小計</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>庫存</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>備註</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {material.inventory_items.vendor || '-'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                      {material.quantity_per_unit}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      ${(material.unit_cost_snapshot || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#f44336' }}>
                      ${(material.quantity_per_unit * (material.unit_cost_snapshot || 0)).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: material.inventory_items.total_quantity > 0 ? '#e8f5e9' : '#ffebee',
                        color: material.inventory_items.total_quantity > 0 ? '#2e7d32' : '#c62828',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {material.inventory_items.total_quantity}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                      {material.notes || material.inventory_items.internal_note || '-'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#ffebee',
                          color: '#c62828',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '2rem',
            color: '#666'
          }}>
            尚未新增任何材料
          </div>
        )}

        {/* Add Material Form */}
        <div style={{ 
          padding: '1.5rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
            ➕ 新增材料
          </h3>
          <form onSubmit={handleAddMaterial}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  選擇庫存材料
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">-- 選擇材料 --</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.vendor || '未命名'} - 庫存: {item.total_quantity} - ${item.cost?.toFixed(2) || '0.00'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  數量/件
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  備註 (選填)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例：主珍珠"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={adding || !selectedItemId}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: adding ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: adding ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                {adding ? '新增中...' : '新增材料'}
              </button>
            </div>
          </form>
        </div>

        {/* Tip for adding costs */}
        {materials.length > 0 && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            border: '1px solid #4caf50',
            fontSize: '0.875rem',
            color: '#2e7d32'
          }}>
            <strong>💡 提示：</strong> 所有成本項目（珍珠、配件、包裝、運費、人工等）都可以加入庫存清單，然後在這裡選擇。這樣系統會自動計算總成本！
          </div>
        )}
      </div>
    </>
  )
}
