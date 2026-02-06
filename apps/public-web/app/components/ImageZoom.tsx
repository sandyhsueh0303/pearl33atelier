import React, { useState } from 'react';

interface ImageZoomProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  zoomScale?: number;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt = '', style, zoomScale = 2 }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const boundedZoomScale = Math.max(1, zoomScale);
  const popoutMaxViewport = Math.max(40, 90 / boundedZoomScale);

  const toggleZoom = () => setIsZoomed((prev) => !prev);

  return (
    <>
      {/* 原始圖片容器 (縮圖) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          cursor: 'zoom-in',
          overflow: 'hidden',
          borderRadius: '8px',
          ...style,
        }}
        onClick={toggleZoom}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>

      {/* Lightbox 燈箱效果 (點擊後全螢幕) */}
      {isZoomed && (
        <div
          onClick={toggleZoom}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: `${popoutMaxViewport}vw`,
              maxHeight: `${popoutMaxViewport}vh`,
              objectFit: 'contain',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              borderRadius: '4px',
              backgroundColor: '#fff',
              transform: `scale(${boundedZoomScale})`,
              // 防止點擊圖片本身也關閉（可選）
              pointerEvents: 'auto',
            }}
          />
          
          {/* 關閉按鈕提示 */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif'
          }}>✕</div>
        </div>
      )}
    </>
  );
};

export default ImageZoom;
