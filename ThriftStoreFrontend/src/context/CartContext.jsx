import { createContext, useContext, useMemo, useRef, useState } from 'react'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'shop-cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      return storedCart ? JSON.parse(storedCart) : []
    } catch (error) {
      console.warn('Unable to load cart state:', error)
      return []
    }
  })
  const itemsRef = useRef(items)

  const saveCart = (updater) => {
    const nextItems = typeof updater === 'function' ? updater(itemsRef.current) : updater
    itemsRef.current = nextItems
    setItems(nextItems)
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems))
  }

  const addToCart = (product, quantity = 1) => {
    const productId = product?._id || product?.id
    const availableStock = Number(product?.stock ?? product?.quantity)

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return 'Please select a valid product quantity.'
    }

    if (!Number.isInteger(availableStock) || availableStock <= 0) {
      return 'This item is out of stock.'
    }

    const currentItem = itemsRef.current.find(
      (item) => (item?._id || item?.id) === productId,
    )
    const currentQuantity = Number(currentItem?.quantity || 0)

    if (currentQuantity + quantity > availableStock) {
      return `Only ${availableStock} ${availableStock === 1 ? 'item' : 'items'} available in stock.`
    }

    saveCart((previousItems) => {
      if (currentItem) {
        return previousItems.map((item) =>
          (item?._id || item?.id) === productId
            ? { ...item, ...product, stock: availableStock, quantity: currentQuantity + quantity }
            : item,
        )
      }

      return [...previousItems, { ...product, stock: availableStock, quantity }]
    })

    return null
  }

  const updateQuantity = (productId, quantityChange) => {
    const currentItem = itemsRef.current.find(
      (item) => (item?._id || item?.id) === productId,
    )

    if (!currentItem || !Number.isInteger(quantityChange)) return

    const currentQuantity = Number(currentItem.quantity)
    const availableStock = Number(currentItem.stock)
    const nextQuantity = currentQuantity + quantityChange

    if (nextQuantity <= 0) {
      removeFromCart(productId)
      return null
    }

    if (quantityChange > 0) {
      if (!Number.isInteger(availableStock) || availableStock < 0) {
        return 'Stock availability is unknown. Please refresh the product before changing quantity.'
      }

      if (availableStock === 0) {
        return 'This item is out of stock.'
      }

      if (nextQuantity > availableStock) {
        return `Only ${availableStock} ${availableStock === 1 ? 'item' : 'items'} available in stock.`
      }
    }

    saveCart((previousItems) =>
      previousItems.map((item) =>
        (item?._id || item?.id) === productId
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    )

    return null
  }

  const removeFromCart = (productId) => {
    saveCart((previousItems) => previousItems.filter((item) => (item?._id || item?.id) !== productId))
  }

  const getAvailableStock = (product) => {
    const productId = product?._id || product?.id
    const stock = Number(product?.stock ?? product?.quantity)

    if (!Number.isFinite(stock)) return 0

    const cartItem = itemsRef.current.find(
      (item) => (item?._id || item?.id) === productId,
    )

    return Math.max(0, stock - Number(cartItem?.quantity || 0))
  }

  const clearCart = () => saveCart([])

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      getAvailableStock,
      clearCart,
    }),
    [items, itemCount, subtotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
