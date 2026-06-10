'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { clearStoredCart, useCart } from '../../components/CartProvider'
import styles from './CheckoutSuccessClient.module.css'

interface CheckoutSuccessClientProps {
  verified: boolean
}

export default function CheckoutSuccessClient({ verified }: CheckoutSuccessClientProps) {
  const { clearCart } = useCart()

  useEffect(() => {
    if (verified) {
      clearStoredCart()
      clearCart()
    }
  }, [clearCart, verified])

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.eyebrow}>
          {verified ? 'Checkout Complete' : 'Checkout Pending'}
        </p>
        <h1 className={styles.title}>
          {verified ? 'Thank you for your order' : 'We are still confirming your payment'}
        </h1>
        <p className={styles.copy}>
          {verified
            ? "Your payment was confirmed successfully through Stripe. We'll email you with any shipping or order updates."
            : 'We could not verify this checkout session yet. Your cart has been kept in place, and you can try again or contact us if needed.'}
        </p>
        {verified ? (
          <p className={styles.copy}>
            U.S. orders over $200 ship free, and U.S. orders below $200 are charged a $10 flat shipping rate.
          </p>
        ) : null}
        <div className={styles.actions}>
          <Link href="/products" className={styles.secondaryLink}>
            Continue Shopping
          </Link>
          <Link href={verified ? '/contact' : '/cart'} className={styles.primaryLink}>
            {verified ? 'Contact Us' : 'Return to Cart'}
          </Link>
        </div>
      </div>
    </main>
  )
}
