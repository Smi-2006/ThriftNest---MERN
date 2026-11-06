
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await loginUser(formData)
      const payload = response?.data || {}

      const user = payload.user
      const token = payload.token

      if (!user || !token) {
        throw new Error('Invalid login response from server.')
      }

      login(user, token)

      const redirectTarget =
        location.state?.from ||
        (user.role === 'seller' ? '/seller/dashboard' : '/shop')

      navigate(redirectTarget)
    } catch (error) {
      const errMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to log in. Please check your credentials.'

      setStatus({ type: 'error', message: errMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <h2 style={{ marginTop: 0 }}>Welcome back</h2>
      <p style={{ color: '#5d554f', marginBottom: '24px' }}>Sign in to continue shopping or manage your storefront.</p>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>

        {status.message ? (
          <div className={`inline-message ${status.type === 'error' ? 'error' : 'success'}`}>
            {status.message}
          </div>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
          <Link to="/register" className="text-link">Create account</Link>
        </div>
      </form>
    </div>
  )
}
