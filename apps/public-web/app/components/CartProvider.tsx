'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export const CART_STORAGE_KEY = 'pearl33_cart_v1'

export interface CartItem {
  id: string
  slug: string
  title: string
  imageUrl: string | null
  pearlType: string | null
  sizeMm: string | null
  price: number | null
  availability: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  hydrated: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function safeReadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const obj = item as Partial<CartItem>
        if (!obj.id || !obj.slug || !obj.title) return null
        return {
          id: String(obj.id),
          slug: String(obj.slug),
          title: String(obj.title),
          imageUrl: obj.imageUrl ? String(obj.imageUrl) : null,
          pearlType: obj.pearlType ? String(obj.pearlType) : null,
          sizeMm: obj.sizeMm ? String(obj.sizeMm) : null,
          price: typeof obj.price === 'number' ? obj.price : null,
          availability: String(obj.availability || 'IN_STOCK'),
          quantity:
            typeof obj.quantity === 'number' && Number.isFinite(obj.quantity) && obj.quantity > 0
              ? Math.floor(obj.quantity)
              : 1,
        } satisfies CartItem
      })
      .filter((item): item is CartItem => Boolean(item))
  } catch {
    return []
  }
}

export function clearStoredCart() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY)
  } catch {
    // Ignore storage failures so cart state can still be cleared in memory.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(safeReadCart())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [hydrated, items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const qty = Math.max(1, Math.floor(quantity))
    setItems((prev) => {
      const index = prev.findIndex((existing) => existing.id === item.id)
      if (index === -1) {
        return [...prev, { ...item, quantity: qty }]
      }
      const next = [...prev]
      next[index] = { ...next[index], quantity: next[index].quantity + qty }
      return next
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const qty = Math.floor(quantity)
    setItems((prev) => {
      if (qty <= 0) return prev.filter((item) => item.id !== id)
      return prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    clearStoredCart()
    setItems([])
  }, [])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number.isFinite(item.quantity) ? item.quantity : 0), 0),
    [items]
  )
  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0
        return sum + price * item.quantity
      }, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, hydrated, itemCount, items, removeItem, subtotal, updateQuantity]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
