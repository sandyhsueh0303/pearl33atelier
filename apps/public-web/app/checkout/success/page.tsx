import CheckoutSuccessClient from './CheckoutSuccessClient'
import { stripe } from '../../lib/stripe'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  let verified = false

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      verified = session.payment_status === 'paid' || session.status === 'complete'
    } catch (error) {
      console.error('[checkout/success] Failed to verify checkout session', {
        sessionId,
        error,
      })
    }
  }

  return <CheckoutSuccessClient verified={verified} />
}
