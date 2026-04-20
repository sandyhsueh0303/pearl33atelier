'use client'

import { useState } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { CatalogProduct, ProductImage, ProductVideo } from '@pearl33atelier/shared/types'
import { buildProductPayload, mapProductToFormValues } from './productFormHelpers'

type ProductFormSetters = {
  setTitle: (value: string) => void
  setSku: (value: string) => void
  setSkuManuallyEdited: (value: boolean) => void
  setSlug: (value: string) => void
  setLoadedSlug: (value: string) => void
  setDescription: (value: string) => void
  setSeoTitle: (value: string) => void
  setSeoDescription: (value: string) => void
  setSeoKeywords: (value: string) => void
  setOgImageAlt: (value: string) => void
  setEditorsPick: (value: boolean) => void
  setNote: (value: string) => void
  setSelectedPearlTypes: (value: string[]) => void
  setCategory: (value: any) => void
  setSizeMm: (value: string) => void
  setShape: (value: string) => void
  setLuster: (value: string) => void
  setSelectedOvertones: (value: string[]) => void
  setCustomOvertones: (value: string) => void
  setSelectedMaterials: (value: string[]) => void
  setCustomMaterials: (value: string) => void
  setLoadedSlugSource: (value: string) => void
  setSlugManuallyEdited: (value: boolean) => void
  setSellPrice: (value: string) => void
  setOriginalPrice: (value: string) => void
  setAvailability: (value: any) => void
  setPreorderNote: (value: string) => void
  setPublished: (value: boolean) => void
  setImages: (value: ProductImage[]) => void
  setVideos: (value: ProductVideo[]) => void
}

type UseProductFormDataArgs = {
  backToListPath: string
  currentProductId: string
  isEditMode: boolean
  materialOptions: readonly string[]
  normalizeMaterial: (value: string) => string
  onCreatedProductId: (productId: string) => void
  onRefreshMaterials: () => void
  overtoneOptions: readonly string[]
  router: AppRouterInstance
  setters: ProductFormSetters
}

type SubmitValues = {
  slug: string
  title: string
  sku: string
  description: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogImageAlt: string
  editorsPick: boolean
  note: string
  selectedPearlTypes: string[]
  category: any
  sizeMm: string
  shape: string
  luster: string
  overtoneValue: string
  materialValue: string
  sellPrice: string
  originalPrice: string
  availability: any
  preorderNote: string
}

type SeoValues = {
  title: string
  description: string
  pearlTypeValue: string
  category: string
  sizeMm: string
  shape: string
  luster: string
  overtoneValue: string
  materialValue: string
  availability: string
  sellPrice: string
}

export function useProductFormData({
  backToListPath,
  currentProductId,
  isEditMode,
  materialOptions,
  normalizeMaterial,
  onCreatedProductId,
  onRefreshMaterials,
  overtoneOptions,
  router,
  setters,
}: UseProductFormDataArgs) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatingSeo, setGeneratingSeo] = useState(false)

  const loadProduct = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${currentProductId}`)
      if (!response.ok) throw new Error('Failed to load product')

      const data = await response.json()
      const product: CatalogProduct = data.product
      const formValues = mapProductToFormValues({
        materialOptions,
        normalizeMaterial,
        overtoneOptions,
        product,
      })

      setters.setTitle(formValues.title)
      setters.setSku(formValues.sku)
      setters.setSkuManuallyEdited(true)
      setters.setSlug(formValues.slug)
      setters.setLoadedSlug(formValues.slug)
      setters.setDescription(formValues.description)
      setters.setSeoTitle(formValues.seoTitle)
      setters.setSeoDescription(formValues.seoDescription)
      setters.setSeoKeywords(formValues.seoKeywords)
      setters.setOgImageAlt(formValues.ogImageAlt)
      setters.setEditorsPick(formValues.editorsPick)
      setters.setNote(formValues.note)
      setters.setSelectedPearlTypes(formValues.selectedPearlTypes)
      setters.setCategory(formValues.category)
      setters.setSizeMm(formValues.sizeMm)
      setters.setShape(formValues.shape)
      setters.setLuster(formValues.luster)
      setters.setSelectedOvertones(formValues.selectedOvertones)
      setters.setCustomOvertones(formValues.customOvertones)
      setters.setSelectedMaterials(formValues.selectedMaterials)
      setters.setCustomMaterials(formValues.customMaterials)
      setters.setLoadedSlugSource(formValues.loadedSlugSource)
      setters.setSlugManuallyEdited(false)
      setters.setSellPrice(formValues.sellPrice)
      setters.setOriginalPrice(formValues.originalPrice)
      setters.setAvailability(formValues.availability)
      setters.setPreorderNote(formValues.preorderNote)
      setters.setPublished(formValues.published)
      setters.setImages(data.images || [])
      setters.setVideos(data.videos || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: SubmitValues) => {
    setSaving(true)
    setError(null)

    try {
      const productData = buildProductPayload(values)
      const url = isEditMode ? `/api/products/${currentProductId}` : '/api/products'
      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save product')
      }

      const data = await response.json()
      if (isEditMode) {
        onRefreshMaterials()
        return
      }

      const nextProductId = data.product.id as string
      onCreatedProductId(nextProductId)
      onRefreshMaterials()
      window.history.replaceState(
        null,
        '',
        `/admin/products/${nextProductId}?returnTo=${encodeURIComponent(backToListPath)}`
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateSeo = async (values: SeoValues) => {
    if (!currentProductId) return

    setGeneratingSeo(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${currentProductId}/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          pearl_type: values.pearlTypeValue || null,
          category: values.category || null,
          size_mm: values.sizeMm.trim() || null,
          shape: values.shape || null,
          luster: values.luster || null,
          overtone: values.overtoneValue || null,
          material: values.materialValue || null,
          availability: values.availability,
          sell_price: values.sellPrice ? parseFloat(values.sellPrice) : null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate SEO')
      }

      setters.setSeoTitle(data.seo?.seo_title || '')
      setters.setSeoDescription(data.seo?.seo_description || '')
      setters.setSeoKeywords(data.seo?.seo_keywords || '')
      setters.setOgImageAlt(data.seo?.og_image_alt || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate SEO')
    } finally {
      setGeneratingSeo(false)
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${currentProductId}/publish`, {
        method: 'POST',
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
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unpublish product')
      }

      setters.setPublished(false)
      alert('Product unpublished')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unpublish product')
    } finally {
      setSaving(false)
    }
  }

  return {
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
  }
}
