
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../services/authService'

const initialForm = {
  username: '',
  email: '',
  age: '',
  password: '',
  confirmPassword: '',
  role: 'customer',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const minimumAge = 18

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setStatus({ type: '', message: '' })
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.username.trim()) {
      nextErrors.username = 'Username is required.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.age.toString().trim()) {
      nextErrors.age = 'Age is required.'
    } else {
      const parsedAge = Number(formData.age)
      if (Number.isNaN(parsedAge) || !Number.isFinite(parsedAge) || parsedAge < minimumAge) {
        nextErrors.age = `Age must be at least ${minimumAge}.`
      }
    }

    if (!['customer', 'seller'].includes(formData.role)) {
      nextErrors.role = 'Account type must be Customer or Seller.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must contain at least 8 characters.'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        age: Number(formData.age),
        password: formData.password,
        role: formData.role,
      })

      setStatus({
        type: 'success',
        message: `${response?.data?.message || 'Registration successful!'} Redirecting to login...`,
      })

      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <h2 style={{ marginTop: 0 }}>Create account</h2>
      <p style={{ color: '#5d554f', marginBottom: '24px' }}>
        Create your account to start shopping or selling.
      </p>

      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" value={formData.username} onChange={handleChange} />
          {errors.username ? <span className="inline-message error">{errors.username}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          {errors.email ? <span className="inline-message error">{errors.email}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="age">Age</label>
          <input id="age" name="age" type="number" min="18" value={formData.age} onChange={handleChange} />
          {errors.age ? <span className="inline-message error">{errors.age}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="role">Account type</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
          {errors.role ? <span className="inline-message error">{errors.role}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
          {errors.password ? <span className="inline-message error">{errors.password}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
          {errors.confirmPassword ? <span className="inline-message error">{errors.confirmPassword}</span> : null}
        </div>

        {status.message ? (
          <div className={`inline-message ${status.type === 'error' ? 'error' : 'success'}`}>
            {status.message}
          </div>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
          <Link to="/login" className="text-link">Already registered?</Link>
        </div>
      </form>
    </div>
  )
}
