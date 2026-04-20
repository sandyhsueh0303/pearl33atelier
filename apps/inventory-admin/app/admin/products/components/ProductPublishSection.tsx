'use client'

import { primaryButtonStyle, sectionCardStyle } from './productFormStyles'

type ProductPublishSectionProps = {
  published: boolean
  saving: boolean
  onPublish: () => void
  onUnpublish: () => void
}

export default function ProductPublishSection({
  published,
  saving,
  onPublish,
  onUnpublish,
}: ProductPublishSectionProps) {
  return (
    <div
      className="admin-product-form-section"
      style={{
        ...sectionCardStyle,
        padding: '1rem 1.25rem',
        backgroundColor: published ? '#e8f5e9' : '#fff3e0',
        border: `1px solid ${published ? '#10B981' : '#F59E0B'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: '1rem' }}>
          Publish Status: {published ? 'Published' : 'Draft'}
        </h2>
        <p style={{ margin: '0.3rem 0 0', color: '#666', fontSize: '0.9rem', lineHeight: 1.4 }}>
          {published
            ? 'Visible on the public site.'
            : 'Hidden from the public site until published.'}
        </p>
      </div>

      {!published ? (
        <button
          onClick={onPublish}
          disabled={saving}
          className="admin-product-form-primary-button"
          style={{ ...primaryButtonStyle(saving, '#10B981'), padding: '0.6rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
        >
          {saving ? 'Publishing...' : 'Publish product'}
        </button>
      ) : (
        <button
          onClick={onUnpublish}
          disabled={saving}
          className="admin-product-form-primary-button"
          style={{ ...primaryButtonStyle(saving, '#F59E0B'), padding: '0.6rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
        >
          {saving ? 'Processing...' : 'Unpublish'}
        </button>
      )}
    </div>
  )
}
