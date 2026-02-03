import { createSupabaseClient } from '@33pearlatelier/shared/supabase'
import type { CatalogProduct, ProductImage } from '@33pearlatelier/shared/types'
import ProductList from './ProductList'

interface ProductWithImages extends CatalogProduct {
  primaryImage?: ProductImage
}

export default async function ProductsPage() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get published products
  const { data: productsData, error: productsError } = await supabase
    .from('catalog_products')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (productsError) {
    console.error('Error loading products:', productsError)
    return (
      <main style={{ 
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        padding: '2rem',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#fee', 
          border: '1px solid #c00',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <strong>Error:</strong> Failed to load products
        </div>
      </main>
    )
  }

  // Get primary images for all products
  const productsList = (productsData as any[]) || []
  const productIds = productsList.map(p => p.id)
  
  let imagesList: any[] = []
  if (productIds.length > 0) {
    const { data: imagesData } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .eq('published', true)
      .eq('is_primary', true)

    imagesList = (imagesData as any[]) || []
  }

  // Combine products with their primary images
  const products: ProductWithImages[] = productsList.map(product => ({
    ...product,
    primaryImage: imagesList.find(img => img.product_id === product.id)
  }))

  return <ProductList products={products} />
}
