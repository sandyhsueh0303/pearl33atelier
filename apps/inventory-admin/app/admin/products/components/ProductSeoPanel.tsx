'use client'

import {
  helperTextStyle,
  labelStyle,
  primaryButtonStyle,
  textInputStyle,
  textareaStyle,
} from './productFormStyles'

type ProductSeoPanelProps = {
  isEditMode: boolean
  currentProductId: string
  generatingSeo: boolean
  title: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogImageAlt: string
  onGenerateSeo: () => void
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onSeoKeywordsChange: (value: string) => void
  onOgImageAltChange: (value: string) => void
}

export default function ProductSeoPanel({
  isEditMode,
  currentProductId,
  generatingSeo,
  title,
  seoTitle,
  seoDescription,
  seoKeywords,
  ogImageAlt,
  onGenerateSeo,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onOgImageAltChange,
}: ProductSeoPanelProps) {
  const canGenerateSeo = isEditMode && Boolean(currentProductId) && !generatingSeo && Boolean(title.trim())
  const hasSeoContent = Boolean(
    seoTitle.trim() || seoDescription.trim() || seoKeywords.trim() || ogImageAlt.trim()
  )

  return (
    <details
      style={{
        border: '1px solid #e5dccf',
        borderRadius: '8px',
        backgroundColor: '#fffaf5',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          padding: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '0.35rem' }}>SEO</div>
          <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {hasSeoContent ? 'SEO configured' : 'SEO missing'}
          </div>
        </div>
        <div style={{ color: '#7c5c2b', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {hasSeoContent ? 'Review SEO details' : 'Add SEO details'}
        </div>
      </summary>

      <div style={{ padding: '0 1rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onGenerateSeo}
            disabled={!canGenerateSeo}
            style={{ ...primaryButtonStyle(!canGenerateSeo, '#7c5c2b'), padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}
          >
            {generatingSeo ? 'Generating SEO...' : 'Generate SEO for this product'}
          </button>
          <small style={{ color: '#666', lineHeight: 1.5, flex: '1 1 240px' }}>
            Uses current form values and the product&apos;s existing images. Review before saving.
          </small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder="e.g. White South Sea Pearl Necklace | 33 Pearl Atelier"
              style={textInputStyle}
            />
            <small style={{ ...helperTextStyle, marginTop: '0.25rem' }}>
              Recommended length: about 50-65 characters. Current: {seoTitle.trim().length}
            </small>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              SEO Description
            </label>
            <textarea
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              rows={3}
              placeholder="Short search result description for this product"
              style={textareaStyle}
            />
            <small style={{ ...helperTextStyle, marginTop: '0.25rem' }}>
              Recommended length: about 120-160 characters. Current: {seoDescription.trim().length}
            </small>
          </div>

          <div>
            <label style={labelStyle}>
              SEO Keywords
            </label>
            <textarea
              value={seoKeywords}
              onChange={(e) => onSeoKeywordsChange(e.target.value)}
              rows={3}
              placeholder="Comma-separated keywords"
              style={textareaStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              OG Image Alt Text
            </label>
            <textarea
              value={ogImageAlt}
              onChange={(e) => onOgImageAltChange(e.target.value)}
              rows={3}
              placeholder="Describe the main product image for social sharing"
              style={textareaStyle}
            />
          </div>
        </div>
      </div>
    </details>
  )
}
