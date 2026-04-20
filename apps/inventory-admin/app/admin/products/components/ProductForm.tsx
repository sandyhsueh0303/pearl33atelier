'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  slugify,
  getProductImageUrl,
  getProductVideoUrl,
} from '@pearl33atelier/shared'
import type { AvailabilityKind, ProductCategory, ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import ProductMediaSection from './ProductMediaSection'
import ProductMaterials from './ProductMaterials'
import ProductPublishSection from './ProductPublishSection'
import ProductSeoPanel from './ProductSeoPanel'
import QuickSaleButton from './QuickSaleButton'
import MaterialField from './fields/MaterialField'
import OvertoneField from './fields/OvertoneField'
import PearlTypeField from './fields/PearlTypeField'
import {
  buildDefaultSlugFromValues,
  splitMultiValueInput,
} from './productFormHelpers'
import {
  LUSTER_OPTIONS,
  MATERIAL_OPTIONS,
  OVERTONE_GROUPS,
  OVERTONE_OPTIONS,
  PEARL_TYPE_OPTIONS,
  SHAPE_OPTIONS,
} from './productFormConfig'
import {
  cardStyle,
  errorBannerStyle,
  formGridStyle,
  headerActionsStyle,
  headerRowStyle,
  helperTextStyle,
  labelStyle,
  monospaceInputStyle,
  mutedTextStyle,
  pageContainerStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  selectStyle,
  submitRowStyle,
  textInputStyle,
  textareaStyle,
} from './productFormStyles'
import { useProductFormData } from './useProductFormData'
import { useProductMediaManager } from './useProductMediaManager'

interface ProductFormProps {
  productId?: string
}

const normalizeMaterial = (value: string) => value.trim().toLowerCase()

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentProductId, setCurrentProductId] = useState(productId || '')
  const isEditMode = !!currentProductId
  const returnTo = searchParams.get('returnTo') || ''
  const backToListPath = returnTo.startsWith('/admin/products') ? returnTo : '/admin/products'
  const [costAnalysisRefreshToken, setCostAnalysisRefreshToken] = useState(0)

  // Form fields
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false)
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [loadedSlug, setLoadedSlug] = useState('')
  const [loadedSlugSource, setLoadedSlugSource] = useState('')
  const [description, setDescription] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [ogImageAlt, setOgImageAlt] = useState('')
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
  const [videos, setVideos] = useState<ProductVideo[]>([])

  const {
    error,
    generatingSeo,
    handleGenerateSeo,
    handlePublish,
    handleSubmit,
    handleUnpublish,
    loadProduct,
    loading,
    saving,
    setError,
  } = useProductFormData({
    backToListPath,
    currentProductId,
    isEditMode,
    materialOptions: MATERIAL_OPTIONS,
    normalizeMaterial,
    onCreatedProductId: setCurrentProductId,
    onRefreshMaterials: () => setCostAnalysisRefreshToken((prev) => prev + 1),
    overtoneOptions: OVERTONE_OPTIONS,
    router,
    setters: {
      setTitle,
      setSku,
      setSkuManuallyEdited,
      setSlug,
      setLoadedSlug,
      setDescription,
      setSeoTitle,
      setSeoDescription,
      setSeoKeywords,
      setOgImageAlt,
      setEditorsPick,
      setNote,
      setSelectedPearlTypes,
      setCategory,
      setSizeMm,
      setShape,
      setLuster,
      setSelectedOvertones,
      setCustomOvertones,
      setSelectedMaterials,
      setCustomMaterials,
      setLoadedSlugSource,
      setSlugManuallyEdited,
      setSellPrice,
      setOriginalPrice,
      setAvailability,
      setPreorderNote,
      setPublished,
      setImages,
      setVideos,
    },
  })

  const {
    deleteImage,
    deleteVideo,
    handleImageUpload,
    handleVideoUpload,
    setPrimaryImage,
    toggleImagePublished,
    toggleVideoPublished,
    uploadingImages,
    uploadingVideos,
  } = useProductMediaManager({
    currentProductId,
    setError,
    setImages,
    setVideos,
  })

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

  const buildDefaultSlug = () =>
    buildDefaultSlugFromValues({
      pearlType: pearlTypeValue,
      sizeMm,
      shape,
      material: materialValue,
      category,
    })

  const handlePearlTypeSelect = (values: string[]) => {
    setSelectedPearlTypes(values)
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
      void loadProduct()
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

  const handleMaterialSelect = (values: string[]) => {
    setSelectedMaterials(values)
  }

  const handleOvertoneSelect = (values: string[]) => {
    setSelectedOvertones(values)
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div className="admin-product-form-page" style={pageContainerStyle}>
      <div className="admin-product-form-header" style={headerRowStyle}>
        <h1 className="admin-product-form-title">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
        <div className="admin-product-form-header-actions" style={headerActionsStyle}>
          {isEditMode && <QuickSaleButton productId={currentProductId} />}
          <button
            onClick={() => router.push(backToListPath)}
            className="admin-product-form-back-button"
            style={secondaryButtonStyle}
          >
            Back to list
          </button>
        </div>
      </div>

      {error && (
        <div style={errorBannerStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit({
            slug,
            title,
            sku,
            description,
            seoTitle,
            seoDescription,
            seoKeywords,
            ogImageAlt,
            editorsPick,
            note,
            selectedPearlTypes,
            category,
            sizeMm,
            shape,
            luster,
            overtoneValue,
            materialValue,
            sellPrice,
            originalPrice,
            availability,
            preorderNote,
          })
        }}
        className="admin-product-form-card"
        style={cardStyle}
      >
        <div className="admin-product-form-grid" style={formGridStyle}>
          <div className="admin-product-form-full">
            <label style={labelStyle}>
              Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              SKU
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => handleSkuChange(e.target.value)}
              placeholder="e.g.: PA0001"
              style={monospaceInputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Slug (URL slug) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              placeholder="white-akoya-8mm"
              style={monospaceInputStyle}
            />
            <small style={{ ...helperTextStyle, marginTop: '0.25rem' }}>
              {isEditMode
                ? 'Auto-updates when product details change until you edit it manually. URL will update after saving.'
                : 'Auto-generated from product details, but editable manually'}
            </small>
          </div>

          <PearlTypeField
            options={PEARL_TYPE_OPTIONS}
            selectedPearlTypes={selectedPearlTypes}
            onSelectedPearlTypesChange={handlePearlTypeSelect}
          />

          <div>
            <label style={labelStyle}>
              Product Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
              style={selectStyle}
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
            <label style={labelStyle}>
              Size (mm)
            </label>
            <input
              type="text"
              value={sizeMm}
              onChange={(e) => setSizeMm(e.target.value)}
              placeholder="e.g.: 7.5 or 7-7.5 or 3.5-8"
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Shape
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              style={{ ...selectStyle, textTransform: 'capitalize' }}
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
            <label style={labelStyle}>
              Luster
            </label>
            <select
              value={luster}
              onChange={(e) => setLuster(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select luster</option>
              {LUSTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
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

          <OvertoneField
            overtoneGroups={OVERTONE_GROUPS}
            selectedOvertones={selectedOvertones}
            customOvertones={customOvertones}
            onSelectedOvertonesChange={handleOvertoneSelect}
            onCustomOvertonesChange={setCustomOvertones}
          />

          <MaterialField
            materialOptions={MATERIAL_OPTIONS}
            selectedMaterials={selectedMaterials}
            customMaterials={customMaterials}
            onSelectedMaterialsChange={handleMaterialSelect}
            onCustomMaterialsChange={setCustomMaterials}
          />

          <div>
            <label style={labelStyle}>
              Sell Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Original Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Selling Mode <span style={{ color: 'red' }}>*</span>
            </label>
            <p style={{ margin: '0 0 0.5rem 0', ...mutedTextStyle, fontSize: '0.875rem', lineHeight: 1.5 }}>
              `Preorder` is a manual selling mode. Actual in-stock or sold-out status is determined by BOM material inventory.
            </p>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityKind)}
              required
              style={selectStyle}
            >
              <option value="IN_STOCK">Normal Sale</option>
              <option value="PREORDER">Preorder</option>
            </select>
          </div>

          {availability === 'PREORDER' && (
            <div className="admin-product-form-full">
              <label style={labelStyle}>
                Preorder Note
              </label>
              <input
                type="text"
                value={preorderNote}
                onChange={(e) => setPreorderNote(e.target.value)}
                placeholder="e.g.: Expected in 2 weeks"
                style={textInputStyle}
              />
            </div>
          )}

          <div className="admin-product-form-full">
            <label style={labelStyle}>
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={textareaStyle}
            />
          </div>

          <div className="admin-product-form-full">
            <ProductSeoPanel
              isEditMode={isEditMode}
              currentProductId={currentProductId}
              generatingSeo={generatingSeo}
              title={title}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              seoKeywords={seoKeywords}
              ogImageAlt={ogImageAlt}
              onGenerateSeo={() =>
                void handleGenerateSeo({
                  title,
                  description,
                  pearlTypeValue,
                  category,
                  sizeMm,
                  shape,
                  luster,
                  overtoneValue,
                  materialValue,
                  availability,
                  sellPrice,
                })
              }
              onSeoTitleChange={setSeoTitle}
              onSeoDescriptionChange={setSeoDescription}
              onSeoKeywordsChange={setSeoKeywords}
              onOgImageAltChange={setOgImageAlt}
            />
          </div>

          <div className="admin-product-form-full">
            <label style={labelStyle}>
              Internal Notes (admin only)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Internal notes, e.g. inventory source or reminders"
              style={{ ...textareaStyle, backgroundColor: '#fffef0' }}
            />
          </div>
        </div>

        <div className="admin-product-form-submit-row" style={submitRowStyle}>
          <button
            type="submit"
            disabled={saving}
            className="admin-product-form-primary-button"
            style={primaryButtonStyle(saving, '#1976d2')}
          >
            {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Product (Draft)')}
          </button>
        </div>
      </form>

      {isEditMode && (
        <ProductMediaSection
          title={title}
          images={images}
          videos={videos}
          uploadingImages={uploadingImages}
          uploadingVideos={uploadingVideos}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          onSetPrimaryImage={setPrimaryImage}
          onToggleImagePublished={toggleImagePublished}
          onDeleteImage={deleteImage}
          onToggleVideoPublished={toggleVideoPublished}
          onDeleteVideo={deleteVideo}
        />
      )}

      {/* Publish Section - Only show in edit mode */}
      {isEditMode && (
        <ProductPublishSection
          published={published}
          saving={saving}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
        />
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
              ...cardStyle,
              padding: '1.5rem',
              ...mutedTextStyle,
            }}
          >
            Save the product first to manage BOM materials.
          </div>
        )}
      </div>
    </div>
  )
}
