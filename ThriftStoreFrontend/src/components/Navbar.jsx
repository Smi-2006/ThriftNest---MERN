import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Store, LogOut, UserRound, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const primaryLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" aria-label="ThriftNest home">
          <span className="brand-mark">
            <Store size={18} />
          </span>
          <span>ThriftNest</span>
        </Link>

        {user?.role !== 'seller' && (
          <nav className="main-nav" aria-label="Main navigation">
            {primaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="nav-actions">
          {user?.role !== 'seller' && (
            <Link to="/cart" className="nav-button cart-pill" aria-label="Shopping cart">
              <ShoppingCart size={18} />
              <span>Cart</span>
              <span className="cart-count">{itemCount}</span>
            </Link>
          )}

          {isAuthenticated ? (
            <>
              {user?.role === 'customer' ? (
                <Link to="/rewards" className="nav-button" aria-label="Rewards">
                  <span>Rewards</span>
                </Link>
              ) : null}
              <Link to={user?.role === 'seller' ? '/seller/dashboard' : '/customer/dashboard'} className="nav-button" aria-label="Dashboard">
                <UserRound size={18} style={{ verticalAlign: 'middle' }} />
                <span style={{ marginLeft: 6 }}>{user?.role === 'seller' ? 'Seller' : 'Account'}</span>
              </Link>
              <button type="button" className="nav-button" onClick={handleLogout}>
                <LogOut size={18} style={{ verticalAlign: 'middle' }} />
                <span style={{ marginLeft: 6 }}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button">
                <LogIn size={18} style={{ verticalAlign: 'middle' }} />
                <span style={{ marginLeft: 6 }}>Login</span>
              </Link>
              <Link to="/register" className="nav-button">
                <span>Register</span>
              </Link>
            </>
          )}

          <Link
            to={user?.role === 'seller' ? '/seller/dashboard' : '/login'}
            className="button-primary"
            style={{ padding: '0.75rem 1rem', display: 'inline-flex', alignItems: 'center' }}
          >
            Seller Portal
          </Link>
        </div>
      </div>
    </header>
  )
}
