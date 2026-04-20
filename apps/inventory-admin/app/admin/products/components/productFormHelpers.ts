import {
  materialValueToSlugPart,
  pearlTypeValueToSlugPart,
  slugify,
} from '@pearl33atelier/shared'
import type {
  AvailabilityKind,
  CatalogProduct,
  ProductCategory,
} from '@pearl33atelier/shared/types'

type BuildDefaultSlugArgs = {
  pearlType: string
  sizeMm: string | null | undefined
  shape: string | null | undefined
  material: string | null | undefined
  category: string | null | undefined
}

type MapProductToFormValuesArgs = {
  materialOptions: readonly string[]
  normalizeMaterial: (value: string) => string
  overtoneOptions: readonly string[]
  product: CatalogProduct
}

type ProductFormValues = {
  title: string
  sku: string
  slug: string
  description: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogImageAlt: string
  editorsPick: boolean
  note: string
  selectedPearlTypes: string[]
  category: ProductCategory | ''
  sizeMm: string
  shape: string
  luster: string
  selectedOvertones: string[]
  customOvertones: string
  selectedMaterials: string[]
  customMaterials: string
  loadedSlugSource: string
  sellPrice: string
  originalPrice: string
  availability: AvailabilityKind
  preorderNote: string
  published: boolean
}

type BuildProductPayloadArgs = {
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
  category: ProductCategory | ''
  sizeMm: string
  shape: string
  luster: string
  overtoneValue: string
  materialValue: string
  sellPrice: string
  originalPrice: string
  availability: AvailabilityKind
  preorderNote: string
}

export const splitMultiValueInput = (value: string) =>
  value
    .split(/[,;/\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)

export function buildDefaultSlugFromValues({
  pearlType,
  sizeMm,
  shape,
  material,
  category,
}: BuildDefaultSlugArgs) {
  const parts = [
    pearlTypeValueToSlugPart(pearlType),
    String(sizeMm || '').trim(),
    String(shape || '').trim(),
    materialValueToSlugPart(String(material || '')),
    category,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  return slugify(parts.join('-'))
}

export function mapProductToFormValues({
  materialOptions,
  normalizeMaterial,
  overtoneOptions,
  product,
}: MapProductToFormValuesArgs): ProductFormValues {
  const rawOvertones = splitMultiValueInput(product.overtone || '')
  const matchedOvertones: string[] = []
  const unmatchedOvertones: string[] = []

  rawOvertones.forEach((item) => {
    const found = overtoneOptions.find((option) => option === item.toLowerCase())
    if (found) {
      matchedOvertones.push(found)
    } else {
      unmatchedOvertones.push(item)
    }
  })

  const rawMaterials = splitMultiValueInput(product.material || '')
  const matchedMaterials: string[] = []
  const unmatchedMaterials: string[] = []

  rawMaterials.forEach((item) => {
    const found = materialOptions.find(
      (option) => normalizeMaterial(option) === normalizeMaterial(item)
    )
    if (found) {
      matchedMaterials.push(found)
    } else {
      unmatchedMaterials.push(item)
    }
  })

  return {
    title: product.title,
    sku: product.sku || '',
    slug: product.slug,
    description: product.description || '',
    seoTitle: product.seo_title || '',
    seoDescription: product.seo_description || '',
    seoKeywords: product.seo_keywords || '',
    ogImageAlt: product.og_image_alt || '',
    editorsPick: product.editors_pick || false,
    note: product.note || '',
    selectedPearlTypes: splitMultiValueInput(product.pearl_type),
    category: product.category || '',
    sizeMm: product.size_mm || '',
    shape: product.shape || '',
    luster: product.luster || '',
    selectedOvertones: Array.from(new Set(matchedOvertones)),
    customOvertones: unmatchedOvertones.join(', '),
    selectedMaterials: Array.from(new Set(matchedMaterials)),
    customMaterials: unmatchedMaterials.join(', '),
    loadedSlugSource: buildDefaultSlugFromValues({
      pearlType: product.pearl_type,
      sizeMm: product.size_mm,
      shape: product.shape,
      material: product.material,
      category: product.category,
    }),
    sellPrice: product.sell_price?.toString() || '',
    originalPrice: product.original_price?.toString() || '',
    availability: product.availability === 'PREORDER' ? 'PREORDER' : 'IN_STOCK',
    preorderNote: product.preorder_note || '',
    published: product.published,
  }
}

export function buildProductPayload({
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
}: BuildProductPayloadArgs) {
  return {
    slug,
    title,
    sku: sku.trim() || null,
    description: description || null,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    seo_keywords: seoKeywords || null,
    og_image_alt: ogImageAlt || null,
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
    published: false,
    inventory_item_id: null,
  }
}
