import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductById } from '../services/productService'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { productId } = useParams()
  const { addToCart, getAvailableStock } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const result = await getProductById(productId)
      setProduct(result.data)
      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return <div className="page-shell">Loading product...</div>
  }

  if (!product) {
    return (
      <div className="page-shell">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Product not found.</div>
      </div>
    )
  }

  const availableStock = getAvailableStock(product)

  return (
    <div className="card" style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1.1fr 0.9fr', padding: '1.5rem' }}>
      <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '20px', objectFit: 'cover', minHeight: '420px' }} />

      <div style={{ display: 'grid', gap: '18px', alignContent: 'start' }}>
        <div>
          <p style={{ margin: 0, color: '#8d7ca2', fontWeight: 700 }}>{product.category || 'General'}</p>
          <h2 style={{ margin: '8px 0 0' }}>{product.name}</h2>
        </div>

        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7d6992' }}>
          ₹{Number(product.price || 0).toLocaleString('en-IN')}
        </div>

        <p style={{ margin: 0, color: '#5d554f', lineHeight: 1.7 }}>{product.description}</p>

        <div style={{ display: 'grid', gap: '6px', color: '#5d554f' }}>
          <span>Available quantity: {availableStock}</span>
          <span>Seller: Verified Store</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="button-primary" onClick={() => setCartMessage(addToCart(product, 1) || '')} disabled={availableStock <= 0}>Add to cart</button>
        </div>
        {cartMessage && <p className="inline-message error">{cartMessage}</p>}
      </div>
    </div>
  )
}
