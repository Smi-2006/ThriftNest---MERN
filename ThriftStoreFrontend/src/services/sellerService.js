
import api from './api'

export const sellerEndpoints = {
  dashboard: '/api/seller/dashboard',
  products: '/api/seller/products',
  orders: '/api/seller/orders',
  createProduct: '/api/products',
}

// ========================================
// HELPER FUNCTIONS
// ========================================

const sanitizeNumber = (value) => Number(value || 0)

// Convert backend product fields into the format
// expected by the existing frontend components.
const normalizeProduct = (product = {}) => ({
  ...product,
  id: product._id || product.id,
  name: product.productName || product.name,
  description: product.description || '',
  category: product.category || '',
  brand: product.brand || 'Unbranded',
  size: product.size || '',
  price: sanitizeNumber(product.productPrice ?? product.price),
  stock: sanitizeNumber(product.quantity ?? product.stock),
  soldQuantity: sanitizeNumber(product.soldQuantity),
  image: product.image || '',
  condition: product.condition || 'Good',
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
})

// ========================================
// GET SELLER PRODUCTS
// ========================================

export const getSellerProducts = async (seller) => {
  const response = await api.get(sellerEndpoints.products)

  return {
    ...response,
    data: Array.isArray(response.data)
      ? response.data.map(normalizeProduct)
      : [],
  }
}

// ========================================
// ADD PRODUCT
// ========================================

export const createSellerProduct = async (seller, product) => {
  const response = await api.post(sellerEndpoints.createProduct, {
    productName: product.name?.trim(),
    description: product.description?.trim(),
    category: product.category?.trim(),
    brand: product.brand?.trim() || 'Unbranded',
    size: product.size?.trim(),
    condition: product.condition,
    productPrice: Number(product.price),
    quantity: Number(product.stock),
    image: product.image?.trim(),
  })

  return {
    ...response,
    data: normalizeProduct(response.data.product),
  }
}

// ========================================
// UPDATE PRODUCT
// ========================================

export const updateSellerProduct = async (seller, product) => {
  const productId = product._id || product.id

  const response = await api.put(
    `${sellerEndpoints.createProduct}/${productId}`,
    {
      productName: product.name?.trim(),
      description: product.description?.trim(),
      category: product.category?.trim(),
      brand: product.brand?.trim() || 'Unbranded',
      size: product.size?.trim(),
      condition: product.condition,
      productPrice: Number(product.price),
      quantity: Number(product.stock),
      image: product.image?.trim(),
    }
  )

  return {
    ...response,
    data: normalizeProduct(response.data.product),
  }
}

// ========================================
// DELETE PRODUCT
// ========================================

export const removeSellerProduct = async (seller, productId) => {
  return api.delete(`${sellerEndpoints.createProduct}/${productId}`)
}

// Keep the old function name available for existing imports.
// Product creation must now use createSellerProduct.
export const upsertSellerProduct = async (seller, product) => {
  return createSellerProduct(seller, product)
}

export const deleteSellerProduct = async (seller, productId) => {
  return removeSellerProduct(seller, productId)
}

// ========================================
// SELLER DASHBOARD
// ========================================

export const getSellerDashboard = async (seller) => {
  const response = await api.get(sellerEndpoints.dashboard)

  return {
    ...response,
    data: response.data,
  }
}

export const getSellerDashboardData = getSellerDashboard
export const getSellerDashboardFromApi = getSellerDashboard

// ========================================
// SELLER ORDERS
// ========================================

export const getSellerOrders = async (seller) => {
  const response = await api.get(sellerEndpoints.orders)

  return {
    ...response,
    data: response.data,
  }
}

export const getSellerOrdersByRole = getSellerOrders

// ========================================
// OTHER EXISTING EXPORTS
// ========================================

export const getSellerProductsByRole = getSellerProducts
export const getSellerProductsFromApi = getSellerProducts

export const getSellerEndpoints = () => sellerEndpoints

export const getSellerMockStatus = () => 'CONNECTED TO BACKEND'
export const getSellerDashboardSummary = getSellerDashboard