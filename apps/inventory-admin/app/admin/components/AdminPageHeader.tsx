'use client'

import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  onRefresh?: () => void | Promise<void>
  refreshLabel?: string
  refreshing?: boolean
}

export default function AdminPageHeader({
  title,
  description,
  actions,
  onRefresh,
  refreshLabel = `Refresh ${title.toLowerCase()}`,
  refreshing = false,
}: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-title-row admin-page-title-row-compact">
        <h1 className="admin-page-title">{title}</h1>
        {onRefresh ? (
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            className="admin-btn admin-refresh-btn"
            title={refreshLabel}
            aria-label={refreshLabel}
          >
            {refreshing ? '…' : '↻'}
          </button>
        ) : null}
      </div>

      {actions ? <div className="admin-page-header-actions">{actions}</div> : null}
      {description ? <div className="admin-page-header-description">{description}</div> : null}
    </div>
  )
}
