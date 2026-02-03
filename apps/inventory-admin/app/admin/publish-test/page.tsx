'use client'

import { useState } from 'react'

export default function PublishTestPage() {
  const [slug, setSlug] = useState('')
  const [action, setAction] = useState<'publish' | 'unpublish'>('publish')
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
        setSlug('') // Clear input on success
      } else {
        setResult({ success: false, message: data.error || 'Unknown error' })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Network error' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h1>Publish/Unpublish Test</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Test publishing and unpublishing products by slug identifier
      </p>

      <form onSubmit={handleSubmit} style={{ 
        padding: '1.5rem', 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            Product Slug:
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g., premium-white-akoya-8mm"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
            Enter the unique slug identifier of the product
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            Action:
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="publish"
                checked={action === 'publish'}
                onChange={(e) => setAction(e.target.value as 'publish')}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: action === 'publish' ? '#e8f5e9' : '#f5f5f5',
                borderRadius: '4px',
                color: action === 'publish' ? '#2e7d32' : '#666'
              }}>
                Publish
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="unpublish"
                checked={action === 'unpublish'}
                onChange={(e) => setAction(e.target.value as 'unpublish')}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: action === 'unpublish' ? '#fff3e0' : '#f5f5f5',
                borderRadius: '4px',
                color: action === 'unpublish' ? '#ef6c00' : '#666'
              }}>
                Unpublish
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : `${action === 'publish' ? 'Publish' : 'Unpublish'} Product`}
        </button>
      </form>

      {result && (
        <div style={{ 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: result.success ? '#e8f5e9' : '#fee',
          border: `1px solid ${result.success ? '#4caf50' : '#c00'}`,
          borderRadius: '4px'
        }}>
          <strong>{result.success ? '✓ Success:' : '✗ Error:'}</strong> {result.message}
        </div>
      )}

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        <h3 style={{ marginBottom: '0.5rem' }}>How it works:</h3>
        <ul style={{ marginLeft: '1.5rem', color: '#666' }}>
          <li><strong>Publish:</strong> Sets published=true, published_at=now()</li>
          <li><strong>Unpublish:</strong> Sets published=false, published_at=null</li>
          <li>Uses the unique <code>slug</code> field to identify products</li>
          <li>Check results in /admin/products-test or public-web /products-test</li>
        </ul>
      </div>
    </main>
  )
}
