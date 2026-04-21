import type { CSSProperties } from 'react'
import type { CatalogProduct } from '@pearl33atelier/shared/types'

export interface ProductWithStats extends CatalogProduct {
  total_cost?: number
  profit?: number
}

export interface ProductSummaryStats {
  total: number
  published: number
  draft: number
  sold: number
  preorder: number
}

export type ProductFilterStatus =
  | 'active'
  | 'all'
  | 'published'
  | 'draft'
  | 'in_stock'
  | 'preorder'
  | 'sold'

export function formatCategory(category: string) {
  const labels: Record<string, string> = {
    BRACELETS: 'Bracelets',
    NECKLACES: 'Necklaces',
    EARRINGS: 'Earrings',
    STUDS: 'Studs',
    RINGS: 'Rings',
    PENDANTS: 'Pendants',
    LOOSE_PEARLS: 'Loose Pearls',
    BROOCHES: 'Brooches',
  }
  return labels[category] || category
}

export function formatMoney(value?: number) {
  return value !== undefined ? `$ ${value.toLocaleString()}` : '-'
}

export function getAvailabilityMeta(availability: ProductWithStats['availability']): {
  label: string
  className: string
  style: CSSProperties
} {
  if (availability === 'IN_STOCK') {
    return {
      label: 'In Stock',
      className: 'admin-pill admin-pill-success',
      style: {},
    }
  }

  if (availability === 'PREORDER') {
    return {
      label: 'Preorder',
      className: 'admin-pill admin-pill-gold',
      style: {},
    }
  }

  return {
    label: 'Sold',
    className: 'admin-pill',
    style: {
      background: '#FEE2E2',
      color: '#B91C1C',
    },
  }
}
