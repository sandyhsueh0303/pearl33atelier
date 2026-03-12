import { Suspense } from 'react'
import InventoryForm from '../components/InventoryForm'

export default async function EditInventoryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <InventoryForm inventoryId={id} />
    </Suspense>
  )
}
