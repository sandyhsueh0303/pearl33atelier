'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  inventoryId?: string
}

export default function InventoryForm({ inventoryId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(!!inventoryId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [vendor, setVendor] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [cost, setCost] = useState('')
  const [onHand, setOnHand] = useState('')
  const [notes, setNotes] = useState('')
  
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
      
      setVendor(data.vendor || '')
      setPurchaseDate(data.purchase_date || new Date().toISOString().split('T')[0])
      setCost(data.cost?.toString() || '')
      setOnHand(data.on_hand?.toString() || '')
      setNotes(data.internal_note || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate total value
  const totalValue = (parseFloat(cost) || 0) * (parseInt(onHand) || 0)
  
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
          vendor: vendor || null,
          purchase_date: purchaseDate || null,
          cost: cost ? parseFloat(cost) : null,
          on_hand: onHand ? parseInt(onHand) : 0,
          internal_note: notes || null
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save inventory')
      }
      
      router.push('/admin/inventory')
      router.refresh()
      
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
          載入中...
        </div>
      </main>
    )
  }
  
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/admin/inventory"
          style={{
            color: '#1976d2',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            display: 'inline-block'
          }}
        >
          ← 返回庫存列表
        </Link>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
          {inventoryId ? '編輯庫存' : '新增庫存'}
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
              <strong>錯誤:</strong> {error}
            </div>
          )}
          
          {/* Vendor */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              供應商
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="例如：ABC 珍珠公司"
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
          
          {/* Purchase Date */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              採購日期
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Unit Cost */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                單價 <span style={{ color: '#c00' }}>*</span>
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
            
            {/* Quantity */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                數量 <span style={{ color: '#c00' }}>*</span>
              </label>
              <input
                type="number"
                required
                value={onHand}
                onChange={(e) => setOnHand(e.target.value)}
                placeholder="件數"
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
                總價值
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0d47a1' }}>
                ${totalValue.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1976d2', marginTop: '0.5rem' }}>
                {onHand} 件 × ${cost} 每件
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
              備註
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="例如：白色 Akoya 珍珠、AA+ 等級、8mm"
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
              包含珍珠類型、尺寸、等級或其他詳細資訊
            </div>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <button
              type="button"
              onClick={() => router.back()}
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
              取消
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
              {saving ? '儲存中...' : inventoryId ? '更新庫存' : '新增庫存'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}