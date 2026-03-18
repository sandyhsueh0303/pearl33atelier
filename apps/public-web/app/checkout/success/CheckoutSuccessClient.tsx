'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { clearStoredCart, useCart } from '../../components/CartProvider'
import { colors, spacing, typography } from '../../constants/design'

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
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: colors.white,
        padding: `clamp(1rem, 3vw, ${spacing['3xl']})`,
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
          border: `1px solid ${colors.lightGray}`,
          backgroundColor: '#fbf8f2',
          padding: spacing['3xl'],
        }}
      >
        <p
          style={{
            color: colors.gold,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: spacing.sm,
            fontSize: typography.fontSize.sm,
          }}
        >
          {verified ? 'Checkout Complete' : 'Checkout Pending'}
        </p>
        <h1
          style={{
            fontSize: typography.fontSize['4xl'],
            color: colors.darkGray,
            marginBottom: spacing.md,
          }}
        >
          {verified ? 'Thank you for your order' : 'We are still confirming your payment'}
        </h1>
        <p
          style={{
            color: colors.textSecondary,
            lineHeight: 1.8,
            marginBottom: spacing.xl,
          }}
        >
          {verified
            ? "Your payment was confirmed successfully through Stripe. We'll email you with any shipping or order updates."
            : 'We could not verify this checkout session yet. Your cart has been kept in place, and you can try again or contact us if needed.'}
        </p>
        {verified ? (
          <p
            style={{
              color: colors.textSecondary,
              lineHeight: 1.8,
              marginBottom: spacing.xl,
            }}
          >
            U.S. orders over $200 ship free, and U.S. orders below $200 are charged a $10 flat shipping rate.
          </p>
        ) : null}
        <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: `${spacing.sm} ${spacing.lg}`,
              border: `1px solid ${colors.darkGray}`,
              color: colors.darkGray,
              textDecoration: 'none',
            }}
          >
            Continue Shopping
          </Link>
          <Link
            href={verified ? '/contact' : '/cart'}
            style={{
              display: 'inline-block',
              padding: `${spacing.sm} ${spacing.lg}`,
              backgroundColor: colors.darkGray,
              color: colors.white,
              textDecoration: 'none',
            }}
          >
            {verified ? 'Contact Us' : 'Return to Cart'}
          </Link>
        </div>
      </div>
    </main>
  )
}
