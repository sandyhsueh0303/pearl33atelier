// Design System for 33 Pearl Atelier
// Minimalist Elegant Theme

export const colors = {
  // Primary colors
  white: '#FFFFFF',
  gold: '#D4AF37',
  darkGray: '#2C2C2C',
  
  // Secondary colors
  lightGray: '#F5F5F5',
  mediumGray: '#888888',
  subtleGray: '#FAFAFA',
  
  // Accent colors
  pearl: '#F8F6F0',
  champagne: '#F7E7CE',
  
  // Text colors
  textPrimary: '#2C2C2C',
  textSecondary: '#666666',
  textLight: '#888888',
}

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem',      // 48px
  '2xl': '4rem',   // 64px
  '3xl': '6rem',   // 96px
  '4xl': '8rem',   // 128px
  '5xl': '12rem',  // 192px
}

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
}

export const transitions = {
  fast: '0.15s ease',
  normal: '0.3s ease',
  slow: '0.5s ease',
}

export const shadows = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
  soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
}
