import { computeProductInventorySummary, type MaterialInventoryInput } from '@pearl33atelier/shared'

interface InventoryClient {
  from: (table: string) => any
}

interface MaterialRow extends MaterialInventoryInput {
  inventory_item: MaterialInventoryInput['inventory_item']
}

export async function fetchProductMaterialInputs(
  supabase: InventoryClient,
  productId: string
): Promise<MaterialRow[]> {
  const { data, error } = await supabase
    .from('product_materials')
    .select(`
      inventory_item_id,
      quantity_per_unit,
      inventory_items (
        name,
        total_quantity,
        allocated_quantity
      )
    `)
    .eq('product_id', productId)

  if (error) {
    throw new Error(error.message)
  }

  return ((data || []) as Array<
    MaterialInventoryInput & {
      inventory_items?: MaterialInventoryInput['inventory_item'] | MaterialInventoryInput['inventory_item'][]
    }
  >).map((material) => ({
    inventory_item_id: material.inventory_item_id,
    quantity_per_unit: material.quantity_per_unit,
    inventory_item: Array.isArray(material.inventory_items)
      ? material.inventory_items[0] ?? null
      : material.inventory_items ?? null,
  }))
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
    if (
      summary.availableQuantity !== null &&
      normalizedUnits > summary.availableQuantity
    ) {
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
}
