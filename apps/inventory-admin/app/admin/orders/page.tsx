'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'

interface OrderRecord {
  id: string
  order_number: string | null
  status: string
  customer_name: string | null
  customer_email: string | null
  total_amount_cents: number
  currency: string | null
  tracking_number: string | null
  shipping_carrier: string | null
  shipped_at: string | null
  confirmation_email_sent_at: string | null
  shipping_email_sent_at: string | null
  created_at: string
}

type DraftMap = Record<
  string,
  {
    tracking_number: string
    shipping_carrier: string
    shipped_at: string
  }
>

function formatCurrency(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function toDatetimeLocalValue(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [drafts, setDrafts] = useState<DraftMap>({})
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      setError(null)
      const params = new URLSearchParams()
      if (appliedSearch) params.set('search', appliedSearch)

      const response = await fetch(`/api/orders?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch orders')

      const data = await response.json()
      const nextOrders = (data.orders || []) as OrderRecord[]
      setOrders(nextOrders)
      setDrafts(
        Object.fromEntries(
          nextOrders.map((order) => [
            order.id,
            {
              tracking_number: order.tracking_number || '',
              shipping_carrier: order.shipping_carrier || '',
              shipped_at: toDatetimeLocalValue(order.shipped_at),
            },
          ])
        )
      )
    } catch (err) {
      console.error(err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchOrders()
  }, [appliedSearch])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const orderCounts = useMemo(() => {
    return {
      total: orders.length,
      paid: orders.filter((order) => order.status === 'paid' || order.status === 'processing').length,
      shipped: orders.filter((order) => order.status === 'shipped').length,
      pendingShipment: orders.filter((order) => order.status !== 'shipped').length,
    }
  }, [orders])

  const hasSearch = appliedSearch.length > 0

  const updateDraft = (orderId: string, field: keyof DraftMap[string], value: string) => {
    setDrafts((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (orderId: string) => {
    const draft = drafts[orderId]
    if (!draft?.tracking_number.trim()) {
      setError('Tracking number is required before sending the shipping email.')
      return
    }

    setSubmittingId(orderId)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_number: draft.tracking_number,
          shipping_carrier: draft.shipping_carrier,
          shipped_at: draft.shipped_at ? new Date(draft.shipped_at).toISOString() : undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order shipment')
      }

      if (data.email?.skipped && data.email?.reason !== 'already_sent') {
        setNotice('Order marked as shipped. Email was skipped, so please review the send details.')
      } else if (data.email?.skipped && data.email?.reason === 'already_sent') {
        setNotice('Order updated. Shipping email was already sent previously.')
      } else {
        setNotice('Order marked as shipped and shipping email sent.')
      }

      await fetchOrders()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to update order shipment')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="Orders"
        onRefresh={fetchOrders}
        refreshLabel="Reload orders list"
        refreshing={loading}
        description="Review paid orders, add shipment details, and send shipping confirmations from one place."
      />

      {error && <div className="admin-error-banner"><strong>Error:</strong> {error}</div>}
      {notice && <div className="admin-banner admin-banner-success">{notice}</div>}

      <div className="admin-stats-row">
        <div className="admin-stats-grid">
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">Total Orders</div>
            <div className="admin-stat-value" style={{ color: '#C9A961' }}>
              {orderCounts.total}
            </div>
          </div>
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">Paid / Processing</div>
            <div className="admin-stat-value" style={{ color: '#2C5F8D' }}>
              {orderCounts.paid}
            </div>
          </div>
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">Pending Shipment</div>
            <div className="admin-stat-value" style={{ color: '#D97706' }}>
              {orderCounts.pendingShipment}
            </div>
          </div>
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">Shipped</div>
            <div className="admin-stat-value" style={{ color: '#10B981' }}>
              {orderCounts.shipped}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card admin-filter-panel">
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#666', marginBottom: '1rem' }}>
          🔍 Search Orders
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setAppliedSearch(search.trim())
          }}
          className="admin-filter-row"
        >
          <div className="admin-filter-item-wide">
            <label className="admin-filter-label">Find by order, customer, email, or tracking</label>
            <input
              className="admin-control"
              placeholder="Search order number, customer, email, or tracking..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-secondary">Search</button>
          {hasSearch && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setSearch('')
                setAppliedSearch('')
              }}
            >
              Reset
            </button>
          )}
        </form>
        <div className="admin-filter-results">
          Showing <strong>{orders.length}</strong> orders
          {hasSearch ? ` • Search: "${appliedSearch}"` : ''}
        </div>
      </div>

      <div className="admin-card admin-table-card" style={{ padding: '1.5rem' }}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-title">Order Queue</div>
            <div className="admin-section-subtitle">
              Update shipment details and confirm which orders have already been fulfilled.
            </div>
          </div>
          <div className="admin-section-meta">
            {hasSearch ? `Filtered by "${appliedSearch}"` : 'Showing the latest matching orders'}
          </div>
        </div>
        {loading ? (
          <div className="admin-empty-state">
            <p className="admin-empty-title">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-empty-title">No orders found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr className="admin-table-head-row">
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="admin-th-right">Total</th>
                  <th>Tracking</th>
                  <th>Shipment</th>
                  <th className="admin-th-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const draft = drafts[order.id] || {
                    tracking_number: '',
                    shipping_carrier: '',
                    shipped_at: '',
                  }

                  return (
                    <tr key={order.id} className="admin-row-divider">
                      <td className="admin-cell-sm">
                        <div style={{ fontWeight: 700 }}>{order.order_number || order.id.slice(0, 8)}</div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="admin-cell-sm">
                        <div style={{ fontWeight: 600 }}>{order.customer_name || 'No name'}</div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>{order.customer_email || 'No email'}</div>
                      </td>
                      <td className="admin-cell-sm">
                        <span style={{
                          display: 'inline-block',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '999px',
                          background:
                            order.status === 'shipped'
                              ? '#DCFCE7'
                              : order.status === 'paid' || order.status === 'processing'
                              ? '#DBEAFE'
                              : '#F3F4F6',
                          color:
                            order.status === 'shipped'
                              ? '#166534'
                              : order.status === 'paid' || order.status === 'processing'
                              ? '#1D4ED8'
                              : '#4B5563',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="admin-cell-right admin-money admin-cell-sm">
                        {formatCurrency(order.total_amount_cents, order.currency || 'usd')}
                      </td>
                      <td className="admin-cell-sm" style={{ minWidth: '260px' }}>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          <input
                            className="admin-control"
                            placeholder="Carrier"
                            value={draft.shipping_carrier}
                            onChange={(event) => updateDraft(order.id, 'shipping_carrier', event.target.value)}
                          />
                          <input
                            className="admin-control"
                            placeholder="Tracking number"
                            value={draft.tracking_number}
                            onChange={(event) => updateDraft(order.id, 'tracking_number', event.target.value)}
                          />
                          <input
                            className="admin-control"
                            type="datetime-local"
                            value={draft.shipped_at}
                            onChange={(event) => updateDraft(order.id, 'shipped_at', event.target.value)}
                          />
                        </div>
                      </td>
                      <td className="admin-cell-sm">
                        {order.shipped_at ? (
                          <div>
                            <div style={{ color: '#166534', fontWeight: 700 }}>Shipped</div>
                            <div style={{ color: '#666', fontSize: '0.8rem' }}>
                              {new Date(order.shipped_at).toLocaleString()}
                            </div>
                            {order.shipping_carrier || order.tracking_number ? (
                              <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                                {[order.shipping_carrier, order.tracking_number].filter(Boolean).join(' • ')}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ color: '#666' }}>Pending</span>
                        )}
                      </td>
                      <td className="admin-cell-center">
                        <button
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          style={{
                            whiteSpace: 'nowrap',
                            minWidth: '150px',
                            opacity: submittingId === order.id ? 0.7 : 1,
                          }}
                          onClick={() => void handleSubmit(order.id)}
                          disabled={submittingId === order.id}
                        >
                          {submittingId === order.id ? 'Saving...' : 'Mark as Shipped'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
