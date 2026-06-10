'use client'

import { useState } from 'react'
import { getProductImageUrl, getProductVideoUrl } from '@pearl33atelier/shared'
import type { ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import styles from './ProductMediaSection.module.css'

type ProductMediaSectionProps = {
  title: string
  images: ProductImage[]
  videos: ProductVideo[]
  uploadingImages: boolean
  uploadingVideos: boolean
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSetPrimaryImage: (imageId: string) => void
  onToggleImagePublished: (imageId: string, nextPublished: boolean) => void
  onDeleteImage: (imageId: string) => void
  onToggleVideoPublished: (videoId: string, nextPublished: boolean) => void
  onDeleteVideo: (videoId: string) => void
}

export default function ProductMediaSection({
  title,
  images,
  videos,
  uploadingImages,
  uploadingVideos,
  onImageUpload,
  onVideoUpload,
  onSetPrimaryImage,
  onToggleImagePublished,
  onDeleteImage,
  onToggleVideoPublished,
  onDeleteVideo,
}: ProductMediaSectionProps) {
  const hasMedia = images.length > 0 || videos.length > 0
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set())

  return (
    <details className={`admin-product-form-section ${styles.section}`}>
      <summary className={styles.summary}>
        <div>
          <h2 className={styles.title}>Product Media</h2>
          <div className={styles.description}>
            {hasMedia
              ? `${images.length} image${images.length === 1 ? '' : 's'} and ${videos.length} video${videos.length === 1 ? '' : 's'}`
              : 'Upload and manage product images and videos'}
          </div>
        </div>
        <div className={styles.summaryAction}>
          {hasMedia ? 'Show media details' : 'Add media'}
        </div>
      </summary>

      <div className={styles.mediaColumns}>
        <div className={`admin-product-form-media-subsection ${styles.subsection}`}>
          <h3 className="admin-product-form-media-subheading">Images</h3>

          <div className={`admin-product-form-upload-row ${styles.uploadRow}`}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onImageUpload}
              disabled={uploadingImages}
              className={styles.fileInput}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`admin-product-form-upload-button ${styles.uploadButton} ${styles.imageUploadButton} ${uploadingImages ? styles.disabledButton : ''}`}
            >
              {uploadingImages ? 'Uploading...' : '+ Upload Images'}
            </label>
            <small className={`admin-product-form-upload-help ${styles.uploadHelp}`}>
              You can upload multiple images at once
            </small>
          </div>

          {images.length === 0 ? (
            <p className={styles.emptyState}>No images yet</p>
          ) : (
            <div className={`admin-product-form-media-grid ${styles.imageGrid}`}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`admin-product-form-media-card ${styles.mediaCard} ${styles.imageCard} ${image.is_primary ? styles.primaryImageCard : ''}`}
                >
                  <div className={`admin-product-form-image-frame ${styles.imageFrame}`}>
                    {failedImageIds.has(image.id) ? (
                      <span className={styles.imageFallback}>Image failed to load</span>
                    ) : (
                      <img
                        src={getProductImageUrl(image.storage_path)}
                        alt={title}
                        className={styles.image}
                        onError={() => {
                          setFailedImageIds((current) => {
                            const next = new Set(current)
                            next.add(image.id)
                            return next
                          })
                        }}
                      />
                    )}
                  </div>

                  {image.is_primary && (
                    <span className={`${styles.badge} ${styles.primaryBadge}`}>
                      Primary
                    </span>
                  )}

                  <span className={`${styles.badge} ${styles.statusBadge} ${image.published ? styles.publishedBadge : styles.hiddenBadge}`}>
                    {image.published ? 'Published' : 'Hidden'}
                  </span>

                  <div className={`admin-product-form-media-actions ${styles.mediaActions}`}>
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryImage(image.id)}
                        className={`${styles.mediaButton} ${styles.primaryActionButton}`}
                      >
                        Set as primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleImagePublished(image.id, !image.published)}
                      className={`${styles.mediaButton} ${image.published ? styles.hideActionButton : styles.publishActionButton}`}
                    >
                      {image.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteImage(image.id)}
                      className={`${styles.mediaButton} ${styles.deleteActionButton}`}
                    >
                      Delete
                    </button>
                  </div>

                  <div className={styles.sortMeta}>
                    <span>Sort: {image.sort_order}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`admin-product-form-media-subsection ${styles.subsection} ${styles.videoSubsection}`}>
          <h3 className="admin-product-form-media-subheading">Videos</h3>

          <div className={`admin-product-form-upload-row ${styles.uploadRow}`}>
            <input
              type="file"
              multiple
              accept="video/mp4,video/webm,video/quicktime"
              onChange={onVideoUpload}
              disabled={uploadingVideos}
              className={styles.fileInput}
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className={`admin-product-form-upload-button ${styles.uploadButton} ${styles.videoUploadButton} ${uploadingVideos ? styles.disabledButton : ''}`}
            >
              {uploadingVideos ? 'Uploading...' : '+ Upload Videos'}
            </label>
            <small className={`admin-product-form-upload-help ${styles.uploadHelp}`}>
              Product page only. Use compressed MP4/WebM videos under 25MB.
            </small>
          </div>

          {videos.length === 0 ? (
            <p className={styles.emptyState}>No videos yet</p>
          ) : (
            <div className={`admin-product-form-media-grid admin-product-form-video-grid ${styles.videoGrid}`}>
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`admin-product-form-media-card ${styles.mediaCard} ${styles.videoCard} ${video.published ? styles.publishedVideoCard : ''}`}
                >
                  <span className={`${styles.badge} ${styles.statusBadge} ${video.published ? styles.publishedBadge : styles.hiddenBadge}`}>
                    {video.published ? 'Published' : 'Hidden'}
                  </span>
                  <video
                    src={getProductVideoUrl(video.storage_path)}
                    controls
                    preload="metadata"
                    className={`admin-product-form-video-frame ${styles.videoFrame}`}
                  />
                  <div className={`admin-product-form-media-actions ${styles.videoActions}`}>
                    <button
                      type="button"
                      onClick={() => onToggleVideoPublished(video.id, !video.published)}
                      className={`${styles.mediaButton} ${video.published ? styles.hideActionButton : styles.publishActionButton}`}
                    >
                      {video.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVideo(video.id)}
                      className={`${styles.mediaButton} ${styles.deleteActionButton}`}
                    >
                      Delete
                    </button>
                  </div>
                  <div className={styles.sortMeta}>
                    <span>Sort: {video.sort_order}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </details>
  )
}
