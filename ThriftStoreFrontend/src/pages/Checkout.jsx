
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/orderService'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9]{10}$/
const pincodePattern = /^[0-9]{6}$/

export default function Checkout() {
  const { user, isAuthenticated } = useAuth()
  const { items, subtotal, clearCart } = useCart()

  const [formData, setFormData] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  const total = useMemo(() => subtotal, [subtotal])

  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="auth-shell" style={{ textAlign: 'center' }}>
        <h2>Customer checkout required</h2>
        <p style={{ color: '#5d554f' }}>
          Please log in as a customer to place an order.
        </p>
        <Link to="/login" className="button-primary">
          Go to login
        </Link>
      </div>
    )
  }

  if (!items.length && !orderResult?.success) {
    return (
      <div className="auth-shell" style={{ textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#5d554f' }}>
          Add items before checking out.
        </p>
        <Link to="/shop" className="button-primary">
          Continue shopping
        </Link>
      </div>
    )
  }

  const validateForm = () => {
    const nextErrors = {}

    Object.entries(formData).forEach(([field, value]) => {
      if (!String(value).trim()) {
        nextErrors[field] = 'This field is required.'
      }
    })

    if (formData.email && !emailPattern.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (formData.phone && !phonePattern.test(formData.phone)) {
      nextErrors.phone = 'Phone number must be 10 digits.'
    }

    if (formData.pincode && !pincodePattern.test(formData.pincode)) {
      nextErrors.pincode = 'PIN code must be 6 digits.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setOrderResult(null)

    const payload = {
      items: items.map((item) => ({
        productId: item._id || item.id,
        quantity: Number(item.quantity),
      })),
    }

    try {
      const response = await createOrder(payload)
      const responseData = response.data || {}

      setOrderResult({
        success: true,
        orderId: responseData.orders?.[0]?.orderId || 'Order confirmed',
        totalAmount: responseData.totalAmount || total,
        pointsEarned: responseData.pointsEarned || 0,
      })

      clearCart()
    } catch (error) {
      console.error('Checkout failed:', error)

      setOrderResult({
        success: false,
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Unable to place your order. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderResult?.success) {
    return (
      <div className="auth-shell" style={{ textAlign: 'center' }}>
        <h2>Order placed successfully!</h2>

        <p style={{ color: '#5d554f', marginBottom: '12px' }}>
          Your order has been saved successfully.
        </p>

        <div
          className="card"
          style={{ padding: '1rem 1.25rem', marginBottom: '18px' }}
        >
          <p>
            <strong>Order ID:</strong> {orderResult.orderId}
          </p>

          <p>
            <strong>Total:</strong> ₹
            {Number(orderResult.totalAmount).toLocaleString('en-IN')}
          </p>

          <p>
            <strong>Reward points earned:</strong>{' '}
            {orderResult.pointsEarned}
          </p>
        </div>

        <Link to="/customer/purchase-history" className="button-primary">
          View purchase history
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <div className="section-heading">
        <h2>Checkout</h2>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.15fr 0.85fr' }}>
        <form
          onSubmit={handleSubmit}
          className="card"
          style={{ padding: '1.5rem', display: 'grid', gap: '18px' }}
          noValidate
        >
          <div className="field">
            <label htmlFor="name">Customer name</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="inline-message error">{errors.name}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="inline-message error">{errors.email}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <span className="inline-message error">{errors.phone}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="address">Delivery address</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && (
              <span className="inline-message error">{errors.address}</span>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
              gap: '18px',
            }}
          >
            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && (
                <span className="inline-message error">{errors.city}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
              {errors.state && (
                <span className="inline-message error">{errors.state}</span>
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="pincode">PIN code</label>
            <input
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
            {errors.pincode && (
              <span className="inline-message error">{errors.pincode}</span>
            )}
          </div>

          {orderResult?.success === false && (
            <div className="inline-message error">
              {orderResult.message}
            </div>
          )}

          <button
            type="submit"
            className="button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <aside
          className="card"
          style={{ padding: '1.5rem', height: 'fit-content' }}
        >
          <h3 style={{ marginTop: 0 }}>Order summary</h3>

          <div style={{ display: 'grid', gap: '14px' }}>
            {items.map((item) => (
              <div
                key={item._id || item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  color: '#5d554f',
                }}
              >
                <div>
                  <strong style={{ color: '#201d1a' }}>{item.name}</strong>
                  <div>Qty: {item.quantity}</div>
                </div>

                <span>
                  ₹{Number(item.price || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(32,29,26,0.08)',
              marginTop: '1rem',
              paddingTop: '1rem',
              display: 'grid',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#5d554f',
              }}
            >
              <span>Subtotal</span>
              <strong style={{ color: '#201d1a' }}>
                ₹{Number(subtotal || 0).toLocaleString('en-IN')}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#5d554f',
              }}
            >
              <span>Total</span>
              <strong style={{ color: '#201d1a' }}>
                ₹{Number(total || 0).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
