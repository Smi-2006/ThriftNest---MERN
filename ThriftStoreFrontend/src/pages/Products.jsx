import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/productService'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const result = await getProducts()
      setProducts(result.data || [])
      setSource(result.source || '')
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return [...products]
      .filter((product) => {
        const matchesSearch = !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch)
        const matchesCategory = category === 'all' || product.category === category
        return matchesSearch && matchesCategory
      })
      .sort((first, second) => {
        if (sortBy === 'low') return Number(first.price) - Number(second.price)
        if (sortBy === 'high') return Number(second.price) - Number(first.price)
        return 0
      })
  }, [products, search, category, sortBy])

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div className="section-heading">
        <h2>Shop all products</h2>
      </div>

      {source === 'mock' ? (
        <div className="card" style={{ padding: '1rem 1.2rem', color: '#7d6992', fontWeight: 600 }}>
          Mock data is active because no backend API is connected yet.
        </div>
      ) : null}

      <div className="card" style={{ padding: '1.2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <input
            type="search"
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ border: '1px solid rgba(32, 29, 26, 0.12)', borderRadius: '12px', padding: '0.85rem 1rem' }}
          />

          <select value={category} onChange={(event) => setCategory(event.target.value)} style={{ border: '1px solid rgba(32, 29, 26, 0.12)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All categories' : option}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ border: '1px solid rgba(32, 29, 26, 0.12)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
            <option value="featured">Featured</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', fontWeight: 700, color: '#7d6992' }}>
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#5d554f' }}>
          No products match your filter. Try another search.
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
