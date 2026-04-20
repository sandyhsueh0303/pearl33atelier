'use client'

import MultiSelectDropdownField from './MultiSelectDropdownField'

type MaterialFieldProps = {
  materialOptions: readonly string[]
  selectedMaterials: string[]
  customMaterials: string
  onSelectedMaterialsChange: (values: string[]) => void
  onCustomMaterialsChange: (value: string) => void
}

export default function MaterialField({
  materialOptions,
  selectedMaterials,
  customMaterials,
  onSelectedMaterialsChange,
  onCustomMaterialsChange,
}: MaterialFieldProps) {
  return (
    <MultiSelectDropdownField
      label="Material"
      selectedValues={selectedMaterials}
      onSelectedValuesChange={onSelectedMaterialsChange}
      placeholder="Select material"
      optionGroups={[{ label: 'Materials', options: materialOptions }]}
      customValue={customMaterials}
      customPlaceholder="Additional materials (optional)"
      onCustomValueChange={onCustomMaterialsChange}
    />
  )
}
