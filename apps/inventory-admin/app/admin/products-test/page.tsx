import { createSupabaseClient } from '@33pearlatelier/shared/supabase'
import type { CatalogProduct } from '@33pearlatelier/shared/types'

export default async function AdminProductsTestPage() {
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

  const publishedCount = products.filter(p => p.published).length
  const draftCount = products.filter(p => !p.published).length

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Products Test (Admin)</h1>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Testing Supabase query - Shows ALL products including drafts (admin access)
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
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1rem' 
          }}>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#e8f5e9',
              borderRadius: '4px',
              flex: 1
            }}>
              <p style={{ fontSize: '0.875rem', color: '#2e7d32' }}>Published</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>
                {publishedCount}
              </p>
            </div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fff3e0',
              borderRadius: '4px',
              flex: 1
            }}>
              <p style={{ fontSize: '0.875rem', color: '#ef6c00' }}>Draft</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef6c00' }}>
                {draftCount}
              </p>
            </div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              flex: 1
            }}>
              <p style={{ fontSize: '0.875rem', color: '#1565c0' }}>Total</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1565c0' }}>
                {products.length}
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic' }}>
              No products found. Create products in the admin panel.
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
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Quality</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Title</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Pearl Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Availability</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Published At</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ 
                    borderBottom: '1px solid #eee',
                    backgroundColor: product.published ? 'white' : '#fffbf0'
                  }}>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: product.published ? '#e8f5e9' : '#fff3e0',
                        color: product.published ? '#2e7d32' : '#ef6c00'
                      }}>
                        {product.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#0066cc' }}>
                      {product.quality}
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
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor: product.availability === 'IN_STOCK' ? '#e8f5e9' : '#fff3e0',
                        color: product.availability === 'IN_STOCK' ? '#2e7d32' : '#ef6c00'
                      }}>
                        {product.availability}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                      {product.published_at 
                        ? new Date(product.published_at).toLocaleString()
                        : '-'
                      }
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
          <strong>Using:</strong> Anon Key (requires RLS policies for admin access)
        </p>
      </div>
    </main>
  )
}
