'use client'

import MultiSelectDropdownField from './MultiSelectDropdownField'

type PearlTypeFieldProps = {
  options: readonly string[]
  selectedPearlTypes: string[]
  onSelectedPearlTypesChange: (values: string[]) => void
}

export default function PearlTypeField({
  options,
  selectedPearlTypes,
  onSelectedPearlTypesChange,
}: PearlTypeFieldProps) {
  return (
    <MultiSelectDropdownField
      label="Pearl Type"
      required
      selectedValues={selectedPearlTypes}
      onSelectedValuesChange={onSelectedPearlTypesChange}
      placeholder="Select pearl type"
      helperText="Choose one or more pearl types."
      optionGroups={[{ label: 'Pearl Types', options }]}
    />
  )
}
