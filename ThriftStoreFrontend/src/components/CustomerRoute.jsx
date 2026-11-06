import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

export default function CustomerRoute({ children }) {
  const { user, isAuthenticated, authReady } = useAuth()

  if (!authReady) {
    return <Loading />
  }

  if (!isAuthenticated || user?.role !== 'customer') {
    return <Navigate to="/login" replace />
  }

  return children
}
