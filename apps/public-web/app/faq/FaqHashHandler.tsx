'use client'

import { useEffect } from 'react'

function openFaqByHash() {
  const hash = window.location.hash.replace('#', '').trim()
  if (!hash) return

  const target = document.getElementById(decodeURIComponent(hash))
  if (!target) return

  if (target instanceof HTMLDetailsElement) {
    target.open = true
  } else {
    const details = target.closest('details')
    if (details instanceof HTMLDetailsElement) {
      details.open = true
    }
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

export default function FaqHashHandler() {
  useEffect(() => {
    openFaqByHash()
    const handler = () => openFaqByHash()
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  return null
}
