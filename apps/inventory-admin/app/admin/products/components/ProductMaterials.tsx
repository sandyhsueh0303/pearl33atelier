'use client'

import { useState, useEffect } from 'react'

interface InventoryItem {
  id: string
  name: string | null
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

interface Props {
  productId: string
}

export default function ProductMaterials({ productId }: Props) {
  const [materials, setMaterials] = useState<ProductMaterial[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  
  // Add form state
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadMaterials()
    loadInventoryItems()
  }, [productId])

  const loadMaterials = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/materials`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Failed to load materials:', error)
    } finally {
      setLoading(false)
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

      // Reset form
      setSelectedItemId('')
      setQuantity('1')
      setNotes('')
      
      // Reload materials
      await loadMaterials()
      alert('Material added')
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

      await loadMaterials()
      alert('Material deleted')
    } catch (error) {
      alert('Delete failed')
    }
  }

  const totalMaterialCost = materials.reduce((sum, m) => {
    return sum + (m.quantity_per_unit * (m.unit_cost_snapshot || 0))
  }, 0)

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🧾 BOM Materials List (BOM)
      </h2>

      {/* Materials List */}
      {materials.length > 0 ? (
        <div style={{ marginBottom: '2rem' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Qty/Unit</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Unit Cost</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Subtotal</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Notes</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>
                    {material.inventory_items.name || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                    {material.quantity_per_unit}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    ${(material.unit_cost_snapshot || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#1976d2' }}>
                    ${(material.quantity_per_unit * (material.unit_cost_snapshot || 0)).toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: material.inventory_items.total_quantity > 0 ? '#e8f5e9' : '#ffebee',
                      color: material.inventory_items.total_quantity > 0 ? '#10B981' : '#EF4444',
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
                      className="admin-btn admin-btn-delete"
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Total material cost:
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#1976d2', fontSize: '1.125rem' }}>
                  ${totalMaterialCost.toFixed(2)}
                </td>
                <td colSpan={3}></td>
              </tr>
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
          No materials added yet
        </div>
      )}

      {/* Add Material Form */}
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
          ➕ Add Material
        </h3>
        <form onSubmit={handleAddMaterial}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Select inventory material
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
                <option value="">-- Select material --</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name || 'Unnamed'} - Stock: {item.total_quantity} - ${item.cost?.toFixed(2) || '0.00'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Qty/Unit
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
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
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Main pearl"
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
              {adding ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
