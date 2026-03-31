import type { AvailabilityKind } from '../types'
import {
  computeProductInventorySummary,
  resolveProductAvailability,
  type MaterialInventoryInput,
} from './materialInventory'

interface InventoryClient {
  from: (table: string) => any
}

interface CatalogProductAvailabilityRow {
  id: string
  availability: AvailabilityKind
}

interface ProductMaterialRow {
  product_id: string
  inventory_item_id: string
  quantity_per_unit: number
  inventory_items?:
    | MaterialInventoryInput['inventory_item']
    | MaterialInventoryInput['inventory_item'][]
    | null
}

export async function fetchProductMaterialInputs(
  supabase: InventoryClient,
  productId: string
): Promise<MaterialInventoryInput[]> {
  const materialsByProductId = await fetchProductMaterialInputsByProductIds(supabase, [productId])
  return materialsByProductId.get(productId) || []
}

export async function fetchProductMaterialInputsByProductIds(
  supabase: InventoryClient,
  productIds: string[]
): Promise<Map<string, MaterialInventoryInput[]>> {
  const normalizedProductIds = Array.from(new Set(productIds.map((id) => String(id).trim()).filter(Boolean)))
  const materialsByProductId = new Map<string, MaterialInventoryInput[]>()

  if (normalizedProductIds.length === 0) {
    return materialsByProductId
  }

  const { data, error } = await supabase
    .from('product_materials')
    .select(`
      product_id,
      inventory_item_id,
      quantity_per_unit,
      inventory_items (
        name,
        total_quantity,
        allocated_quantity
      )
    `)
    .in('product_id', normalizedProductIds)

  if (error) {
    throw new Error(error.message)
  }

  for (const material of (data || []) as ProductMaterialRow[]) {
    const existing = materialsByProductId.get(material.product_id) || []
    existing.push({
      inventory_item_id: material.inventory_item_id,
      quantity_per_unit: material.quantity_per_unit,
      inventory_item: Array.isArray(material.inventory_items)
        ? material.inventory_items[0] ?? null
        : material.inventory_items ?? null,
    })
    materialsByProductId.set(material.product_id, existing)
  }

  return materialsByProductId
}

export async function syncProductAvailabilitySnapshots(
  supabase: InventoryClient,
  productIds: string[]
): Promise<Map<string, AvailabilityKind>> {
  const normalizedProductIds = Array.from(new Set(productIds.map((id) => String(id).trim()).filter(Boolean)))
  const syncedAvailabilityByProductId = new Map<string, AvailabilityKind>()

  if (normalizedProductIds.length === 0) {
    return syncedAvailabilityByProductId
  }

  const [{ data: products, error: productsError }, materialsByProductId] = await Promise.all([
    supabase
      .from('catalog_products')
      .select('id, availability')
      .in('id', normalizedProductIds),
    fetchProductMaterialInputsByProductIds(supabase, normalizedProductIds),
  ])

  if (productsError) {
    throw new Error(productsError.message)
  }

  const productRows = (products || []) as CatalogProductAvailabilityRow[]
  const updates = productRows
    .map((product) => {
      const inventorySummary = computeProductInventorySummary(
        materialsByProductId.get(product.id) || [],
        product.availability
      )
      const nextAvailability = resolveProductAvailability(product.availability, inventorySummary)

      syncedAvailabilityByProductId.set(product.id, nextAvailability)

      if (nextAvailability === product.availability) {
        return null
      }

      return { productId: product.id, availability: nextAvailability }
    })
    .filter((update): update is { productId: string; availability: AvailabilityKind } => Boolean(update))

  await Promise.all(
    updates.map(async (update) => {
      const { error } = await supabase
        .from('catalog_products')
        .update({ availability: update.availability })
        .eq('id', update.productId)

      if (error) {
        throw new Error(error.message)
      }
    })
  )

  return syncedAvailabilityByProductId
}

export async function syncProductAvailabilityForInventoryItems(
  supabase: InventoryClient,
  inventoryItemIds: string[]
) {
  const normalizedInventoryItemIds = Array.from(
    new Set(inventoryItemIds.map((id) => String(id).trim()).filter(Boolean))
  )

  if (normalizedInventoryItemIds.length === 0) {
    return new Map<string, AvailabilityKind>()
  }

  const { data, error } = await supabase
    .from('product_materials')
    .select('product_id')
    .in('inventory_item_id', normalizedInventoryItemIds)

  if (error) {
    throw new Error(error.message)
  }

  const productIds = Array.from(
    new Set(
      ((data || []) as Array<{ product_id: string | null }>)
        .map((row) => row.product_id || '')
        .filter(Boolean)
    )
  )

  return syncProductAvailabilitySnapshots(supabase, productIds)
}

export async function applyMaterialInventoryDelta(
  supabase: InventoryClient,
  productId: string,
  unitsDelta: number
) {
  const normalizedUnits = Math.trunc(unitsDelta)
  if (normalizedUnits === 0) return

  const materials = await fetchProductMaterialInputs(supabase, productId)
  if (materials.length === 0) return

  if (normalizedUnits > 0) {
    const summary = computeProductInventorySummary(materials, 'IN_STOCK')
    if (summary.availableQuantity !== null && normalizedUnits > summary.availableQuantity) {
      throw new Error(
        summary.limitingMaterialName
          ? `Insufficient material stock. Limited by ${summary.limitingMaterialName}.`
          : 'Insufficient material stock.'
      )
    }
  }

  const adjustments = materials.map((material) => {
    const currentTotal = material.inventory_item?.total_quantity ?? 0
    const currentAllocated = material.inventory_item?.allocated_quantity ?? 0
    const requiredUnits = Math.max(1, Math.floor(material.quantity_per_unit)) * Math.abs(normalizedUnits)
    const nextAllocated =
      normalizedUnits > 0 ? currentAllocated + requiredUnits : currentAllocated - requiredUnits

    if (nextAllocated < 0) {
      const materialName = material.inventory_item?.name || 'material'
      throw new Error(`${materialName} allocation would go negative.`)
    }

    if (nextAllocated > currentTotal) {
      const materialName = material.inventory_item?.name || 'material'
      throw new Error(`${materialName} allocation would exceed total quantity.`)
    }

    return {
      inventoryItemId: material.inventory_item_id,
      nextAllocated,
    }
  })

  await Promise.all(
    adjustments.map(async (adjustment) => {
      const { error } = await supabase
        .from('inventory_items')
        .update({ allocated_quantity: adjustment.nextAllocated })
        .eq('id', adjustment.inventoryItemId)

      if (error) {
        throw new Error(error.message)
      }
    })
  )

  await syncProductAvailabilitySnapshots(supabase, [productId])
}
