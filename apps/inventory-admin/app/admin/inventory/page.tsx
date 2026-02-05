'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface InventoryItem {
  id: string
  vendor: string | null
  purchase_date: string | null
  cost: number | null
  on_hand: number
  reserved: number
  internal_note: string | null
  created_at: string
  updated_at: string
}

interface InventorySummary {
  total_items: number
  total_quantity: number
  available_quantity: number
  total_value: number
  remaining_value: number
}

export default function InventoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [summary, setSummary] = useState<InventorySummary>({
    total_items: 0,
    total_quantity: 0,
    available_quantity: 0,
    total_value: 0,
    remaining_value: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInventory()
    
    // Listen for focus event to reload when returning to this page
    const handleFocus = () => {
      loadInventory()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadInventory = async () => {
    try {
      const response = await fetch('/api/inventory', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) throw new Error('Failed to load inventory')
      const data = await response.json()
      setItems(data.items || [])
      setSummary(data.summary || summary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0 }}>庫存管理</h1>
          <button
            onClick={() => {
              setLoading(true)
              router.refresh()
              loadInventory()
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
            title="重新載入庫存列表"
          >
            🔄 刷新
          </button>
        </div>
        <Link
          href="/admin/inventory/new"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1976d2',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          + 新增庫存
        </Link>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #c00',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>錯誤:</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>總項目</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
            {summary.total_items}
          </p>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>總數量</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32', margin: 0 }}>
            {summary.total_quantity}
          </p>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>可用數量</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>
            {summary.available_quantity}
          </p>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem', 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>總價值</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef6c00', margin: 0 }}>
            ${summary.total_value.toFixed(2)}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ 
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>
            尚無庫存項目
          </p>
          <Link
            href="/admin/inventory/new"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            建立第一個庫存項目
          </Link>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>供應商</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>採購日期</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>單價</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>可用</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>已用</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>總計</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>剩餘價值</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const quantityTotal = item.on_hand + item.reserved
                const unitCost = item.cost || 0
                const remainingValue = item.on_hand * unitCost
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>
                        {item.vendor || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#666' }}>
                      {item.purchase_date 
                        ? new Date(item.purchase_date).toLocaleDateString('zh-TW')
                        : '-'
                      }
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                      ${unitCost.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {item.on_hand}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#666' }}>
                      {item.reserved}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>
                      {quantityTotal}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#1976d2' }}>
                      ${remainingValue.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Link
                        href={`/admin/inventory/${item.id}`}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}