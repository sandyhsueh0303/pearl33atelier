'use client'

import { use } from 'react'
import ProductForm from '../components/ProductForm'
import ProductCostAnalysis from '../components/ProductCostAnalysis'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '2rem'
    }}>
      {/* Basic Product Info */}
      <ProductForm productId={id} />
      
      {/* Divider */}
      <div style={{ 
        margin: '3rem 0', 
        borderTop: '2px solid #e0e0e0',
        position: 'relative'
      }}>
        <span style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '0 1rem',
          fontSize: '0.875rem',
          color: '#666',
          fontWeight: '600'
        }}>
          成本分析與利潤計算
        </span>
      </div>

      {/* Cost Analysis: Materials + Other Costs + Profit */}
      <ProductCostAnalysis productId={id} />
    </div>
  )
}
