import type { CSSProperties } from 'react'

export const pageHeroStyles: Record<string, CSSProperties> = {
  main: {
    background: 'linear-gradient(180deg, #fffdf8 0%, #ffffff 32%, #faf7f1 100%)',
  },
  section: {
    padding: '8rem 3rem 6rem',
    background: 'linear-gradient(180deg, #f2e9da 0%, #ffffff 100%)',
    textAlign: 'center',
  },
  inner: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '0.875rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#D4AF37',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: 'clamp(2.2rem, 6.5vw, 4rem)',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '0.03em',
    color: '#2C2C2C',
    marginBottom: '2rem',
    textShadow: '0 6px 16px rgba(212, 175, 55, 0.14)',
  },
  description: {
    fontSize: '1.125rem',
    color: '#666666',
    lineHeight: 1.75,
    maxWidth: '760px',
    margin: '0 auto',
  },
  divider: {
    width: '96px',
    height: '2px',
    margin: '2rem auto 0',
    background:
      'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.85) 50%, rgba(212, 175, 55, 0.08) 100%)',
  },
}
