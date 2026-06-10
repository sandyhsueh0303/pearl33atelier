import { Suspense } from 'react'
import AdminLoadingFallback from '../../components/AdminLoadingFallback'
import AiDraftClient from './AiDraftClient'

export default function AiDraftProductPage() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AiDraftClient />
    </Suspense>
  )
}
