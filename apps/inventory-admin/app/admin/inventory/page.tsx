'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface InventoryItem {
  id: string
  vendor: string | null
  purchase_date: string | null
  cost: number | null
  total_quantity: number
  allocated_quantity: number
  internal_note: string | null
  category: string | null
  created_at: string
  updated_at: string
}

// Category options
const CATEGORIES = [
  { value: 'pearl', label: 'Pearl (珍珠)', color: '#e3f2fd', textColor: '#1565c0' },
  { value: 'pt900', label: 'Pt900 (鉑金900)', color: '#f3e5f5', textColor: '#7b1fa2' },
  { value: '925_silver', label: '925 Silver (925純銀)', color: '#e8f5e9', textColor: '#2e7d32' },
  { value: '18k', label: '18K Gold (18K金)', color: '#fff3e0', textColor: '#e65100' },
  { value: 'package', label: 'Package (包裝)', color: '#fce4ec', textColor: '#c2185b' },
  { value: 'shipment', label: 'Shipment (運費)', color: '#fff9c4', textColor: '#f57f17' }
] as const

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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'quantity'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const vendor = (item.vendor || '').toLowerCase()
        const notes = (item.internal_note || '').toLowerCase()
        if (!vendor.includes(query) && !notes.includes(query)) {
          return false
        }
      }
      
      // Category filter
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'date') {
        const dateA = a.purchase_date ? new Date(a.purchase_date).getTime() : 0
        const dateB = b.purchase_date ? new Date(b.purchase_date).getTime() : 0
        comparison = dateA - dateB
      } else if (sortBy === 'value') {
        const valueA = (a.total_quantity + a.allocated_quantity) * (a.cost || 0)
        const valueB = (b.total_quantity + b.allocated_quantity) * (b.cost || 0)
        comparison = valueA - valueB
      } else if (sortBy === 'quantity') {
        const qtyA = a.total_quantity + a.allocated_quantity
        const qtyB = b.total_quantity + b.allocated_quantity
        comparison = qtyA - qtyB
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const hasFilters = searchQuery !== '' || filterCategory !== 'all'
  const resetFilters = () => {
    setSearchQuery('')
    setFilterCategory('all')
    setSortBy('date')
    setSortOrder('desc')
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0 }}>庫存管理</h1>
          <button
            onClick={async () => {
              console.log('🔄 刷新按鈕被點擊')
              setLoading(true)
              setError(null)
              try {
                await loadInventory()
                console.log('✅ 庫存列表已更新')
              } catch (e) {
                console.error('❌ 刷新失敗:', e)
                setError('刷新失敗，請重試')
              }
            }}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#e0e0e0' : '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            title="重新載入庫存列表"
          >
            {loading ? '⏳ 載入中...' : '🔄 刷新'}
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

      {/* Search and Filter Controls */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              🔍 搜尋供應商或備註
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入供應商名稱或備註..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: '0 1 220px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              🏷️ Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ flex: '0 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              📊 排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'value' | 'quantity')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="date">採購日期</option>
              <option value="value">總價值</option>
              <option value="quantity">數量</option>
            </select>
          </div>

          {/* Sort Order */}
          <div style={{ flex: '0 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              ↕️ 順序
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="desc">降冪 ↓</option>
              <option value="asc">升冪 ↑</option>
            </select>
          </div>

          {/* Reset Button */}
          {hasFilters && (
            <div style={{ flex: '0 0 auto', marginTop: 'auto' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', visibility: 'hidden' }}>
                &nbsp;
              </label>
              <button
                onClick={resetFilters}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                🔄 重置
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          顯示 <strong>{filteredItems.length}</strong> / {items.length} 項庫存
        </div>
      </div>

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

      {filteredItems.length === 0 ? (
        <div style={{ 
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>
            {items.length === 0 ? '尚無庫存項目' : '沒有符合條件的庫存項目'}
          </p>
          {items.length === 0 ? (
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
          ) : (
            <button
              onClick={resetFilters}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              清除篩選條件
            </button>
          )}
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
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
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
              {filteredItems.map((item) => {
                const quantityTotal = item.total_quantity + item.allocated_quantity
                const unitCost = item.cost || 0
                const remainingValue = item.total_quantity * unitCost
                const categoryInfo = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[0]
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>
                        {item.vendor || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: categoryInfo.color,
                        color: categoryInfo.textColor,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {categoryInfo.label.split(' ')[0]}
                      </span>
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
                        {item.total_quantity}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#666' }}>
                      {item.allocated_quantity}
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