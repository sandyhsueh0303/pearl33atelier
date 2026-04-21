'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Props {
  inventoryId?: string
}

export default function InventoryForm({ inventoryId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || ''
  const backToListPath = returnTo.startsWith('/admin/inventory') ? returnTo : '/admin/inventory'
  const [loading, setLoading] = useState(!!inventoryId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState('loose_pearl')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [cost, setCost] = useState('')
  const [totalQuantity, setTotalQuantity] = useState('')
  const [allocatedQuantity, setAllocatedQuantity] = useState('')
  const [notes, setNotes] = useState('')
  
  // Category options
  const CATEGORIES = [
    { value: 'loose_pearl', label: 'Loose Pearl' },
    { value: 'finished_jewelry', label: 'Finished Jewelry' },
    { value: 'pt900', label: 'Pt900 Platinum' },
    { value: '925_silver', label: '925 Silver' },
    { value: '18k', label: '18K Gold' },
    { value: 'package', label: 'Packaging' },
    { value: 'shipment', label: 'Shipping' }
  ]
  
  // Load existing inventory if editing
  useEffect(() => {
    if (inventoryId) {
      loadInventory()
    }
  }, [inventoryId])
  
  const loadInventory = async () => {
    try {
      const response = await fetch(`/api/inventory/${inventoryId}`)
      if (!response.ok) throw new Error('Failed to load inventory')
      const data = await response.json()
      
      setName(data.name || '')
      setCategory(data.category || 'loose_pearl')
      setPurchaseDate(data.purchase_date || new Date().toISOString().split('T')[0])
      setCost(data.cost?.toString() || '')
      setTotalQuantity(data.total_quantity?.toString() || '')
      setAllocatedQuantity(data.allocated_quantity?.toString() || '0')
      setNotes(data.internal_note || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate total value
  const totalValue = (parseFloat(cost) || 0) * (parseInt(totalQuantity) || 0)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      const url = inventoryId 
        ? `/api/inventory/${inventoryId}`
        : '/api/inventory'
      
      const method = inventoryId ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          category: category,
          purchase_date: purchaseDate || null,
          cost: cost ? parseFloat(cost) : null,
          total_quantity: totalQuantity ? parseInt(totalQuantity) : 0,
          allocated_quantity: allocatedQuantity ? parseInt(allocatedQuantity) : 0,
          internal_note: notes || null
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save inventory')
      }
      
      router.push(backToListPath)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <main className="admin-page admin-page-narrow">
        <div className="admin-empty-state">
          Loading...
        </div>
      </main>
    )
  }
  
  return (
    <main className="admin-page admin-page-narrow">
      <div className="admin-page-header">
        <div className="admin-page-title-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            href={backToListPath}
            className="admin-link-back"
          >
            ← Back to inventory list
          </Link>
          <h1 className="admin-page-title">
            {inventoryId ? 'Edit Inventory' : 'Add Inventory'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-card admin-form-card">
          {error && (
            <div className="admin-error-banner">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="admin-form-section">
            <label className="admin-form-label">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Akoya 7.5mm Lot A"
              className="admin-control"
            />
          </div>
          
          <div className="admin-form-section">
            <label className="admin-form-label">
              Category <span className="admin-form-required">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="admin-control"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="admin-form-section">
            <label className="admin-form-label">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="admin-control"
            />
          </div>
          
          <div className="admin-form-grid-3">
            <div>
              <label className="admin-form-label">
                Unit Cost <span className="admin-form-required">*</span>
              </label>
              <div className="admin-input-prefix-wrap">
                <span className="admin-input-prefix">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="admin-control admin-control-with-prefix"
                />
              </div>
            </div>
            
            <div>
              <label className="admin-form-label">
                Total Quantity in Stock <span className="admin-form-required">*</span>
              </label>
              <input
                type="number"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                placeholder="Total units"
                className="admin-control"
              />
            </div>
            
            <div>
              <label className="admin-form-label">
                Allocated Quantity
              </label>
              <input
                type="number"
                value={allocatedQuantity}
                onChange={(e) => setAllocatedQuantity(e.target.value)}
                placeholder="0"
                className="admin-control"
              />
            </div>
          </div>
          
          {totalValue > 0 && (
            <div className="admin-value-panel">
              <div className="admin-value-panel-label">
                Total Value
              </div>
              <div className="admin-value-panel-amount">
                ${totalValue.toFixed(2)}
              </div>
              <div className="admin-value-panel-meta">
                {totalQuantity} units x ${cost} per unit
              </div>
            </div>
          )}
          
          <div className="admin-form-section" style={{ marginBottom: '2rem' }}>
            <label className="admin-form-label">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g. White Akoya pearl, AA+ grade, 8mm"
              className="admin-control"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div className="admin-form-help">
              Include pearl type, size, grade, or other details
            </div>
          </div>
          
          <div className="admin-form-actions">
            <button
              type="button"
              onClick={() => router.push(backToListPath)}
              className="admin-btn admin-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary-solid"
            >
              {saving ? 'Saving...' : inventoryId ? 'Update Inventory' : 'Add Inventory'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
