import { createSupabaseClient } from '@33pearlatelier/shared/supabase'
import type { CatalogProduct } from '@33pearlatelier/shared/types'

export default async function ProductsTestPage() {
  let products: CatalogProduct[] = []
  let error: string | null = null

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error: supabaseError } = await supabase
      .from('catalog_products')
      .select('*')
      .order('created_at', { ascending: false })

    if (supabaseError) throw supabaseError
    products = data || []
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Products Test (Public)</h1>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Testing Supabase query - Only shows published products (RLS filtered)
      </p>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #c00',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && (
        <div>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Total published products:</strong> {products.length}
          </p>

          {products.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic' }}>
              No published products found. Create and publish products in the admin panel.
            </p>
          ) : (
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Slug</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Title</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Pearl Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Published</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#0066cc' }}>
                      {product.slug}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{product.title}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {product.pearl_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {product.sell_price ? `$${product.sell_price}` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{ 
                        color: product.published ? 'green' : 'orange',
                        fontWeight: 'bold'
                      }}>
                        {product.published ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
      }}>
        <h3>Connection Info:</h3>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '(not set)'}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          <strong>Using:</strong> Anon Key (public access, RLS enforced)
        </p>
      </div>
    </main>
  )
}
