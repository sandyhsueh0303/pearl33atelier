import { Suspense } from 'react'
import AiDraftClient from './AiDraftClient'

export default function AiDraftProductPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <AiDraftClient />
    </Suspense>
  )
}
