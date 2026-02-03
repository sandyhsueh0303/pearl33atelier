/**
 * Storage configuration
 */
export const STORAGE_BUCKET = 'product-images' as const

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
 * (Signature A: Flexible version that accepts supabaseUrl as parameter)
 * 
 * Use this when:
 * - You need to override the Supabase URL (e.g., different environments)
 * - Running in non-Next.js environments (Node.js scripts, workers)
 * - Testing with mock URLs
 * - Supporting multiple Supabase projects
 * 
 * @param supabaseUrl - The Supabase project URL
 * @param storagePath - The storage path from product_images.storage_path (includes 'product-images/' prefix)
 * @returns Full public URL to access the image
 * 
 * @example
 * // storagePath from DB already includes 'product-images/' prefix
 * const url = getImageUrl('https://xxx.supabase.co', 'product-images/123/image.jpg')
 * // Returns: 'https://xxx.supabase.co/storage/v1/object/public/product-images/product-images/123/image.jpg'
 * 
 * @example
 * // Testing with mock URL
 * const testUrl = getImageUrl('http://localhost:54321', 'product-images/test/mock.jpg')
 */
export function getImageUrl(supabaseUrl: string, storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`
}

/**
 * Get the full public URL for a product image stored in Supabase Storage
 * (Signature B: Convenience version that reads from environment)
 * 
 * Use this when:
 * - Working in Next.js components (client or server)
 * - You want simplified caller code
 * - Using the default Supabase project
 * 
 * Note: This function requires process.env.NEXT_PUBLIC_SUPABASE_URL
 * and is tightly coupled to Next.js environment.
 * 
 * @param storagePath - The storage path from product_images.storage_path (includes 'product-images/' prefix)
 * @returns Full public URL to access the image
 * 
 * @example
 * // In Next.js components - storagePath from DB already includes prefix
 * const imageUrl = getProductImageUrl('product-images/123/image.jpg')
 * // Returns: 'https://xxx.supabase.co/storage/v1/object/public/product-images/product-images/123/image.jpg'
 */
export function getProductImageUrl(storagePath: string): string {
  const supabaseUrl = getSupabaseUrl()
  return getImageUrl(supabaseUrl, storagePath)
}
