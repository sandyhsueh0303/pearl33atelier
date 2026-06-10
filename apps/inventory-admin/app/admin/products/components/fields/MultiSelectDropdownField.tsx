'use client'

import { useId } from 'react'
import styles from './MultiSelectDropdownField.module.css'

type OptionGroup = {
  label: string
  options: readonly string[]
}

type MultiSelectDropdownFieldProps = {
  label: string
  required?: boolean
  selectedValues: string[]
  onSelectedValuesChange: (values: string[]) => void
  helperText?: string
  placeholder: string
  optionGroups: readonly OptionGroup[]
  customValue?: string
  customPlaceholder?: string
  onCustomValueChange?: (value: string) => void
}

export default function MultiSelectDropdownField({
  label,
  required = false,
  selectedValues,
  onSelectedValuesChange,
  helperText,
  placeholder,
  optionGroups,
  customValue,
  customPlaceholder,
  onCustomValueChange,
}: MultiSelectDropdownFieldProps) {
  const fieldId = useId()
  const selectedLabel = selectedValues.length > 0 ? selectedValues.join(', ') : placeholder
  const customInputId = `${fieldId}-custom`

  const toggleValue = (value: string) => {
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value]
    onSelectedValuesChange(nextValues)
  }

  return (
    <div>
      <div className={styles.fieldLabel}>
        {label}
        {required ? <span className={styles.required}> *</span> : null}
      </div>

      <details className={styles.dropdown}>
        <summary className={`${styles.summary} ${selectedValues.length > 0 ? styles.hasSelection : styles.placeholder}`}>
          {selectedLabel}
        </summary>

        <div className={styles.menu}>
          {optionGroups.map((group) => (
            <div key={group.label}>
              {optionGroups.length > 1 ? (
                <div className={styles.groupLabel}>
                  {group.label}
                </div>
              ) : null}
              <div className={styles.optionGrid}>
                {group.options.map((option, optionIndex) => (
                  <label
                    key={option}
                    htmlFor={`${fieldId}-${group.label}-${optionIndex}`}
                    className={styles.optionLabel}
                  >
                    <input
                      id={`${fieldId}-${group.label}-${optionIndex}`}
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => toggleValue(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {typeof customValue === 'string' && onCustomValueChange ? (
            <div>
              <label className={styles.visuallyHidden} htmlFor={customInputId}>
                Custom {label}
              </label>
              <input
                id={customInputId}
                type="text"
                value={customValue}
                onChange={(e) => onCustomValueChange(e.target.value)}
                placeholder={customPlaceholder}
                className={styles.customInput}
              />
            </div>
          ) : null}
        </div>
      </details>

      {helperText ? <small className={styles.helperText}>{helperText}</small> : null}
    </div>
  )
}
