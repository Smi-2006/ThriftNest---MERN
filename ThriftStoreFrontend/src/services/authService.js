
import api from './api'

export const authEndpoints = {
  register: '/api/users',
  login: '/api/login',
}

export const registerUser = async (payload) => {
  return api.post(authEndpoints.register, {
    username: payload.username,
    emailId: payload.email,
    age: Number(payload.age),
    password: payload.password,
    role: payload.role || 'customer',
  })
}

export const loginUser = async (payload) => {
  return api.post(authEndpoints.login, {
    emailId: payload.email,
    password: payload.password,
  })
}
