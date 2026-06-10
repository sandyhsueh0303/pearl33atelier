import { Suspense } from 'react'
import AdminLoadingFallback from '../../components/AdminLoadingFallback'
import InventoryForm from "../components/InventoryForm"

export default function NewInventoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<AdminLoadingFallback />}>
        <InventoryForm />
      </Suspense>
    </div>
  )
}
