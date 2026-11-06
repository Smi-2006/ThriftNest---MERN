import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart, getAvailableStock } = useCart()
  const [cartMessage, setCartMessage] = useState('')
  const availableStock = getAvailableStock(product)

  const handleAddToCart = () => {
    setCartMessage(addToCart(product, 1) || '')
  }

  return (
    <article className="product-card">
      <div className="product-card__image-wrapper">
        <img src={product.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80'} alt={product.name} style={{ objectFit: 'cover' }} />
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.category || 'General'}</span>
          <span>{availableStock > 0 ? `${availableStock} in stock` : 'Sold out'}</span>
        </div>

        <h3>{product.name}</h3>

        <div className="product-card__price">
          <span>₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
          <span>{availableStock > 0 ? 'Ready to ship' : 'Unavailable'}</span>
        </div>

        <div className="product-card__actions">
          <Link to={`/shop/${product._id || product.id}`} className="button-secondary" style={{ textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            View details
          </Link>
          <button type="button" className="action-button" onClick={handleAddToCart} disabled={availableStock <= 0} style={{ padding: '0.75rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ShoppingBag size={16} />
            Add
          </button>
        </div>
        {cartMessage && <p className="inline-message error">{cartMessage}</p>}
      </div>
    </article>
  )
}
