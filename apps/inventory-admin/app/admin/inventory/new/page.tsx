import { Suspense } from 'react'
import InventoryForm from "../components/InventoryForm"

export default function NewInventoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
        <InventoryForm />
      </Suspense>
    </div>
  )
}
