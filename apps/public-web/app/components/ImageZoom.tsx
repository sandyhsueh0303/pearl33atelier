import { useState } from 'react'
import styles from './ImageZoom.module.css'

interface ImageZoomProps {
  src: string
  alt?: string
  zoomScale?: number
}

export default function ImageZoom({ src, alt = '', zoomScale = 2 }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const zoomImageClassName = zoomScale >= 2 ? styles.zoomedImageLarge : styles.zoomedImage

  const toggleZoom = () => setIsZoomed((prev) => !prev)

  return (
    <>
      <div className={styles.zoomContainer} onClick={toggleZoom}>
        <img src={src} alt={alt} className={styles.previewImage} />
      </div>

      {isZoomed && (
        <div onClick={toggleZoom} className={styles.lightbox}>
          <img src={src} alt={alt} className={zoomImageClassName} />
          <div className={styles.closeHint}>✕</div>
        </div>
      )}
    </>
  )
}
