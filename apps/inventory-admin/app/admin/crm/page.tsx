'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Json } from '@pearl33atelier/shared/types'
import AdminPageHeader from '../components/AdminPageHeader'

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'archived'

interface CrmLead {
  id: string
  name: string
  email: string
  phone: string | null
  source: string
  subject: string | null
  message: string | null
  quiz_result: string | null
  coupon_code: string | null
  coupon_amount_off_cents: number | null
  stripe_coupon_id: string | null
  stripe_promotion_code_id: string | null
  quiz_answers: Json
  status: LeadStatus
  metadata: Json
  created_at: string
  updated_at: string
}

const statuses: Array<{ value: LeadStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'archived', label: 'Archived' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatCouponValue(cents: number | null) {
  if (!cents) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatSource(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatQuizAnswers(value: Json) {
  if (!Array.isArray(value) || value.length === 0) return '-'
  return value.map((answer) => String(answer).replace('-', ' ')).join(', ')
}

export default function CrmPage() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [status, setStatus] = useState<LeadStatus | 'all'>('all')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (appliedSearch) params.set('search', appliedSearch)
      if (status !== 'all') params.set('status', status)

      const response = await fetch(`/api/crm/leads?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load CRM leads')
      }

      setLeads((data.leads || []) as CrmLead[])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to load CRM leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchLeads()
  }, [appliedSearch, status])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const leadCounts = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === 'new').length,
      pearlFinder: leads.filter((lead) => lead.source === 'pearl_finder_quiz').length,
      converted: leads.filter((lead) => lead.status === 'converted').length,
    }
  }, [leads])

  const updateLeadStatus = async (leadId: string, nextStatus: LeadStatus) => {
    setUpdatingId(leadId)
    setError(null)

    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lead')
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === leadId ? { ...lead, status: nextStatus } : lead))
      )
      setNotice('Lead status updated.')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to update lead')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="CRM"
        onRefresh={fetchLeads}
        refreshLabel="Reload CRM leads"
        refreshing={loading}
        description="Review Pearl Finder Quiz leads and contact form inquiries from one place."
      />

      {error && <div className="admin-error-banner"><strong>Error:</strong> {error}</div>}
      {notice && <div className="admin-banner admin-banner-success">{notice}</div>}

      <div className="admin-stats-row">
        <div className="admin-stats-grid">
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">Visible Leads</div>
            <div className="admin-stat-value" style={{ color: '#C9A961' }}>{leadCounts.total}</div>
          </div>
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">New</div>
            <div className="admin-stat-value" style={{ color: '#D97706' }}>{leadCounts.new}</div>
          </div>
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">Pearl Finder</div>
            <div className="admin-stat-value" style={{ color: '#2C5F8D' }}>{leadCounts.pearlFinder}</div>
          </div>
          <div className="admin-stat-card admin-stat-card-body">
            <div className="admin-stat-label">Converted</div>
            <div className="admin-stat-value" style={{ color: '#10B981' }}>{leadCounts.converted}</div>
          </div>
        </div>
      </div>

      <div className="admin-card admin-filter-panel">
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#666', marginBottom: '1rem' }}>
          Search CRM
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setAppliedSearch(search.trim())
          }}
          className="admin-filter-row"
        >
          <div className="admin-filter-item-wide">
            <label className="admin-filter-label">Find by name, email, phone, source, or pearl match</label>
            <input
              className="admin-control"
              placeholder="Search leads..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="admin-filter-item">
            <label className="admin-filter-label">Status</label>
            <select
              className="admin-control"
              value={status}
              onChange={(event) => setStatus(event.target.value as LeadStatus | 'all')}
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <button type="submit" className="admin-btn admin-btn-primary">Search</button>
            {(appliedSearch || status !== 'all') && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setSearch('')
                  setAppliedSearch('')
                  setStatus('all')
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card admin-table-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading CRM leads...</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No leads found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Source</th>
                <th>Match</th>
                <th>Coupon</th>
                <th>Status</th>
                <th>Created</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.name}</div>
                    <div style={{ color: '#666', fontSize: '0.82rem' }}>{lead.email}</div>
                    <div style={{ color: '#888', fontSize: '0.82rem' }}>{lead.phone || '-'}</div>
                  </td>
                  <td>{formatSource(lead.source)}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.quiz_result || '-'}</div>
                    <div style={{ color: '#888', fontSize: '0.78rem', maxWidth: 220 }}>
                      {formatQuizAnswers(lead.quiz_answers)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.coupon_code || '-'}</div>
                    {lead.coupon_amount_off_cents ? (
                      <div style={{ color: '#888', fontSize: '0.78rem' }}>
                        {formatCouponValue(lead.coupon_amount_off_cents)} off · one-time
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <select
                      className="admin-control"
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(event) => void updateLeadStatus(lead.id, event.target.value as LeadStatus)}
                      style={{ minWidth: 130 }}
                    >
                      {statuses.filter((item) => item.value !== 'all').map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
                  <td>
                    <div style={{ color: '#555', maxWidth: 340, whiteSpace: 'pre-wrap' }}>
                      {lead.message || lead.subject || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
