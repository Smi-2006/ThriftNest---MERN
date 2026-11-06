import { useState } from 'react'

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.info('Seller add-product form submitted', formData)
  }

  return (
    <div className="auth-shell">
      <h2 style={{ marginTop: 0 }}>Add a new product</h2>
      <p style={{ color: '#5d554f', marginBottom: '24px' }}>Create a listing and keep inventory up to date.</p>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label htmlFor="name">Product name</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="field">
          <label htmlFor="price">Price</label>
          <input id="price" name="price" type="number" min="1" value={formData.price} onChange={handleChange} required />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <input id="category" name="category" value={formData.category} onChange={handleChange} required />
        </div>

        <div className="field">
          <label htmlFor="stock">Available quantity</label>
          <input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} required />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} required />
        </div>

        <button type="submit" className="button-primary">Create product</button>
      </form>
    </div>
  )
}
