import type { AvailabilityKind } from '../types'

export interface MaterialInventoryInput {
  inventory_item_id: string
  quantity_per_unit: number
  inventory_item: {
    total_quantity: number | null
    allocated_quantity: number | null
    name?: string | null
  } | null
}

export interface MaterialInventoryComponent {
  inventoryItemId: string
  materialName: string | null
  quantityPerUnit: number
  totalQuantity: number
  allocatedQuantity: number
  availableComponentQuantity: number
  producibleUnits: number
}

export interface ProductInventorySummary {
  tracked: boolean
  availableQuantity: number | null
  availability: AvailabilityKind
  limitingMaterialName: string | null
  components: MaterialInventoryComponent[]
}

export function resolveProductAvailability(
  manualAvailability: AvailabilityKind,
  inventorySummary: Pick<ProductInventorySummary, 'tracked' | 'availability'>
): AvailabilityKind {
  if (manualAvailability === 'PREORDER') return 'PREORDER'
  if (inventorySummary.tracked) return inventorySummary.availability
  return manualAvailability
}

function normalizeQuantity(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

function normalizeQuantityPerUnit(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1
  return Math.max(1, Math.floor(value))
}

export function computeProductInventorySummary(
  materials: MaterialInventoryInput[],
  fallbackAvailability: AvailabilityKind = 'IN_STOCK'
): ProductInventorySummary {
  if (materials.length === 0) {
    return {
      tracked: false,
      availableQuantity: null,
      availability: fallbackAvailability,
      limitingMaterialName: null,
      components: [],
    }
  }

  const components = materials.map((material) => {
    const quantityPerUnit = normalizeQuantityPerUnit(material.quantity_per_unit)
    const totalQuantity = normalizeQuantity(material.inventory_item?.total_quantity)
    const allocatedQuantity = normalizeQuantity(material.inventory_item?.allocated_quantity)
    const availableComponentQuantity = Math.max(0, totalQuantity - allocatedQuantity)
    const producibleUnits = Math.floor(availableComponentQuantity / quantityPerUnit)

    return {
      inventoryItemId: material.inventory_item_id,
      materialName: material.inventory_item?.name ?? null,
      quantityPerUnit,
      totalQuantity,
      allocatedQuantity,
      availableComponentQuantity,
      producibleUnits,
    }
  })

  const limitingComponent = components.reduce((lowest, component) => {
    if (!lowest || component.producibleUnits < lowest.producibleUnits) return component
    return lowest
  }, null as MaterialInventoryComponent | null)

  const availableQuantity = limitingComponent?.producibleUnits ?? 0

  return {
    tracked: true,
    availableQuantity,
    availability: availableQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    limitingMaterialName: limitingComponent?.materialName ?? null,
    components,
  }
}
