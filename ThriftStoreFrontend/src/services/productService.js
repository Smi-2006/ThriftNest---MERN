
import api from './api'

export const productEndpoints = {
  list: '/api/products',
  detail: (id) => `/api/products/${id}`,
  create: '/api/products',
  update: (id) => `/api/products/${id}`,
  remove: (id) => `/api/products/${id}`,
}

// Convert MongoDB product fields into frontend fields
const normalizeProduct = (product = {}) => ({
  ...product,
  id: product._id || product.id,
  name: product.productName || product.name || '',
  price: Number(product.productPrice ?? product.price ?? 0),
  stock: Number(product.quantity ?? product.stock ?? 0),
  category: product.category || '',
  description: product.description || '',
  brand: product.brand || 'Unbranded',
  size: product.size || '',
  condition: product.condition || 'Good',
  image: product.image || '',
  status: product.status || 'Available',
})

// GET ALL PRODUCTS
export const getProducts = async () => {
  try {
    const response = await api.get(productEndpoints.list)

    const products = Array.isArray(response.data)
      ? response.data.map(normalizeProduct)
      : []

    return {
      data: products,
      source: 'api',
    }
  } catch (error) {
    console.error('Unable to fetch products:', error)

    return {
      data: [],
      source: 'api',
      error,
    }
  }
}

// GET SINGLE PRODUCT
export const getProductById = async (id) => {
  try {
    const response = await api.get(productEndpoints.detail(id))

    return {
      data: normalizeProduct(response.data.product || response.data),
      source: 'api',
    }
  } catch (error) {
    console.error('Unable to fetch product:', error)

    return {
      data: null,
      source: 'empty',
      error,
    }
  }
}
