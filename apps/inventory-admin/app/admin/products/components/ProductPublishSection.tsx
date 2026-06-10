'use client'

import styles from './ProductPublishSection.module.css'

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
    <div className={`admin-product-form-section ${styles.section} ${published ? styles.published : styles.draft}`}>
      <div className={styles.copy}>
        <h2 className={styles.title}>
          Publish Status: {published ? 'Published' : 'Draft'}
        </h2>
        <p className={styles.description}>
          {published
            ? 'Visible on the public site.'
            : 'Hidden from the public site until published.'}
        </p>
      </div>

      {!published ? (
        <button
          onClick={onPublish}
          disabled={saving}
          className={`admin-product-form-primary-button ${styles.button} ${styles.publishButton}`}
        >
          {saving ? 'Publishing...' : 'Publish product'}
        </button>
      ) : (
        <button
          onClick={onUnpublish}
          disabled={saving}
          className={`admin-product-form-primary-button ${styles.button} ${styles.unpublishButton}`}
        >
          {saving ? 'Processing...' : 'Unpublish'}
        </button>
      )}
    </div>
  )
}
