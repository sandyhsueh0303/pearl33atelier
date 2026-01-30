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

// ============================================
// Table: admin_users (access control)
// ============================================
export interface AdminUser {
  user_id: string // uuid, matches auth.uid()
  created_at: string // timestamptz
}

// ============================================
// Table: inventory_items (internal inventory truth)
// ============================================
export interface InventoryItem {
  id: string // uuid
  vendor: string
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
  quality: string // UNIQUE - public identifier (replaces slug)
  description: string | null
  pearl_type: PearlType
  size_mm: number | null // numeric(4,1)
  shape: string | null
  material: string | null
  sell_price: number | null // numeric(12,2), >= 0
  original_price: number | null // numeric(12,2), >= 0
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

// ============================================
// Database Schema
// ============================================
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, 'created_at'>
        Update: Partial<Omit<AdminUser, 'user_id' | 'created_at'>>
      }
      inventory_items: {
        Row: InventoryItem
        Insert: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>
      }
      catalog_products: {
        Row: CatalogProduct
        Insert: Omit<CatalogProduct, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CatalogProduct, 'id' | 'created_at' | 'updated_at'>>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>
      }
    }
    Enums: {
      pearl_type: PearlType
      availability_kind: AvailabilityKind
    }
  }
}
