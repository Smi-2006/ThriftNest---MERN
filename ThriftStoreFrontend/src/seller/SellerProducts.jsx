
import { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import SellerNav from '../components/SellerNav'
import { useAuth } from '../context/AuthContext'
import {
  deleteSellerProduct,
  getSellerProducts,
  updateSellerProduct,
} from '../services/sellerService'

const defaultFilter = 'all'

const getStatus = (product) => {
  const stock = Number(product.stock || 0)
  const sold = Number(product.soldQuantity || 0)

  if (stock === 0) return 'Sold out'
  if (sold > 0 && stock > 0) return 'Partially sold'
  return 'Available'
}

export default function SellerProducts() {
  const { user } = useAuth()

  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState(defaultFilter)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      setLoading(true)

      const response = await getSellerProducts(user)

      // sellerService returns the normalized products in response.data
      setProducts(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error loading seller products:', error)
      setStatus({
        type: 'error',
        message:
          error.response?.data?.message ||
          'Unable to load your products.',
      })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadProducts()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [user])

  const filteredProducts = useMemo(() => {
    if (filter === 'available') {
      return products.filter(
        (product) =>
          Number(product.stock) > 0 &&
          Number(product.soldQuantity) === 0
      )
    }

    if (filter === 'soldout') {
      return products.filter(
        (product) => Number(product.stock) === 0
      )
    }

    if (filter === 'partial') {
      return products.filter(
        (product) =>
          Number(product.stock) > 0 &&
          Number(product.soldQuantity) > 0
      )
    }

    return products
  }, [filter, products])

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmed) return

    try {
      await deleteSellerProduct(user, productId)

      setStatus({
        type: 'success',
        message: 'Product deleted successfully.',
      })

      await loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)

      setStatus({
        type: 'error',
        message:
          error.response?.data?.message ||
          'Unable to delete product.',
      })
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct({
      ...product,
      price: String(product.price),
      stock: String(product.stock),
      soldQuantity: String(product.soldQuantity || 0),
    })

    setStatus({ type: '', message: '' })
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    if (!selectedProduct?.name?.trim()) {
      setStatus({
        type: 'error',
        message: 'Product name is required.',
      })
      return
    }

    if (!selectedProduct?.description?.trim()) {
      setStatus({
        type: 'error',
        message: 'Description is required.',
      })
      return
    }

    const price = Number(selectedProduct.price)

    if (!Number.isFinite(price) || price <= 0) {
      setStatus({
        type: 'error',
        message: 'Price must be greater than zero.',
      })
      return
    }

    const stock = Number(selectedProduct.stock)

    if (!Number.isInteger(stock) || stock < 0) {
      setStatus({
        type: 'error',
        message: 'Stock must be a non-negative integer.',
      })
      return
    }

    const updatedProduct = {
      ...selectedProduct,
      price,
      stock,
      soldQuantity: Number(selectedProduct.soldQuantity || 0),
    }

    try {
      await updateSellerProduct(user, updatedProduct)

      setStatus({
        type: 'success',
        message: 'Product updated successfully.',
      })

      setSelectedProduct(null)
      await loadProducts()
    } catch (error) {
      console.error('Error updating product:', error)

      setStatus({
        type: 'error',
        message:
          error.response?.data?.message ||
          'Unable to update product.',
      })
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      <SellerNav />

      <div style={{ display: 'grid', gap: '20px' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ margin: 0 }}>My products</h2>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {['all', 'available', 'soldout', 'partial'].map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    className="button-secondary"
                    onClick={() => setFilter(option)}
                    style={{
                      background:
                        filter === option
                          ? 'rgba(70, 97, 74, 0.12)'
                          : 'rgba(113, 138, 109, 0.08)',
                    }}
                  >
                    {option === 'all'
                      ? 'All products'
                      : option === 'available'
                        ? 'Available'
                        : option === 'soldout'
                          ? 'Sold out'
                          : 'Partially sold'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {status.message && (
          <div
            className={`inline-message ${
              status.type === 'error' ? 'error' : 'success'
            }`}
          >
            {status.message}
          </div>
        )}

        {selectedProduct && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Edit product</h3>

            <form
              onSubmit={handleEditSubmit}
              className="form-grid"
              noValidate
            >
              <div className="field">
                <label htmlFor="edit-name">Product name</label>
                <input
                  id="edit-name"
                  value={selectedProduct.name}
                  onChange={(event) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      name: event.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows="4"
                  value={selectedProduct.description}
                  onChange={(event) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
                  gap: '18px',
                }}
              >
                <div className="field">
                  <label htmlFor="edit-category">Category</label>
                  <input
                    id="edit-category"
                    value={selectedProduct.category}
                    onChange={(event) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        category: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="edit-condition">Condition</label>
                  <select
                    id="edit-condition"
                    value={selectedProduct.condition}
                    onChange={(event) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        condition: event.target.value,
                      })
                    }
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
                  gap: '18px',
                }}
              >
                <div className="field">
                  <label htmlFor="edit-price">Price</label>
                  <input
                    id="edit-price"
                    type="number"
                    min="1"
                    value={selectedProduct.price}
                    onChange={(event) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        price: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="edit-stock">Stock</label>
                  <input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={selectedProduct.stock}
                    onChange={(event) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        stock: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="edit-image">Image URL</label>
                <input
                  id="edit-image"
                  value={selectedProduct.image || ''}
                  onChange={(event) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      image: event.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <button type="submit" className="button-primary">
                  Save changes
                </button>

                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: '1.5rem' }}>
            Loading your products...
          </div>
        ) : (
          <div className="grid grid-3">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                >
                  <div className="product-card__image-wrapper">
                    <img
                      src={
                        product.image ||
                        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
                      }
                      alt={product.name}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <div className="product-card__body">
                    <div className="product-card__meta">
                      <span>{product.category}</span>
                      <span>{getStatus(product)}</span>
                    </div>

                    <h3>{product.name}</h3>

                    <div className="product-card__price">
                      <span>
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      <span>{product.stock} left</span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gap: '6px',
                        color: '#5d554f',
                        marginBottom: '14px',
                      }}
                    >
                      <span>
                        Sold: {product.soldQuantity || 0}
                      </span>
                      <span>Condition: {product.condition}</span>
                    </div>

                    <div className="product-card__actions">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => handleEdit(product)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => handleDelete(product.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="card"
                style={{
                  padding: '1.5rem',
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  color: '#5d554f',
                }}
              >
                No products in this filter yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
