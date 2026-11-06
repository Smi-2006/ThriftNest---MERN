
import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import SellerNav from '../components/SellerNav'
import { createSellerProduct } from '../services/sellerService'

const initialForm = {
  name: '',
  description: '',
  category: '',
  brand: '',
  size: '',
  price: '',
  stock: '',
  image: '',
  condition: 'Good',
}

const categories = [
  'Shirts',
  'Trousers',
  'Dresses',
  'Shoes',
  'Accessories',
  'Other',
]

export default function SellerAddProduct() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = useMemo(() => {
    return (
      form.name.trim() !== '' &&
      form.description.trim() !== '' &&
      form.category !== '' &&
      form.size.trim() !== '' &&
      Number.isFinite(Number(form.price)) &&
      Number(form.price) > 0 &&
      Number.isInteger(Number(form.stock)) &&
      Number(form.stock) >= 1 &&
      /^https?:\/\/.+/i.test(form.image.trim())
    )
  }, [form])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    console.log('ADD PRODUCT BUTTON CLICKED')

    setMessage('')
    setError('')

    if (!isValid) {
      setError('Please complete all required fields with valid values.')
      return
    }

    try {
      setLoading(true)

      const response = await createSellerProduct(user, {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim() || 'Unbranded',
        size: form.size.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image.trim(),
      })

      console.log('PRODUCT CREATION RESPONSE:', response)

      setMessage('Product added successfully!')
      setForm(initialForm)
    } catch (err) {
      console.error('PRODUCT CREATION ERROR:', err)

      setError(
        err.response?.data?.message ||
        'Unable to add product. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SellerNav />

      <main className="seller-page">
        <div className="seller-container">
          <div className="seller-header">
            <h1>Add New Product</h1>
            <p>List a pre-loved item in your store.</p>
          </div>

          <div className="seller-card">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Vintage Denim Jacket"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="brand">Brand</label>
                  <input
                    id="brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. Zara"
                  />
                </div>

                <div className="field">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="size">Size *</label>
                  <input
                    id="size"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="e.g. M, UK 8, Free Size"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="stock">Stock Quantity *</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="1"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="condition">Condition *</label>
                  <select
                    id="condition"
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    required
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="image">Product Image URL *</label>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="field full-width">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your product..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {message && (
                <div className="inline-message success">
                  <CheckCircle2 size={18} />
                  {message}
                </div>
              )}

              {error && (
                <div className="inline-message error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="button-primary"
                disabled={loading}
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
