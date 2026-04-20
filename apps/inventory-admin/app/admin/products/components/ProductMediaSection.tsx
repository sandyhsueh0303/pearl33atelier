'use client'

import { getProductImageUrl, getProductVideoUrl } from '@pearl33atelier/shared'
import type { ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import { sectionCardStyle, uploadButtonStyle } from './productFormStyles'

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

  return (
    <details
      className="admin-product-form-section"
      style={{ ...sectionCardStyle, padding: '1.25rem', overflow: 'hidden' }}
    >
      <summary
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Product Media</h2>
          <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {hasMedia
              ? `${images.length} image${images.length === 1 ? '' : 's'} and ${videos.length} video${videos.length === 1 ? '' : 's'}`
              : 'Upload and manage product images and videos'}
          </div>
        </div>
        <div style={{ color: '#7c5c2b', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {hasMedia ? 'Show media details' : 'Add media'}
        </div>
      </summary>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <div
          className="admin-product-form-media-subsection"
          style={{ marginTop: 0 }}
        >
          <h3 className="admin-product-form-media-subheading">Images</h3>

          <div className="admin-product-form-upload-row" style={{ marginBottom: '1rem' }}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onImageUpload}
              disabled={uploadingImages}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="admin-product-form-upload-button"
              style={{ ...uploadButtonStyle(uploadingImages, '#10B981'), padding: '0.65rem 1rem', fontSize: '0.9rem' }}
            >
              {uploadingImages ? 'Uploading...' : '+ Upload Images'}
            </label>
            <small
              className="admin-product-form-upload-help"
              style={{ marginLeft: '0.75rem', color: '#666', fontSize: '0.85rem' }}
            >
              You can upload multiple images at once
            </small>
          </div>

          {images.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No images yet</p>
          ) : (
            <div
              className="admin-product-form-media-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  className="admin-product-form-media-card"
                  style={{
                    border: '2px solid',
                    borderColor: image.is_primary ? '#1976d2' : '#ddd',
                    borderRadius: '8px',
                    padding: '0.4rem',
                    position: 'relative',
                  }}
                >
                  <div
                    className="admin-product-form-image-frame"
                    style={{
                      width: '100%',
                      height: '170px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.4rem',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={getProductImageUrl(image.storage_path)}
                      alt={title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML +=
                          '<span style="color: #999">Image failed to load</span>'
                      }}
                    />
                  </div>

                  {image.is_primary && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        padding: '0.2rem 0.45rem',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                      }}
                    >
                      Primary
                    </span>
                  )}

                  <span
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      padding: '0.2rem 0.45rem',
                      backgroundColor: image.published ? '#e8f5e9' : '#f5efe6',
                      color: image.published ? '#2e7d32' : '#76624c',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      border: image.published ? '1px solid #c8e6c9' : '1px solid #e3d6c4',
                    }}
                  >
                    {image.published ? 'Published' : 'Hidden'}
                  </span>

                  <div
                    className="admin-product-form-media-actions"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      marginTop: '0.35rem',
                    }}
                  >
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryImage(image.id)}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          padding: '0.45rem',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Set as primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleImagePublished(image.id, !image.published)}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        padding: '0.45rem',
                        backgroundColor: image.published ? '#f5efe6' : '#e8f5e9',
                        color: image.published ? '#76624c' : '#2e7d32',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {image.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteImage(image.id)}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        padding: '0.45rem',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: '0.35rem',
                      fontSize: '0.72rem',
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <span>Sort: {image.sort_order}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="admin-product-form-media-subsection"
          style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}
        >
          <h3 className="admin-product-form-media-subheading">Videos</h3>

          <div className="admin-product-form-upload-row" style={{ marginBottom: '1rem' }}>
            <input
              type="file"
              multiple
              accept="video/mp4,video/webm,video/quicktime"
              onChange={onVideoUpload}
              disabled={uploadingVideos}
              style={{ display: 'none' }}
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="admin-product-form-upload-button"
              style={{ ...uploadButtonStyle(uploadingVideos, '#6B7280'), padding: '0.65rem 1rem', fontSize: '0.9rem' }}
            >
              {uploadingVideos ? 'Uploading...' : '+ Upload Videos'}
            </label>
            <small
              className="admin-product-form-upload-help"
              style={{ marginLeft: '0.75rem', color: '#666', fontSize: '0.85rem' }}
            >
              Product page only. Use compressed MP4/WebM videos under 25MB.
            </small>
          </div>

          {videos.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No videos yet</p>
          ) : (
            <div
              className="admin-product-form-media-grid admin-product-form-video-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}
            >
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="admin-product-form-media-card"
                  style={{
                    border: `1px solid ${video.published ? '#c8e6c9' : '#ddd'}`,
                    borderRadius: '8px',
                    padding: '0.6rem',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      padding: '0.2rem 0.45rem',
                      backgroundColor: video.published ? '#e8f5e9' : '#f5efe6',
                      color: video.published ? '#2e7d32' : '#76624c',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      border: video.published ? '1px solid #c8e6c9' : '1px solid #e3d6c4',
                    }}
                  >
                    {video.published ? 'Published' : 'Hidden'}
                  </span>
                  <video
                    src={getProductVideoUrl(video.storage_path)}
                    controls
                    preload="metadata"
                    className="admin-product-form-video-frame"
                    style={{
                      width: '100%',
                      height: '150px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      marginBottom: '0.6rem',
                    }}
                  />
                  <div
                    className="admin-product-form-media-actions"
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleVideoPublished(video.id, !video.published)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        backgroundColor: video.published ? '#f5efe6' : '#e8f5e9',
                        color: video.published ? '#76624c' : '#2e7d32',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      {video.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVideo(video.id)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <div
                    style={{
                      marginTop: '0.35rem',
                      fontSize: '0.72rem',
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'flex-start',
                    }}
                  >
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
