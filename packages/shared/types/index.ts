// ============================================
// Supabase Generated Types
// ============================================
import type { Database as SupabaseDatabase } from './database.types'
export type { Database, Json } from './database.types'

// ============================================
// Type Helpers: Extract Row types from generated Database type
// ============================================
type Tables = SupabaseDatabase['public']['Tables']
export type AdminUserRow = Tables['admin_users']['Row']
export type InventoryItemRow = Tables['inventory_items']['Row']
export type CatalogProductRow = Tables['catalog_products']['Row']
export type ProductImageRow = Tables['product_images']['Row']

// ============================================
// Enums
// ============================================
export type PearlType = 
  | 'WhiteAkoya'
  | 'GreyAkoya'
  | 'WhiteSouthSea'
  | 'GoldenSouthSea'
  | 'Tahitian'
  | 'Freshwater'
  | 'Other'

export type AvailabilityKind = 
  | 'IN_STOCK'
  | 'PREORDER'
  | 'OUT_OF_STOCK'

export type ProductCategory =
  | 'BRACELETS'
  | 'NECKLACES'
  | 'EARRINGS'
  | 'STUDS'
  | 'RINGS'
  | 'PENDANTS'
  | 'LOOSE_PEARLS'
  | 'BROOCHES'

// ============================================
// Table: admin_users (access control)
// Note: Currently only has user_id + created_at in DB
// ============================================
export interface AdminUser {
  user_id: string // uuid, PK, matches auth.users.id
  created_at: string // timestamptz
}

// ============================================
// API response: 登入後的 session 資訊
// (從 auth.users + admin_users 拼接而來，不對應單一張表)
// Note: role is hardcoded to 'admin' until role column is added to DB
// ============================================
export interface SessionUser {
  user_id: string // uuid, from auth.users.id
  email: string // from auth.users.email
  name: string | null // from auth.users.user_metadata.name
  role: 'admin' // fixed value, not from DB yet
}

// ============================================
// Table: inventory_items (internal inventory truth)
// ============================================
export interface InventoryItem {
  id: string // uuid
  name: string
  purchase_date: string // date
  cost: number // numeric(12,2)
  on_hand: number // int, >= 0
  reserved: number // int, >= 0, <= on_hand
  internal_note: string | null
  created_at: string // timestamptz
  updated_at: string // timestamptz
}

// ============================================
// Table: catalog_products (public product listing)
// ============================================
export interface CatalogProduct {
  id: string // uuid
  inventory_item_id: string | null // uuid, FK -> inventory_items.id
  title: string
  slug: string // UNIQUE - public identifier for URLs
  description: string | null
  note: string | null // internal notes for admin
  pearl_type: PearlType
  size_mm: string | null // text, supports ranges like "7-7.5"
  shape: string | null
  material: string | null
  sell_price: number | null // numeric(12,2), >= 0
  original_price: number | null // numeric(12,2), >= 0
  category: ProductCategory | null
  availability: AvailabilityKind
  preorder_note: string | null
  published: boolean
  published_at: string | null // timestamptz
  created_at: string // timestamptz
  updated_at: string // timestamptz
}

// ============================================
// Table: product_images (photos in Supabase Storage)
// ============================================
export interface ProductImage {
  id: string // uuid
  product_id: string // uuid, FK -> catalog_products.id
  published: boolean
  is_primary: boolean
  storage_path: string
  sort_order: number // >= 0
  created_at: string // timestamptz
}
