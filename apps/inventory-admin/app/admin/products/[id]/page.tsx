'use client'

import { use } from 'react'
import ProductForm from '../components/ProductForm'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '2rem'
    }}>
      <ProductForm productId={id} />
    </div>
  )
}
