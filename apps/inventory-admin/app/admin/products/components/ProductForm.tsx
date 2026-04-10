'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  slugify,
  materialValueToSlugPart,
  pearlTypeValueToSlugPart,
  getProductImageUrl,
  getProductVideoUrl,
} from '@pearl33atelier/shared'
import type { CatalogProduct, AvailabilityKind, ProductCategory, ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import ProductMaterials from './ProductMaterials'
import QuickSaleButton from './QuickSaleButton'

interface ProductFormProps {
  productId?: string
}

const MATERIAL_OPTIONS = [
  '18K Gold',
  '18K White Gold',
  '925 Sterling Silver with 18K Gold Plating',
  '925 Sterling Silver with White Gold Plating',
  'Natural Diamond',
  'Lab-Grown Diamond',
  'Cubic Zirconia',
] as const

const PEARL_TYPE_OPTIONS = [
  'WhiteAkoya',
  'GreyAkoya',
  'WhiteSouthSea',
  'GoldenSouthSea',
  'Tahitian',
  'Freshwater',
  'Other',
] as const

const SHAPE_OPTIONS = [
  'round',
  'near-round',
  'drop',
  'button',
  'oval',
  'baroque',
] as const

const LUSTER_OPTIONS = ['high', 'soft'] as const

const OVERTONE_GROUPS = {
  'Warm Glow': ['white', 'cream', 'pink', 'rose', 'gold'],
  'Cool Tone': [
    'silver',
    'silver-blue',
    'peacock',
    'green peacock',
    'blue peacock',
    'aubergine',
    'charcoal',
    'dark green',
    'dark blue',
    'graphite',
  ],
  Iridescent: [
    'iridescent',
    'pink iridescent',
    'green iridescent',
    'blue iridescent',
    'gold iridescent',
    'pink-green iridescent',
    'pink-blue iridescent',
    'green-blue iridescent',
    'multi iridescent',
  ],
} as const

const OVERTONE_OPTIONS = Object.values(OVERTONE_GROUPS).flat()

const normalizeMaterial = (value: string) => value.trim().toLowerCase()
const splitMultiValueInput = (value: string) =>
  value
    .split(/[,;/\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)

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

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentProductId, setCurrentProductId] = useState(productId || '')
  const isEditMode = !!currentProductId
  const returnTo = searchParams.get('returnTo') || ''
  const backToListPath = returnTo.startsWith('/admin/products') ? returnTo : '/admin/products'
  const [costAnalysisRefreshToken, setCostAnalysisRefreshToken] = useState(0)
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false)
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [loadedSlug, setLoadedSlug] = useState('')
  const [loadedSlugSource, setLoadedSlugSource] = useState('')
  const [description, setDescription] = useState('')
  const [editorsPick, setEditorsPick] = useState(false)
  const [note, setNote] = useState('')
  const [selectedPearlTypes, setSelectedPearlTypes] = useState<string[]>(['WhiteAkoya'])
  const [category, setCategory] = useState<ProductCategory | ''>('')
  const [sizeMm, setSizeMm] = useState('')
  const [shape, setShape] = useState('')
  const [luster, setLuster] = useState('high')
  const [selectedOvertones, setSelectedOvertones] = useState<string[]>([])
  const [customOvertones, setCustomOvertones] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [customMaterials, setCustomMaterials] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [availability, setAvailability] = useState<AvailabilityKind>('IN_STOCK')
  const [preorderNote, setPreorderNote] = useState('')
  const [published, setPublished] = useState(false)
  
  // Images
  const [images, setImages] = useState<ProductImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [videos, setVideos] = useState<ProductVideo[]>([])
  const [uploadingVideos, setUploadingVideos] = useState(false)

  const materialValue = useMemo(() => {
    const custom = splitMultiValueInput(customMaterials)
    const all = [...selectedMaterials, ...custom]
    return all.join(', ')
  }, [selectedMaterials, customMaterials])

  const overtoneValue = useMemo(() => {
    const custom = splitMultiValueInput(customOvertones)
    const all = [...selectedOvertones, ...custom]
    return all.join(', ')
  }, [selectedOvertones, customOvertones])

  const pearlTypeValue = useMemo(() => {
    return Array.from(new Set(selectedPearlTypes)).join(', ')
  }, [selectedPearlTypes])

  const buildDefaultSlugFromValues = (
    nextPearlType: string,
    nextSizeMm: string | null | undefined,
    nextShape: string | null | undefined,
    nextMaterial: string | null | undefined,
    nextCategory: string | null | undefined
  ) => {
    const parts = [
      pearlTypeValueToSlugPart(nextPearlType),
      String(nextSizeMm || '').trim(),
      String(nextShape || '').trim(),
      materialValueToSlugPart(String(nextMaterial || '')),
      nextCategory,
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
    return slugify(parts.join('-'))
  }

  const buildDefaultSlug = () =>
    buildDefaultSlugFromValues(pearlTypeValue, sizeMm, shape, materialValue, category)

  const togglePearlType = (option: string) => {
    setSelectedPearlTypes((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    )
  }

  // Keep title editing separate from slug generation
  const handleTitleChange = (value: string) => {
    setTitle(value)
  }

  // Manual slug override
  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    const slugified = slugify(value)
    setSlug(slugified)
  }

  const handleSkuChange = (value: string) => {
    setSkuManuallyEdited(true)
    setSku(value.toUpperCase())
  }

  // Auto-generate slug from pearl_type, size_mm, shape, material, category until manually edited.
  useEffect(() => {
    const nextSlug = buildDefaultSlug()
    if (slugManuallyEdited) return
    if (isEditMode && !loadedSlugSource) return
    if (isEditMode && slug === loadedSlug && nextSlug === loadedSlugSource) return
    setSlug(nextSlug)
  }, [
    isEditMode,
    slug,
    loadedSlug,
    loadedSlugSource,
    slugManuallyEdited,
    pearlTypeValue,
    sizeMm,
    shape,
    materialValue,
    category,
  ])

  // Load product data if editing
  useEffect(() => {
    if (isEditMode) {
      loadProduct()
    }
  }, [currentProductId])

  useEffect(() => {
    if (isEditMode || skuManuallyEdited || sku) return

    const loadNextSku = async () => {
      try {
        const response = await fetch('/api/products/next-sku', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        if (data?.sku) setSku(String(data.sku))
      } catch {
        // Keep form usable even if prefill fails.
      }
    }

    void loadNextSku()
  }, [isEditMode, skuManuallyEdited, sku])

  const loadProduct = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/products/${currentProductId}`)
      if (!response.ok) throw new Error('Failed to load product')
      
      const data = await response.json()
      const product: CatalogProduct = data.product
      
      setTitle(product.title)
      setSku(product.sku || '')
      setSkuManuallyEdited(true)
      setSlug(product.slug)
      setLoadedSlug(product.slug)
      setDescription(product.description || '')
      setEditorsPick(product.editors_pick || false)
      setNote(product.note || '')
      setSelectedPearlTypes(
        product.pearl_type
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
      setCategory(product.category || '')
      setSizeMm(product.size_mm || '')
      setShape(product.shape || '')
      setLuster(product.luster || '')
      const rawOvertones = splitMultiValueInput(product.overtone || '')
      const matchedOvertones: string[] = []
      const unmatchedOvertones: string[] = []
      rawOvertones.forEach((item) => {
        const found = OVERTONE_OPTIONS.find((option) => option === item.toLowerCase())
        if (found) {
          matchedOvertones.push(found)
        } else {
          unmatchedOvertones.push(item)
        }
      })
      setSelectedOvertones(Array.from(new Set(matchedOvertones)))
      setCustomOvertones(unmatchedOvertones.join(', '))
      const rawMaterials = splitMultiValueInput(product.material || '')
      const matched: string[] = []
      const unmatched: string[] = []
      rawMaterials.forEach((item) => {
        const found = MATERIAL_OPTIONS.find(
          (option) => normalizeMaterial(option) === normalizeMaterial(item)
        )
        if (found) {
          matched.push(found)
        } else {
          unmatched.push(item)
        }
      })
      setSelectedMaterials(Array.from(new Set(matched)))
      setCustomMaterials(unmatched.join(', '))
      setLoadedSlugSource(
        buildDefaultSlugFromValues(
          product.pearl_type,
          product.size_mm,
          product.shape,
          product.material,
          product.category
        )
      )
      setSlugManuallyEdited(false)
      setSellPrice(product.sell_price?.toString() || '')
      setOriginalPrice(product.original_price?.toString() || '')
      setAvailability(product.availability === 'PREORDER' ? 'PREORDER' : 'IN_STOCK')
      setPreorderNote(product.preorder_note || '')
      setPublished(product.published)
      
      if (data.images) {
        setImages(data.images)
      }
      if (data.videos) {
        setVideos(data.videos)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const productData: any = {
        slug,
        title,
        sku: sku.trim() || null,
        description: description || null,
        editors_pick: editorsPick,
        note: note || null,
        pearl_type: selectedPearlTypes,
        category: category || null,
        size_mm: sizeMm.trim() || null,
        shape: shape || null,
        luster: luster || null,
        overtone: overtoneValue || null,
        material: materialValue || null,
        sell_price: sellPrice ? parseFloat(sellPrice) : null,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        availability,
        preorder_note: preorderNote || null,
        published: false, // Always save as draft initially
        inventory_item_id: null // Can be connected later
      }

      const url = isEditMode ? `/api/products/${currentProductId}` : '/api/products'
      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save product')
      }

      const data = await response.json()
      if (isEditMode) {
        setCostAnalysisRefreshToken((prev) => prev + 1)
        return
      } else {
        const nextProductId = data.product.id as string
        setCurrentProductId(nextProductId)
        setCostAnalysisRefreshToken((prev) => prev + 1)
        window.history.replaceState(
          null,
          '',
          `/admin/products/${nextProductId}?returnTo=${encodeURIComponent(backToListPath)}`
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const toggleMaterial = (value: string) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value)
      return [...prev, value]
    })
  }

  const toggleOvertone = (value: string) => {
    setSelectedOvertones((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value)
      return [...prev, value]
    })
  }

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
      normalizedFiles.forEach(file => {
        formData.append('images', file)
      })

      const response = await fetch(`/api/products/${currentProductId}/images`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload images')
      }

      const data = await response.json()
      setImages(prev => [...prev, ...data.images])
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
        method: 'DELETE'
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
        body: JSON.stringify({ is_primary: true })
      })

      if (!response.ok) throw new Error('Failed to set primary image')

      setImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })))
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

  const handlePublish = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${currentProductId}/publish`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to publish product')
      }

      alert('Product published successfully!')
      router.push(backToListPath)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish product')
    } finally {
      setSaving(false)
    }
  }

  const handleUnpublish = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${currentProductId}/publish`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unpublish product')
      }

      setPublished(false)
      alert('Product unpublished')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unpublish product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div className="admin-product-form-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div className="admin-product-form-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="admin-product-form-title">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
        <div className="admin-product-form-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isEditMode && <QuickSaleButton productId={currentProductId} />}
          <button
            onClick={() => router.push(backToListPath)}
            className="admin-product-form-back-button"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to list
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #c00',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-product-form-card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="admin-product-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="admin-product-form-full">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              SKU
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => handleSkuChange(e.target.value)}
              placeholder="e.g.: PA0001"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Slug (URL slug) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              placeholder="white-akoya-8mm"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'monospace',
                backgroundColor: 'white'
              }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
              {isEditMode
                ? 'Auto-updates when product details change until you edit it manually. URL will update after saving.'
                : 'Auto-generated from product details, but editable manually'}
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Pearl Type <span style={{ color: 'red' }}>*</span>
            </label>
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.75rem',
                backgroundColor: '#fff',
                display: 'grid',
                gap: '0.5rem',
              }}
            >
              {PEARL_TYPE_OPTIONS.map((option) => (
                <label
                  key={option}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPearlTypes.includes(option)}
                    onChange={() => togglePearlType(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <small style={{ color: '#666', display: 'block', marginTop: '0.35rem' }}>
              Multiple selection supported
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Product Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">Uncategorized</option>
              <option value="BRACELETS">Bracelets</option>
              <option value="NECKLACES">Necklaces</option>
              <option value="EARRINGS">Earrings</option>
              <option value="STUDS">Studs</option>
              <option value="RINGS">Rings</option>
              <option value="PENDANTS">Pendants</option>
              <option value="LOOSE_PEARLS">Loose Pearls</option>
              <option value="BROOCHES">Brooches</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Size (mm)
            </label>
            <input
              type="text"
              value={sizeMm}
              onChange={(e) => setSizeMm(e.target.value)}
              placeholder="e.g.: 7.5 or 7-7.5 or 3.5-8"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Shape
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: '#fff',
                textTransform: 'capitalize'
              }}
            >
              <option value="">Select shape</option>
              {SHAPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Luster
            </label>
            <select
              value={luster}
              onChange={(e) => setLuster(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">Select luster</option>
              {LUSTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-product-form-full">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Overtone
            </label>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.75rem',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {Object.entries(OVERTONE_GROUPS).map(([groupLabel, options]) => (
                  <div key={groupLabel}>
                    <p
                      style={{
                        margin: '0 0 0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#7a6a50',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {groupLabel}
                    </p>
                    <div
                      style={{
                        display: 'grid',
                        gap: '0.5rem',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      }}
                    >
                      {options.map((option) => (
                        <label
                          key={option}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOvertones.includes(option)}
                            onChange={() => toggleOvertone(option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <input
                type="text"
                value={customOvertones}
                onChange={(e) => setCustomOvertones(e.target.value)}
                placeholder="Custom overtone (optional)"
                style={{
                  marginTop: '0.75rem',
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <small style={{ color: '#666', display: 'block', marginTop: '0.35rem' }}>
              Select one or more overtones, or add your own custom value.
            </small>
          </div>

          <div className="admin-product-form-full">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Material
            </label>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.75rem',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {MATERIAL_OPTIONS.map((option) => (
                  <label
                    key={option}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(option)}
                      onChange={() => toggleMaterial(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              <input
                type="text"
                value={customMaterials}
                onChange={(e) => setCustomMaterials(e.target.value)}
                placeholder="Other materials (optional)"
                style={{
                  marginTop: '0.75rem',
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <small style={{ color: '#666', display: 'block', marginTop: '0.35rem' }}>
              Multiple selection supported
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Sell Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Original Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Selling Mode <span style={{ color: 'red' }}>*</span>
            </label>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem', lineHeight: 1.5 }}>
              `Preorder` is a manual selling mode. Actual in-stock or sold-out status is determined by BOM material inventory.
            </p>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityKind)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="IN_STOCK">Normal Sale</option>
              <option value="PREORDER">Preorder</option>
            </select>
          </div>

          {availability === 'PREORDER' && (
            <div className="admin-product-form-full">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Preorder Note
              </label>
              <input
                type="text"
                value={preorderNote}
                onChange={(e) => setPreorderNote(e.target.value)}
                placeholder="e.g.: Expected in 2 weeks"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}

          <div className="admin-product-form-full">
            <label
              className="admin-product-form-toggle-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fffaf2',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={editorsPick}
                onChange={(e) => setEditorsPick(e.target.checked)}
              />
              <div>
                <div style={{ fontWeight: 'bold', color: '#333' }}>Editor&apos;s Pick</div>
                <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.15rem' }}>
                  Add an Editor&apos;s Pick badge to the public product card.
                </div>
              </div>
            </label>
          </div>

          <div className="admin-product-form-full">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div className="admin-product-form-full">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Internal Notes (admin only)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Internal notes, e.g. inventory source or reminders"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: '#fffef0'
              }}
            />
          </div>
        </div>

        <div className="admin-product-form-submit-row" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="admin-product-form-primary-button"
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: saving ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Product (Draft)')}
          </button>
        </div>
      </form>

      {isEditMode && (
        <div
          className="admin-product-form-section"
          style={{
            marginTop: '2rem',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginBottom: '1.25rem' }}>Product Media</h2>

          <div className="admin-product-form-media-subsection">
            <h3 className="admin-product-form-media-subheading">Images</h3>

            <div className="admin-product-form-upload-row" style={{ marginBottom: '1.5rem' }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImages}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="admin-product-form-upload-button"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: uploadingImages ? '#ccc' : '#10B981',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: uploadingImages ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {uploadingImages ? 'Uploading...' : '+ Upload Images'}
              </label>
              <small className="admin-product-form-upload-help" style={{ marginLeft: '1rem', color: '#666' }}>
                You can upload multiple images at once
              </small>
            </div>

            {images.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No images yet</p>
            ) : (
              <div className="admin-product-form-media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="admin-product-form-media-card"
                    style={{
                      border: '2px solid',
                      borderColor: image.is_primary ? '#1976d2' : '#ddd',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      position: 'relative'
                    }}
                  >
                    <div className="admin-product-form-image-frame" style={{ 
                      width: '100%', 
                      height: '200px', 
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.5rem',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={getProductImageUrl(image.storage_path)}
                        alt={title}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML += '<span style="color: #999">Image failed to load</span>'
                        }}
                      />
                    </div>
                    
                    {image.is_primary && (
                      <span style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        borderRadius: '4px'
                      }}>
                        Primary
                      </span>
                    )}

                    <span
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: image.published ? '#e8f5e9' : '#f5efe6',
                        color: image.published ? '#2e7d32' : '#76624c',
                        fontSize: '0.75rem',
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
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      {!image.is_primary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            padding: '0.5rem',
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
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
                        onClick={() => toggleImagePublished(image.id, !image.published)}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          padding: '0.5rem',
                          backgroundColor: image.published ? '#f5efe6' : '#e8f5e9',
                          color: image.published ? '#76624c' : '#2e7d32',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {image.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteImage(image.id)}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          padding: '0.5rem',
                          backgroundColor: '#FEE2E2',
                          color: '#B91C1C',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div style={{ 
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'flex-start'
                    }}>
                      <span>Sort: {image.sort_order}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-product-form-media-subsection admin-product-form-media-subsection-divider">
            <h3 className="admin-product-form-media-subheading">Videos</h3>

            <div className="admin-product-form-upload-row" style={{ marginBottom: '1.5rem' }}>
              <input
                type="file"
                multiple
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                disabled={uploadingVideos}
                style={{ display: 'none' }}
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="admin-product-form-upload-button"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: uploadingVideos ? '#ccc' : '#6B7280',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: uploadingVideos ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {uploadingVideos ? 'Uploading...' : '+ Upload Videos'}
              </label>
              <small className="admin-product-form-upload-help" style={{ marginLeft: '1rem', color: '#666' }}>
                Product page only. Use compressed MP4/WebM videos under 25MB.
              </small>
            </div>

            {videos.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No videos yet</p>
            ) : (
              <div className="admin-product-form-media-grid admin-product-form-video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="admin-product-form-media-card"
                    style={{
                      border: `1px solid ${video.published ? '#c8e6c9' : '#ddd'}`,
                      borderRadius: '8px',
                      padding: '0.75rem',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: video.published ? '#e8f5e9' : '#f5efe6',
                        color: video.published ? '#2e7d32' : '#76624c',
                        fontSize: '0.75rem',
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
                        height: '180px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginBottom: '0.75rem',
                      }}
                    />
                    <div className="admin-product-form-media-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => toggleVideoPublished(video.id, !video.published)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: video.published ? '#f5efe6' : '#e8f5e9',
                          color: video.published ? '#76624c' : '#2e7d32',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        {video.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVideo(video.id)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: '#FEE2E2',
                          color: '#B91C1C',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666', display: 'flex', justifyContent: 'flex-start' }}>
                      <span>Sort: {video.sort_order}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Section - Only show in edit mode */}
      {isEditMode && (
        <div className="admin-product-form-section" style={{ 
          marginTop: '2rem', 
          backgroundColor: published ? '#e8f5e9' : '#fff3e0',
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: `2px solid ${published ? '#10B981' : '#F59E0B'}`
        }}>
          <h2 style={{ marginBottom: '1rem' }}>
            Publish Status: {published ? 'Published' : 'Draft'}
          </h2>
          
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            {published 
              ? 'This product is currently visible on the public site.'
              : 'This product is currently a draft and hidden from the public site. After publishing, all images marked as published will also be published.'
            }
          </p>

          {!published ? (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="admin-product-form-primary-button"
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: saving ? '#ccc' : '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Publishing...' : '🚀 Publish product'}
            </button>
          ) : (
            <button
              onClick={handleUnpublish}
              disabled={saving}
              className="admin-product-form-primary-button"
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: saving ? '#ccc' : '#F59E0B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Processing...' : 'Unpublish'}
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        {isEditMode ? (
          <ProductMaterials
            productId={currentProductId}
            refreshToken={costAnalysisRefreshToken}
          />
        ) : (
          <div
            className="admin-product-form-section"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#666',
            }}
          >
            Save the product first to manage BOM materials.
          </div>
        )}
      </div>
    </div>
  )
}
