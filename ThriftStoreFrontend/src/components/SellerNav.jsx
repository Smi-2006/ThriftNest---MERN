
import {
  LayoutDashboard,
  ListPlus,
  PackageOpen,
  ShoppingBag,
  LogOut,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/add-product', label: 'Add Product', icon: ListPlus },
  { to: '/seller/products', label: 'My Products', icon: PackageOpen },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
]

export default function SellerNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside
      className="card"
      style={{
        padding: '1rem',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        position: 'static',
        alignSelf: 'start',
      }}
    >
      <div style={{ display: 'grid', gap: '10px' }}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to

          return (
            <Link
              key={to}
              to={to}
              className="button-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
                background: active
                  ? 'rgba(70, 97, 74, 0.12)'
                  : 'rgba(113, 138, 109, 0.08)',
                color: '#201d1a',
                textAlign: 'left',
                padding: '0.8rem 1rem',
                borderRadius: '14px',
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          )
        })}

        <button
          type="button"
          className="button-secondary"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px',
            marginTop: '10px',
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
