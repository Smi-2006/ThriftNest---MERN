import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'shop-auth-user'
const TOKEN_STORAGE_KEY = 'shop-auth-token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
      return storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
      console.warn('Unable to load saved auth user:', error)
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '')
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    setAuthReady(true)
  }, [])

  const login = (nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)

    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    }

    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    }

    localStorage.removeItem('shop-cart')
  }

  const updateUser = (nextUser) => {
    setUser(nextUser)

    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    }
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem('shop-cart')
  }

  const value = useMemo(
    () => ({
      user,
      token,
      authReady,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      updateUser,
    }),
    [user, token, authReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
