import { Suspense } from 'react'
import ProductForm from '../components/ProductForm'

export default function NewProductPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <ProductForm />
    </Suspense>
  )
}
