'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CatalogProduct, PearlType, AvailabilityKind, ProductImage } from '@33pearlatelier/shared/types'

interface ProductFormProps {
  productId?: string
}

// Slugify function
function slugify(text: string): string {
  return text
    .toLowerCase()                    // 全小寫
    .replace(/\s+/g, '-')             // 空格 → -
    .replace(/[^a-z0-9-]/g, '')       // 只保留 a-z 0-9 -
    .replace(/-+/g, '-')              // 多個 - 合併
    .replace(/^-+|-+$/g, '')          // 去頭尾 -
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const isEditMode = !!productId
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [note, setNote] = useState('')
  const [pearlType, setPearlType] = useState<PearlType>('WhiteAkoya')
  const [sizeMm, setSizeMm] = useState('')
  const [shape, setShape] = useState('')
  const [material, setMaterial] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [availability, setAvailability] = useState<AvailabilityKind>('IN_STOCK')
  const [preorderNote, setPreorderNote] = useState('')
  const [published, setPublished] = useState(false)
  
  // Images
  const [images, setImages] = useState<ProductImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Auto-slugify when title changes (only in create mode)
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEditMode) {
      setSlug(slugify(value))
    }
  }

  // Auto-slugify when slug field changes
  const handleSlugChange = (value: string) => {
    const slugified = slugify(value)
    setSlug(slugified)
  }

  // Load product data if editing
  useEffect(() => {
    if (isEditMode) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) throw new Error('Failed to load product')
      
      const data = await response.json()
      const product: CatalogProduct = data.product
      
      setTitle(product.title)
      setSlug(product.slug)
      setDescription(product.description || '')
      setNote(product.note || '')
      setPearlType(product.pearl_type)
      setSizeMm(product.size_mm?.toString() || '')
      setShape(product.shape || '')
      setMaterial(product.material || '')
      setSellPrice(product.sell_price?.toString() || '')
      setOriginalPrice(product.original_price?.toString() || '')
      setAvailability(product.availability)
      setPreorderNote(product.preorder_note || '')
      setPublished(product.published)
      
      if (data.images) {
        setImages(data.images)
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
      const productData = {
        title,
        slug,
        description: description || null,
        note: note || null,
        pearl_type: pearlType,
        size_mm: sizeMm ? parseFloat(sizeMm) : null,
        shape: shape || null,
        material: material || null,
        sell_price: sellPrice ? parseFloat(sellPrice) : null,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        availability,
        preorder_note: preorderNote || null,
        published: false, // Always save as draft initially
        inventory_item_id: null // Can be connected later
      }

      const url = isEditMode ? `/api/products/${productId}` : '/api/products'
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
      router.push(`/admin/products/${data.product.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !productId) return

    setUploadingImages(true)
    setError(null)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('images', file)
      })

      const response = await fetch(`/api/products/${productId}/images`, {
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

  const toggleImagePublish = async (imageId: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentState })
      })

      if (!response.ok) throw new Error('Failed to update image')

      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, published: !currentState } : img
      ))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update image')
    }
  }

  const setPrimaryImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/images/${imageId}`, {
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

  const handlePublish = async () => {
    if (!confirm('確定要發布此產品嗎？發布後公開網站將可見此產品。')) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productId}/publish`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to publish product')
      }

      alert('產品已成功發布！')
      router.push('/admin/products')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish product')
    } finally {
      setSaving(false)
    }
  }

  const handleUnpublish = async () => {
    if (!confirm('確定要取消發布此產品嗎？公開網站將無法看到此產品。')) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productId}/publish`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unpublish product')
      }

      setPublished(false)
      alert('產品已取消發布')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unpublish product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>載入中...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{isEditMode ? '編輯產品' : '新增產品'}</h1>
        <button
          onClick={() => router.push('/admin/products')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回列表
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #c00',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>錯誤:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              標題 <span style={{ color: 'red' }}>*</span>
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
              Slug (URL 識別碼) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              disabled={isEditMode}
              placeholder="white-akoya-8mm"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'monospace',
                backgroundColor: isEditMode ? '#f5f5f5' : 'white'
              }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
              {isEditMode 
                ? '建立後無法修改' 
                : '輸入標題時會自動產生，也可手動修改'}
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              珍珠類型 <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              value={pearlType}
              onChange={(e) => setPearlType(e.target.value as PearlType)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="WhiteAkoya">White Akoya</option>
              <option value="GreyAkoya">Grey Akoya</option>
              <option value="WhiteSouthSea">White South Sea</option>
              <option value="GoldenSouthSea">Golden South Sea</option>
              <option value="Tahitian">Tahitian</option>
              <option value="Freshwater">Freshwater</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              尺寸 (mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={sizeMm}
              onChange={(e) => setSizeMm(e.target.value)}
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
              形狀
            </label>
            <input
              type="text"
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              placeholder="例如: 圓形、橢圓形"
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
              材質
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="例如: 18K金、925銀"
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
              售價 (NT$)
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
              原價 (NT$)
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
              供應狀態 <span style={{ color: 'red' }}>*</span>
            </label>
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
              <option value="IN_STOCK">現貨</option>
              <option value="PREORDER">預購</option>
            </select>
          </div>

          {availability === 'PREORDER' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                預購說明
              </label>
              <input
                type="text"
                value={preorderNote}
                onChange={(e) => setPreorderNote(e.target.value)}
                placeholder="例如: 預計2週到貨"
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

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              商品描述
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

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              內部備註 (僅供管理員查看)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="內部備註，例如：庫存來源、注意事項等"
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

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
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
            {saving ? '儲存中...' : (isEditMode ? '儲存變更' : '建立產品（草稿）')}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'white',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
        </div>
      </form>

      {/* Images Section - Only show in edit mode */}
      {isEditMode && (
        <div style={{ 
          marginTop: '2rem', 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h2 style={{ marginBottom: '1rem' }}>產品圖片</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
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
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: uploadingImages ? '#ccc' : '#4caf50',
                color: 'white',
                borderRadius: '4px',
                cursor: uploadingImages ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {uploadingImages ? '上傳中...' : '+ 上傳圖片'}
            </label>
            <small style={{ marginLeft: '1rem', color: '#666' }}>
              可選擇多張圖片同時上傳
            </small>
          </div>

          {images.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>尚無圖片</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    border: '2px solid',
                    borderColor: image.is_primary ? '#1976d2' : '#ddd',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ 
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
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product_image/${image.storage_path}`}
                      alt={title}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML += '<span style="color: #999">圖片載入失敗</span>'
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
                      主圖
                    </span>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => toggleImagePublish(image.id, image.published)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: image.published ? '#fff3e0' : '#e8f5e9',
                        color: image.published ? '#ef6c00' : '#2e7d32',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {image.published ? '取消公開' : '設為公開'}
                    </button>
                    
                    {!image.is_primary && (
                      <button
                        onClick={() => setPrimaryImage(image.id)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        設為主圖
                      </button>
                    )}
                  </div>
                  
                  <div style={{ 
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#666',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>排序: {image.sort_order}</span>
                    <span>{image.published ? '已公開' : '草稿'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Publish Section - Only show in edit mode */}
      {isEditMode && (
        <div style={{ 
          marginTop: '2rem', 
          backgroundColor: published ? '#e8f5e9' : '#fff3e0',
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: `2px solid ${published ? '#4caf50' : '#ff9800'}`
        }}>
          <h2 style={{ marginBottom: '1rem' }}>
            發布狀態: {published ? '已發布' : '草稿'}
          </h2>
          
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            {published 
              ? '此產品目前在公開網站上可見。'
              : '此產品目前為草稿狀態，公開網站無法看到。發布後，所有標記為「公開」的圖片也會一併發布。'
            }
          </p>

          {!published ? (
            <button
              onClick={handlePublish}
              disabled={saving}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: saving ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '發布中...' : '🚀 發布產品'}
            </button>
          ) : (
            <button
              onClick={handleUnpublish}
              disabled={saving}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: saving ? '#ccc' : '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '處理中...' : '取消發布'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
