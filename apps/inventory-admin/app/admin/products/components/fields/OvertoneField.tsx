'use client'

import MultiSelectDropdownField from './MultiSelectDropdownField'

type OvertoneGroups = Record<string, readonly string[]>

type OvertoneFieldProps = {
  overtoneGroups: OvertoneGroups
  selectedOvertones: string[]
  customOvertones: string
  onSelectedOvertonesChange: (values: string[]) => void
  onCustomOvertonesChange: (value: string) => void
}

export default function OvertoneField({
  overtoneGroups,
  selectedOvertones,
  customOvertones,
  onSelectedOvertonesChange,
  onCustomOvertonesChange,
}: OvertoneFieldProps) {
  return (
    <MultiSelectDropdownField
      label="Overtone"
      selectedValues={selectedOvertones}
      onSelectedValuesChange={onSelectedOvertonesChange}
      placeholder="Select overtone"
      optionGroups={Object.entries(overtoneGroups).map(([label, options]) => ({ label, options }))}
      customValue={customOvertones}
      customPlaceholder="Additional overtones (optional)"
      onCustomValueChange={onCustomOvertonesChange}
    />
  )
}
