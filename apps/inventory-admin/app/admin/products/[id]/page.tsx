'use client'

import { use, useState } from 'react'
import ProductForm from '../components/ProductForm'
import ProductMaterials from '../components/ProductMaterials'
import QuickSaleButton from '../components/QuickSaleButton'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [costAnalysisRefreshToken, setCostAnalysisRefreshToken] = useState(0)
  
  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '2rem'
    }}>
      {/* Header with Quick Sale Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h1 style={{ margin: 0 }}>Edit Product</h1>
        <QuickSaleButton productId={id} />
      </div>

      {/* Basic Product Info */}
      <ProductForm
        productId={id}
        onSaved={() => setCostAnalysisRefreshToken((prev) => prev + 1)}
      />
      
      <div style={{ marginTop: '2rem' }}>
        <ProductMaterials productId={id} refreshToken={costAnalysisRefreshToken} />
      </div>
    </div>
  )
}
