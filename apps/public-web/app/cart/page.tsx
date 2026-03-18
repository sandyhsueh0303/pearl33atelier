'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '../components/CartProvider'
import { colors, spacing, typography, shadows } from '../constants/design'

export default function CartPage() {
  const { items, itemCount, subtotal, hydrated, updateQuantity, removeItem, clearCart } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutCancelled, setCheckoutCancelled] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(false)

  const hasPricelessItem = items.some((item) => typeof item.price !== 'number' || item.price <= 0)
  const hasPreorderItem = items.some((item) => item.availability === 'PREORDER')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCheckoutCancelled(params.get('checkout') === 'cancelled')
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateLayout = () => setIsMobileLayout(mediaQuery.matches)

    updateLayout()
    mediaQuery.addEventListener('change', updateLayout)

    return () => mediaQuery.removeEventListener('change', updateLayout)
  }, [])

  const getAvailabilityLabel = (availability: string) => {
    if (availability === 'PREORDER') return 'Pre-order'
    if (availability === 'OUT_OF_STOCK') return 'Sold Out'
    return 'In Stock'
  }

  const getAvailabilityStyles = (availability: string) => {
    if (availability === 'PREORDER') {
      return {
        backgroundColor: colors.champagne,
        color: colors.gold,
      }
    }

    if (availability === 'OUT_OF_STOCK') {
      return {
        backgroundColor: '#fbe9e7',
        color: '#b71c1c',
      }
    }

    return {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
    }
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      })

      const payload = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Unable to start checkout.')
      }

      window.location.href = payload.url
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to start checkout.')
      setCheckoutLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: colors.white, padding: `clamp(1rem, 3vw, ${spacing['3xl']})` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: typography.fontSize['4xl'], marginBottom: spacing.md, color: colors.darkGray }}>
          Shopping Cart
        </h1>
        <p style={{ color: colors.textSecondary, marginBottom: spacing.lg, maxWidth: '760px', lineHeight: 1.8 }}>
          Review your selected pieces here, then continue to secure Stripe checkout to place your order.
        </p>
        <div
          style={{
            marginBottom: spacing.xl,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: spacing.md,
          }}
        >
          <div
            style={{
              padding: spacing.md,
              backgroundColor: '#fbf8f2',
              border: `1px solid ${colors.lightGray}`,
            }}
          >
            <div
              style={{
                color: colors.darkGray,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: spacing.xs,
              }}
            >
              Checkout
            </div>
            <div style={{ color: colors.textSecondary, lineHeight: 1.7 }}>
              U.S. checkout is currently available. International orders are handled by request.
            </div>
          </div>
          <div
            style={{
              padding: spacing.md,
              backgroundColor: '#fbf8f2',
              border: `1px solid ${colors.lightGray}`,
            }}
          >
            <div
              style={{
                color: colors.darkGray,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: spacing.xs,
              }}
            >
              Shipping
            </div>
            <div style={{ color: colors.textSecondary, lineHeight: 1.7 }}>
              Free U.S. shipping over $200 · $10 flat rate below
            </div>
          </div>
        </div>
        {checkoutCancelled && (
          <div
            style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: '#fbf8f2',
              border: `1px solid ${colors.lightGray}`,
              color: colors.textSecondary,
            }}
          >
            Your Stripe checkout was cancelled. Your cart is still saved here.
          </div>
        )}
        {checkoutError && (
          <div
            style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#9f1239',
            }}
          >
            {checkoutError}
          </div>
        )}

        {!hydrated ? (
          <p style={{ color: colors.textSecondary }}>Loading cart...</p>
        ) : items.length === 0 ? (
          <div style={{ border: `1px solid ${colors.lightGray}`, padding: spacing.xl, backgroundColor: colors.pearl }}>
            <p style={{ marginBottom: spacing.md, color: colors.darkGray }}>Your cart is empty.</p>
            <Link href="/products" style={{ color: colors.gold, textDecoration: 'none' }}>
              Browse Collection →
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: spacing.md }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobileLayout ? '84px minmax(0, 1fr)' : '96px minmax(0, 1fr) auto',
                    gap: spacing.md,
                    alignItems: 'center',
                    border: `1px solid ${colors.lightGray}`,
                    padding: spacing.md,
                    backgroundColor: colors.white,
                    boxShadow: shadows.subtle,
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: isMobileLayout ? '84px' : '96px',
                        height: isMobileLayout ? '112px' : '128px',
                        backgroundColor: colors.pearl,
                        overflow: 'hidden',
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <Link href={`/products/${item.slug}`} style={{ color: colors.darkGray, textDecoration: 'none' }}>
                      <div
                        style={{
                          fontWeight: typography.fontWeight.medium,
                          fontSize: isMobileLayout ? typography.fontSize.base : typography.fontSize.lg,
                          lineHeight: 1.45,
                        }}
                      >
                        {item.title}
                      </div>
                    </Link>
                    <div style={{ marginTop: spacing.xs, display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '4px 10px',
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          letterSpacing: '0.04em',
                          ...getAvailabilityStyles(item.availability),
                        }}
                      >
                        {getAvailabilityLabel(item.availability)}
                      </span>
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs, lineHeight: 1.6 }}>
                      {[item.pearlType, item.sizeMm ? `${item.sizeMm}mm` : null].filter(Boolean).join(' · ')}
                    </div>
                    <div style={{ color: colors.darkGray, marginTop: spacing.sm, fontSize: typography.fontSize.lg }}>
                      {typeof item.price === 'number' ? `$ ${item.price.toLocaleString()}` : 'Price on request'}
                    </div>
                    {typeof item.price !== 'number' || item.price <= 0 ? (
                      <div style={{ color: '#9f1239', fontSize: typography.fontSize.sm, marginTop: spacing.sm, lineHeight: 1.6 }}>
                        This item is not available for online checkout yet.
                      </div>
                    ) : null}
                    {item.availability === 'PREORDER' ? (
                      <div style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.sm, lineHeight: 1.6 }}>
                        Pre-order items can proceed to checkout even when current material stock is limited.
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: spacing.md,
                      flexWrap: isMobileLayout ? 'wrap' : 'nowrap',
                      alignSelf: 'center',
                      whiteSpace: 'nowrap',
                      gridColumn: isMobileLayout ? '1 / -1' : undefined,
                      paddingTop: isMobileLayout ? spacing.sm : 0,
                      borderTop: isMobileLayout ? `1px solid ${colors.lightGray}` : 'none',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{ border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer', fontSize: typography.fontSize.sm, padding: 0 }}
                    >
                      Remove
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, border: `1px solid ${colors.lightGray}`, padding: '6px' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: '30px', height: '30px', border: `1px solid ${colors.lightGray}`, background: colors.white, cursor: 'pointer', color: colors.textSecondary }}
                      >
                        −
                      </button>
                      <span style={{ minWidth: '28px', textAlign: 'center', color: colors.darkGray }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: '30px', height: '30px', border: `1px solid ${colors.lightGray}`, background: colors.white, cursor: 'pointer', color: colors.textSecondary }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: spacing.xl,
                border: `1px solid ${colors.lightGray}`,
                backgroundColor: '#fffdf9',
                padding: spacing.xl,
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: spacing.md,
              }}
            >
              <div>
                <div style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: spacing.xs }}>
                  Order Summary
                </div>
                <div style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>Items: {itemCount}</div>
                <div style={{ color: colors.darkGray, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.medium }}>
                  Subtotal: $ {subtotal.toLocaleString()}
                </div>
                {hasPreorderItem && (
                  <div style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs, lineHeight: 1.7 }}>
                    Your cart includes pre-order pieces. These can still proceed to checkout even when current material stock is limited.
                  </div>
                )}
                {hasPricelessItem && (
                  <div style={{ color: '#9f1239', fontSize: typography.fontSize.sm, marginTop: spacing.xs, lineHeight: 1.7 }}>
                    One or more items do not have a valid online checkout price yet.
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'end' }}>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{ padding: `${spacing.sm} ${spacing.lg}`, flex: '1 1 180px', border: `1px solid ${colors.lightGray}`, background: colors.white, cursor: 'pointer' }}
                >
                  Clear Cart
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || hasPricelessItem}
                  style={{
                    padding: `${spacing.sm} ${spacing.lg}`,
                    flex: '2 1 280px',
                    backgroundColor: colors.darkGray,
                    color: colors.white,
                    border: `1px solid ${colors.darkGray}`,
                    cursor: checkoutLoading || hasPricelessItem ? 'not-allowed' : 'pointer',
                    opacity: checkoutLoading || hasPricelessItem ? 0.6 : 1,
                  }}
                >
                  {checkoutLoading ? 'Redirecting…' : 'Checkout with Stripe'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
