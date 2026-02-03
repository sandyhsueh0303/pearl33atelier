# Usage Examples for @pearl33atelier/shared

This file demonstrates how to use the shared types and Supabase client in both public-web and inventory-admin applications.

## Setup

```typescript
import type { 
  CatalogProduct, 
  InventoryItem, 
  ProductImage,
  AdminUser,
  PearlType,
  AvailabilityKind,
  Database 
} from '@pearl33atelier/shared/types'

import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
```

---

## PUBLIC WEB (Unauthenticated - Anon Key)

```typescript
const publicSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### List all published products

RLS automatically filters to only show published=true

```typescript
export async function getPublishedProducts() {
  const { data, error } = await publicSupabase
    .from('catalog_products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data // CatalogProduct[]
}

/**
 * Get product by quality (for /products/[quality] route)
 * NOTE: Using 'quality' instead of 'slug' or 'id'
 */
export async function getProductByQuality(quality: string) {
  const { data, error } = await publicSupabase
    .from('catalog_products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('quality', quality)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get published images for a product
 */
export async function getPublishedProductImages(productId: string) {
  const { data, error } = await publicSupabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .eq('published', true)
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data // ProductImage[]
}

/**
 * Get primary image for a product
 */
export async function getPrimaryProductImage(productId: string) {
  const { data, error } = await publicSupabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .eq('published', true)
    .eq('is_primary', true)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Filter products by pearl type
 */
export async function getProductsByPearlType(pearlType: PearlType) {
  const { data, error } = await publicSupabase
    .from('catalog_products')
    .select('*')
    .eq('pearl_type', pearlType)
  
  if (error) throw error
  return data
}

/**
 * Get in-stock products only
 */
export async function getInStockProducts() {
  const { data, error } = await publicSupabase
    .from('catalog_products')
    .select('*')
    .eq('availability', 'IN_STOCK')
  
  if (error) throw error
  return data
}

/**
 * Get preorder products only
 */
export async function getPreorderProducts() {
  const { data, error } = await publicSupabase
    .from('catalog_products')
    .select('*')
    .eq('availability', 'PREORDER')
  
  if (error) throw error
  return data
}

// ============================================
// INVENTORY ADMIN (Authenticated)
// ============================================

const adminSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Check if current user is admin
 * Required before performing admin operations
 */
export async function isCurrentUserAdmin() {
  const { data: { user } } = await adminSupabase.auth.getUser()
  if (!user) return false
  
  const { data, error } = await adminSupabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single()
  
  return !!data
}

// ============================================
// Inventory Items (Admin Only)
// ============================================

/**
 * Create new inventory item
 */
export async function createInventoryItem(
  item: Database['public']['Tables']['inventory_items']['Insert']
) {
  const { data, error } = await adminSupabase
    .from('inventory_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get all inventory items
 */
export async function getInventoryItems() {
  const { data, error } = await adminSupabase
    .from('inventory_items')
    .select('*')
    .order('purchase_date', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(
  id: string,
  updates: Database['public']['Tables']['inventory_items']['Update']
) {
  const { data, error } = await adminSupabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update inventory quantities (on_hand and reserved)
 */
export async function updateInventoryQuantities(
  id: string,
  onHand: number,
  reserved: number
) {
  // Validation: reserved <= on_hand
  if (reserved > onHand) {
    throw new Error('Reserved quantity cannot exceed on_hand quantity')
  }
  
  const { data, error } = await adminSupabase
    .from('inventory_items')
    .update({ on_hand: onHand, reserved })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// Catalog Products (Admin CRUD)
// ============================================

/**
 * Create new catalog product
 */
export async function createCatalogProduct(
  product: Database['public']['Tables']['catalog_products']['Insert']
) {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .insert(product)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get all catalog products (including unpublished)
 */
export async function getAllCatalogProducts() {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .select(`
      *,
      inventory_item:inventory_items(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Get single catalog product by ID
 */
export async function getCatalogProductById(id: string) {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .select(`
      *,
      inventory_item:inventory_items(*),
      images:product_images(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update catalog product
 */
export async function updateCatalogProduct(
  id: string,
  updates: Database['public']['Tables']['catalog_products']['Update']
) {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Publish a product
 * Sets published=true and published_at=now()
 */
export async function publishProduct(id: string) {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .update({
      published: true,
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Unpublish a product
 * Sets published=false and published_at=null
 */
export async function unpublishProduct(id: string) {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .update({
      published: false,
      published_at: null
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete catalog product
 * This will cascade delete all product_images
 */
export async function deleteCatalogProduct(id: string) {
  const { error } = await adminSupabase
    .from('catalog_products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================
// Product Images (Admin CRUD)
// ============================================

/**
 * Create new product image
 */
export async function createProductImage(
  image: Database['public']['Tables']['product_images']['Insert']
) {
  const { data, error } = await adminSupabase
    .from('product_images')
    .insert(image)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId: string) {
  const { data, error } = await adminSupabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data
}

/**
 * Publish a product image
 */
export async function publishProductImage(id: string) {
  const { data, error } = await adminSupabase
    .from('product_images')
    .update({ published: true })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Unpublish a product image
 */
export async function unpublishProductImage(id: string) {
  const { data, error } = await adminSupabase
    .from('product_images')
    .update({ published: false })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Set primary image for a product
 * Only one image can be primary per product
 */
export async function setPrimaryImage(productId: string, imageId: string) {
  // First, unset all primary flags for this product
  await adminSupabase
    .from('product_images')
    .update({ is_primary: false })
    .eq('product_id', productId)
  
  // Then set the specified image as primary
  const { data, error } = await adminSupabase
    .from('product_images')
    .update({ is_primary: true })
    .eq('id', imageId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update image sort order
 */
export async function updateImageSortOrder(id: string, sortOrder: number) {
  const { data, error } = await adminSupabase
    .from('product_images')
    .update({ sort_order: sortOrder })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Reorder images for a product
 * Pass array of image IDs in desired order
 */
export async function reorderProductImages(productId: string, imageIds: string[]) {
  const promises = imageIds.map((imageId, index) => 
    updateImageSortOrder(imageId, index)
  )
  
  return Promise.all(promises)
}

/**
 * Delete product image
 * NOTE: This only deletes the database record, not the file in storage
 */
export async function deleteProductImage(id: string) {
  const { error } = await adminSupabase
    .from('product_images')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================
// Complex Queries
// ============================================

/**
 * Get products with low inventory (admin only)
 */
export async function getLowInventoryProducts(threshold: number = 5) {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .select(`
      *,
      inventory_item:inventory_items!inner(*)
    `)
    .lt('inventory_item.on_hand', threshold)
  
  if (error) throw error
  return data
}

/**
 * Get products by vendor (admin only)
 */
export async function getProductsByVendor(vendor: string) {
  const { data, error } = await adminSupabase
    .from('catalog_products')
    .select(`
      *,
      inventory_item:inventory_items!inner(*)
    `)
    .eq('inventory_item.vendor', vendor)
  
  if (error) throw error
  return data
}

/**
 * Search products by title or description
 */
export async function searchProducts(searchTerm: string) {
  const { data, error } = await publicSupabase
    .from('catalog_products')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  
  if (error) throw error
  return data
}
