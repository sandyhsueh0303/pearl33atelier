'use client'

import styles from './ProductSeoPanel.module.css'

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
    <details className={styles.panel}>
      <summary className={styles.summary}>
        <div>
          <div className={styles.summaryTitle}>SEO</div>
          <div className={styles.summaryDescription}>
            {hasSeoContent ? 'SEO configured' : 'SEO missing'}
          </div>
        </div>
        <div className={styles.summaryAction}>
          {hasSeoContent ? 'Review SEO details' : 'Add SEO details'}
        </div>
      </summary>

      <div className={styles.body}>
        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={onGenerateSeo}
            disabled={!canGenerateSeo}
            className={styles.generateButton}
          >
            {generatingSeo ? 'Generating SEO...' : 'Generate SEO for this product'}
          </button>
          <small className={styles.helperTextWide}>
            Uses current form values and the product&apos;s existing images. Review before saving.
          </small>
        </div>

        <div className={styles.grid}>
          <div className={styles.fullWidth}>
            <label className={styles.label} htmlFor="product-seo-title">
              SEO Title
            </label>
            <input
              id="product-seo-title"
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder="e.g. White South Sea Pearl Necklace | 33 Pearl Atelier"
              className={styles.control}
            />
            <small className={styles.helperText}>
              Recommended length: about 50-65 characters. Current: {seoTitle.trim().length}
            </small>
          </div>

          <div className={styles.fullWidth}>
            <label className={styles.label} htmlFor="product-seo-description">
              SEO Description
            </label>
            <textarea
              id="product-seo-description"
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              rows={3}
              placeholder="Short search result description for this product"
              className={`${styles.control} ${styles.textarea}`}
            />
            <small className={styles.helperText}>
              Recommended length: about 120-160 characters. Current: {seoDescription.trim().length}
            </small>
          </div>

          <div>
            <label className={styles.label} htmlFor="product-seo-keywords">
              SEO Keywords
            </label>
            <textarea
              id="product-seo-keywords"
              value={seoKeywords}
              onChange={(e) => onSeoKeywordsChange(e.target.value)}
              rows={3}
              placeholder="Comma-separated keywords"
              className={`${styles.control} ${styles.textarea}`}
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="product-og-image-alt">
              OG Image Alt Text
            </label>
            <textarea
              id="product-og-image-alt"
              value={ogImageAlt}
              onChange={(e) => onOgImageAltChange(e.target.value)}
              rows={3}
              placeholder="Describe the main product image for social sharing"
              className={`${styles.control} ${styles.textarea}`}
            />
          </div>
        </div>
      </div>
    </details>
  )
}
