export const ETSY_WEIGHT_UNITS = ['oz', 'lb', 'g', 'kg'] as const
export const ETSY_DIMENSION_UNITS = ['in', 'ft', 'mm', 'cm', 'm', 'yd'] as const

export const DEFAULT_ETSY_ITEM_PACKAGE = {
  itemWeight: 2,
  itemWeightUnit: 'oz' as const,
  itemLength: 4,
  itemWidth: 4,
  itemHeight: 2,
  itemDimensionsUnit: 'in' as const,
}
