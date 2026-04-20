'use client'

import { useState } from 'react'
import type { ProductImage, ProductVideo } from '@pearl33atelier/shared/types'

type UseProductMediaManagerArgs = {
  currentProductId: string
  setError: (value: string | null) => void
  setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>
  setVideos: React.Dispatch<React.SetStateAction<ProductVideo[]>>
}

const normalizeImageOrientation = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file

  const outputType =
    file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg'
      ? file.type
      : 'image/jpeg'

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as any)
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      ctx.drawImage(bitmap, 0, 0)
      bitmap.close()
    } catch {
      return file
    }
  } else {
    return file
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    const quality = outputType === 'image/jpeg' || outputType === 'image/webp' ? 0.92 : undefined
    canvas.toBlob((result) => resolve(result), outputType, quality)
  })

  if (!blob) return file

  return new File([blob], file.name, {
    type: blob.type || outputType,
    lastModified: file.lastModified,
  })
}

export function useProductMediaManager({
  currentProductId,
  setError,
  setImages,
  setVideos,
}: UseProductMediaManagerArgs) {
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideos, setUploadingVideos] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !currentProductId) return

    setUploadingImages(true)
    setError(null)

    try {
      const normalizedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          try {
            return await normalizeImageOrientation(file)
          } catch {
            return file
          }
        })
      )

      const formData = new FormData()
      normalizedFiles.forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch(`/api/products/${currentProductId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload images')
      }

      const data = await response.json()
      setImages((prev) => [...prev, ...data.images])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !currentProductId) return

    setUploadingVideos(true)
    setError(null)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('videos', file)
      })

      const response = await fetch(`/api/products/${currentProductId}/videos`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload videos')
      }

      const data = await response.json()
      setVideos((prev) => [...prev, ...(data.videos || [])])
      e.target.value = ''
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload videos')
    } finally {
      setUploadingVideos(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Delete this image? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/products/${currentProductId}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete image')
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete image')
    }
  }

  const setPrimaryImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/${currentProductId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: true }),
      })

      if (!response.ok) throw new Error('Failed to set primary image')

      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set primary image')
    }
  }

  const toggleImagePublished = async (imageId: string, nextPublished: boolean) => {
    try {
      const response = await fetch(`/api/products/${currentProductId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextPublished }),
      })

      if (!response.ok) throw new Error('Failed to update image publish status')

      setImages((prev) =>
        prev.map((image) =>
          image.id === imageId ? { ...image, published: nextPublished } : image
        )
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update image publish status')
    }
  }

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Delete this video? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/products/${currentProductId}/videos/${videoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete video')
      }

      setVideos((prev) => prev.filter((video) => video.id !== videoId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete video')
    }
  }

  const toggleVideoPublished = async (videoId: string, nextPublished: boolean) => {
    try {
      const response = await fetch(`/api/products/${currentProductId}/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextPublished }),
      })

      if (!response.ok) throw new Error('Failed to update video publish status')

      setVideos((prev) =>
        prev.map((video) =>
          video.id === videoId ? { ...video, published: nextPublished } : video
        )
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update video publish status')
    }
  }

  return {
    deleteImage,
    deleteVideo,
    handleImageUpload,
    handleVideoUpload,
    setPrimaryImage,
    toggleImagePublished,
    toggleVideoPublished,
    uploadingImages,
    uploadingVideos,
  }
}
