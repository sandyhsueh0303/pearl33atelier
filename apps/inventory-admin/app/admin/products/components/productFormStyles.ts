import type { CSSProperties } from 'react'

export const pageContainerStyle: CSSProperties = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  fontFamily: 'sans-serif',
}

export const headerRowStyle: CSSProperties = {
  marginBottom: '2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export const headerActionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
}

export const secondaryButtonStyle: CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
}

export const errorBannerStyle: CSSProperties = {
  padding: '1rem',
  backgroundColor: '#fee',
  border: '1px solid #c00',
  borderRadius: '4px',
  marginBottom: '1rem',
}

export const cardStyle: CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

export const sectionCardStyle: CSSProperties = {
  marginTop: '2rem',
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

export const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.5rem',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
}

export const textInputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
}

export const textareaStyle: CSSProperties = {
  ...textInputStyle,
  fontFamily: 'inherit',
  resize: 'vertical',
}

export const selectStyle: CSSProperties = {
  ...textInputStyle,
  backgroundColor: '#fff',
}

export const monospaceInputStyle: CSSProperties = {
  ...textInputStyle,
  fontFamily: 'monospace',
}

export const helperTextStyle: CSSProperties = {
  color: '#666',
  display: 'block',
  marginTop: '0.35rem',
}

export const mutedTextStyle: CSSProperties = {
  color: '#666',
}

export const submitRowStyle: CSSProperties = {
  marginTop: '2rem',
  display: 'flex',
  gap: '1rem',
}

export function primaryButtonStyle(disabled: boolean, activeColor: string): CSSProperties {
  return {
    padding: '0.75rem 2rem',
    backgroundColor: disabled ? '#ccc' : activeColor,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

export function uploadButtonStyle(disabled: boolean, activeColor: string): CSSProperties {
  return {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: disabled ? '#ccc' : activeColor,
    color: 'white',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
  }
}
