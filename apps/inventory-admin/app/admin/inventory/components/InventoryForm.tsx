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
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading...
        </div>
      </main>
    )
  }
  
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href={backToListPath}
          style={{
            color: '#1976d2',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            display: 'inline-block'
          }}
        >
          ← Back to inventory list
        </Link>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
          {inventoryId ? 'Edit Inventory' : 'Add Inventory'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}>
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #c00',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              color: '#c00'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {/* Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Akoya 7.5mm Lot A"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Category */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              Category <span style={{ color: '#c00' }}>*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Purchase Date */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Grid for Cost and Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Unit Cost */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Unit Cost <span style={{ color: '#c00' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666'
                }}>
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            
            {/* Quantity On Hand */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Total Quantity in Stock <span style={{ color: '#c00' }}>*</span>
              </label>
              <input
                type="number"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                placeholder="Total units"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* Allocated Quantity */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Allocated Quantity
              </label>
              <input
                type="number"
                value={allocatedQuantity}
                onChange={(e) => setAllocatedQuantity(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          
          {/* Total Value Display */}
          {totalValue > 0 && (
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#1565c0', marginBottom: '0.25rem' }}>
                Total Value
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0d47a1' }}>
                ${totalValue.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1976d2', marginTop: '0.5rem' }}>
                {totalQuantity} units x ${cost} per unit
              </div>
            </div>
          )}
          
          {/* Notes */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g. White Akoya pearl, AA+ grade, 8mm"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
              Include pearl type, size, grade, or other details
            </div>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <button
              type="button"
              onClick={() => router.push(backToListPath)}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: saving ? '#90caf9' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {saving ? 'Saving...' : inventoryId ? 'Update Inventory' : 'Add Inventory'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
