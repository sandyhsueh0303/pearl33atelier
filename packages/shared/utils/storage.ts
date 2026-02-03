/**
 * Storage configuration
 */
export const STORAGE_BUCKET = 'product-images'

/**
 * Get Supabase URL from environment variable
 * 
 * IMPORTANT: NEXT_PUBLIC_SUPABASE_URL is inlined at build time by Next.js.
 * This means the value must be set BEFORE the build starts.
 * If you set environment variables after build, they will not be available.
 * 
 * @returns Supabase project URL
 * @throws Error if NEXT_PUBLIC_SUPABASE_URL is not defined
 * 
 * @example
 * const url = getSupabaseUrl()
 * // Returns: 'https://xxxxxxxxxxxxx.supabase.co'
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not defined. ' +
      'This environment variable must be set BEFORE build starts. ' +
      'On platforms like Zeabur, ensure environment variables are configured before triggering the build.'
    )
  }
  
  return url
}

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
  const supabaseUrl = getSupabaseUrl()
  
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`
}
