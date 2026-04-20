'use client'

import { useId } from 'react'
import { helperTextStyle, labelStyle, textInputStyle } from '../productFormStyles'

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

  const toggleValue = (value: string) => {
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value]
    onSelectedValuesChange(nextValues)
  }

  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required ? <span style={{ color: 'red' }}> *</span> : null}
      </label>

      <details
        style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#fff',
        }}
      >
        <summary
          style={{
            listStyle: 'none',
            cursor: 'pointer',
            padding: '0.75rem',
            color: selectedValues.length > 0 ? '#111' : '#666',
            fontSize: '1rem',
            lineHeight: 1.4,
          }}
        >
          {selectedLabel}
        </summary>

        <div
          style={{
            padding: '0 0.75rem 0.75rem',
            borderTop: '1px solid #eee',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          {optionGroups.map((group) => (
            <div key={group.label}>
              {optionGroups.length > 1 ? (
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', margin: '0.75rem 0 0.5rem' }}>
                  {group.label}
                </div>
              ) : null}
              <div style={{ display: 'grid', gap: '0.45rem' }}>
                {group.options.map((option) => (
                  <label
                    key={option}
                    htmlFor={`${fieldId}-${option}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.95rem',
                      color: '#333',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      id={`${fieldId}-${option}`}
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
            <input
              type="text"
              value={customValue}
              onChange={(e) => onCustomValueChange(e.target.value)}
              placeholder={customPlaceholder}
              style={{ ...textInputStyle, padding: '0.625rem', fontSize: '0.95rem' }}
            />
          ) : null}
        </div>
      </details>

      {helperText ? <small style={helperTextStyle}>{helperText}</small> : null}
    </div>
  )
}
