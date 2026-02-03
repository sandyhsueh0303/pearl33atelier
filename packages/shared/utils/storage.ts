/**
 * Storage configuration
 */
export const STORAGE_BUCKET = {
  PRODUCT_IMAGES: 'product-images'
} as const

/**
 * Get the full public URL for a product image stored in Supabase Storage
 * 
 * @param storagePath - The storage path from product_images.storage_path
 * @returns Full public URL to access the image
 * 
 * @example
 * getProductImageUrl('product-images/123/image.jpg')
 * // Returns: 'https://xxx.supabase.co/storage/v1/object/public/product-images/product-images/123/image.jpg'
 */
export function getProductImageUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET.PRODUCT_IMAGES}/${storagePath}`
}
