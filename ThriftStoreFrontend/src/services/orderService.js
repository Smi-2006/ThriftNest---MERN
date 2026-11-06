
import api from './api'

export const orderEndpoints = {
  create: '/api/orders/checkout',
  myOrders: '/api/orders/my-orders',
}

// CREATE REAL ORDER
export const createOrder = async (payload) => {
  return api.post(orderEndpoints.create, payload)
}

// GET CUSTOMER PURCHASE HISTORY
export const getMyOrders = async () => {
  return api.get(orderEndpoints.myOrders)
}
