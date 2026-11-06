import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart, getAvailableStock, clearCart } = useCart()
  const [quantityMessages, setQuantityMessages] = useState({})

  const changeQuantity = (productId, change) => {
    const message = updateQuantity(productId, change) || ''

    setQuantityMessages((messages) => ({
      ...messages,
      [productId]: message,
    }))
  }

  if (!items.length) {
    return (
      <div className="auth-shell" style={{ textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#5d554f' }}>Add a few treasures to get started.</p>
        <Link to="/shop" className="button-primary">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <div className="section-heading">
        <h2>Shopping cart</h2>
        <button type="button" className="button-secondary" onClick={clearCart}>Clear cart</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.5fr 0.8fr' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {items.map((item) => (
            <div key={item._id || item.id} className="card" style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <img src={item.image} alt={item.name} style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '16px' }} />
              <div style={{ flex: 1, minWidth: '180px' }}>
                <h3 style={{ margin: 0 }}>{item.name}</h3>
                <p style={{ margin: '8px 0', color: '#5d554f' }}>₹{Number(item.price).toLocaleString('en-IN')}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" className="button-secondary" onClick={() => changeQuantity(item._id || item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" className="button-secondary" onClick={() => changeQuantity(item._id || item.id, 1)} disabled={item.quantity >= Number(item.stock)}>+</button>
              </div>

              <div style={{ width: '100%', color: '#5d554f' }}>
                <span>Available stock: {getAvailableStock(item)}</span>
                {quantityMessages[item._id || item.id] && (
                  <p className="inline-message error">{quantityMessages[item._id || item.id]}</p>
                )}
              </div>
              <button type="button" className="button-secondary" onClick={() => removeFromCart(item._id || item.id)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Order summary</h3>
          <div style={{ display: 'grid', gap: '12px', color: '#5d554f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <strong style={{ color: '#201d1a' }}>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <strong style={{ color: '#201d1a' }}>₹0</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#201d1a' }}>
              <span>Total</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Link to="/checkout" className="button-primary" style={{ width: '100%', marginTop: '20px', display: 'inline-flex', justifyContent: 'center' }}>Proceed to checkout</Link>
        </div>
      </div>
    </div>
  )
}
