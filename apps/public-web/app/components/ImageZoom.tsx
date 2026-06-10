import React, { useState } from 'react'
import styles from './ImageZoom.module.css'

interface ImageZoomProps {
  src: string
  alt?: string
  zoomScale?: number
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt = '', zoomScale = 2 }) => {
  const [isZoomed, setIsZoomed] = useState(false)
  const zoomImageClassName = zoomScale >= 2 ? styles.zoomedImageLarge : styles.zoomedImage

  const toggleZoom = () => setIsZoomed((prev) => !prev)

  return (
    <>
      {/* 原始圖片容器 (縮圖) */}
      <div
        className={styles.zoomContainer}
        onClick={toggleZoom}
      >
        <img
          src={src}
          alt={alt}
          className={styles.previewImage}
        />
      </div>

      {/* Lightbox 燈箱效果 (點擊後全螢幕) */}
      {isZoomed && (
        <div
          onClick={toggleZoom}
          className={styles.lightbox}
        >
          <img
            src={src}
            alt={alt}
            className={zoomImageClassName}
          />
          
          {/* 關閉按鈕提示 */}
          <div className={styles.closeHint}>✕</div>
        </div>
      )}
    </>
  )
}

export default ImageZoom
