import type { CSSProperties } from 'react'

export const pageHeroStyles: Record<string, CSSProperties> = {
  main: {
    background: 'linear-gradient(180deg, #fffdf8 0%, #ffffff 32%, #faf7f1 100%)',
  },
  section: {
    padding: '6.25rem 2rem 4rem',
    background: 'linear-gradient(180deg, #f2e9da 0%, #ffffff 100%)',
    textAlign: 'center',
  },
  inner: {
    maxWidth: '760px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '0.875rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#D4AF37',
    marginBottom: '1rem',
  },
  title: {
    fontSize: 'clamp(1.9rem, 4.8vw, 3.15rem)',
    fontWeight: 400,
    lineHeight: 1.14,
    letterSpacing: '0.02em',
    color: '#2C2C2C',
    marginBottom: '1.25rem',
    textShadow: '0 4px 12px rgba(212, 175, 55, 0.1)',
  },
  description: {
    fontSize: '1rem',
    color: '#666666',
    lineHeight: 1.68,
    maxWidth: '680px',
    margin: '0 auto',
  },
  divider: {
    width: '96px',
    height: '2px',
    margin: '1.5rem auto 0',
    background:
      'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.85) 50%, rgba(212, 175, 55, 0.08) 100%)',
  },
}
