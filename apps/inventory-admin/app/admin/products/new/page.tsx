import { Suspense } from 'react'
import AdminLoadingFallback from '../../components/AdminLoadingFallback'
import ProductForm from '../components/ProductForm'

export default function NewProductPage() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <ProductForm />
    </Suspense>
  )
}
