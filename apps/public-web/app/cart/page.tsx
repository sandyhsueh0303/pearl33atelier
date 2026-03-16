'use client'

import Link from 'next/link'
import { useCart } from '../components/CartProvider'
import { colors, spacing, typography, shadows } from '../constants/design'

export default function CartPage() {
  const { items, itemCount, subtotal, hydrated, updateQuantity, removeItem, clearCart } = useCart()

  return (
    <main style={{ minHeight: '100vh', backgroundColor: colors.white, padding: `clamp(1rem, 3vw, ${spacing['3xl']})` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: typography.fontSize['4xl'], marginBottom: spacing.md, color: colors.darkGray }}>
          Shopping Cart
        </h1>
        <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
          Your guest cart is saved in your browser. Submit an inquiry from this cart and we&apos;ll confirm availability, payment, and shipping details with you directly.
        </p>

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
                    gridTemplateColumns: '96px 1fr auto',
                    gap: spacing.md,
                    alignItems: 'center',
                    border: `1px solid ${colors.lightGray}`,
                    padding: spacing.md,
                    backgroundColor: colors.white,
                    boxShadow: shadows.subtle,
                  }}
                >
                  <div
                    style={{
                      width: '96px',
                      height: '128px',
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

                  <div>
                    <Link href={`/products/${item.slug}`} style={{ color: colors.darkGray, textDecoration: 'none' }}>
                      <div style={{ fontWeight: typography.fontWeight.medium }}>{item.title}</div>
                    </Link>
                    <div style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
                      {[item.pearlType, item.sizeMm ? `${item.sizeMm}mm` : null].filter(Boolean).join(' · ')}
                    </div>
                    <div style={{ color: colors.darkGray, marginTop: spacing.xs }}>
                      {typeof item.price === 'number' ? `$ ${item.price.toLocaleString()}` : 'Price on request'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: spacing.xs }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: '28px', height: '28px', border: `1px solid ${colors.lightGray}`, background: colors.white, cursor: 'pointer' }}
                      >
                        −
                      </button>
                      <span style={{ minWidth: '22px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: '28px', height: '28px', border: `1px solid ${colors.lightGray}`, background: colors.white, cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{ border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer', fontSize: typography.fontSize.sm }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: spacing.xl,
                borderTop: `1px solid ${colors.lightGray}`,
                paddingTop: spacing.lg,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: spacing.md,
              }}
            >
              <div>
                <div style={{ color: colors.textSecondary }}>Items: {itemCount}</div>
                <div style={{ color: colors.darkGray, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.medium }}>
                  Subtotal: $ {subtotal.toLocaleString()}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
                  This cart does not check out online. Proceed to inquiry and we&apos;ll confirm availability, payment, and shipping details personally.
                </div>
              </div>
              <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{ padding: `${spacing.sm} ${spacing.lg}`, border: `1px solid ${colors.lightGray}`, background: colors.white, cursor: 'pointer' }}
                >
                  Clear Cart
                </button>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-block',
                    padding: `${spacing.sm} ${spacing.lg}`,
                    backgroundColor: colors.darkGray,
                    color: colors.white,
                    textDecoration: 'none',
                  }}
                >
                  Proceed to Inquiry
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
