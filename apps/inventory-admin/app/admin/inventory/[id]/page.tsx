import { Suspense } from 'react'
import AdminLoadingFallback from '../../components/AdminLoadingFallback'
import InventoryForm from '../components/InventoryForm'

export default async function EditInventoryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <InventoryForm inventoryId={id} />
    </Suspense>
  )
}
