
import { useEffect, useState } from 'react'
import {
  BarChart3,
  Package,
  PackageCheck,
  Sparkles,
  PackageX,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import SellerNav from '../components/SellerNav'
import { getSellerDashboardSummary } from '../services/sellerService'

const statCards = [
  { key: 'totalProducts', label: 'Total products', icon: Package },
  { key: 'totalProductsSold', label: 'Products sold', icon: PackageCheck },
  { key: 'availableProducts', label: 'Available', icon: Sparkles },
  { key: 'outOfStockProducts', label: 'Out of stock', icon: PackageX },
]

export default function SellerDashboard() {
  const { user } = useAuth()

  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalProductsSold: 0,
    availableProducts: 0,
    outOfStockProducts: 0,
    totalRevenue: 0,
    recentActivity: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getSellerDashboardSummary(user)

        // Backend returns { message, dashboard: {...} }
        const data = response?.data?.dashboard || {}

        if (active) {
          setSummary({
            totalProducts: data.totalProducts ?? 0,
            totalProductsSold: data.totalProductsSold ?? 0,
            availableProducts: data.availableProducts ?? 0,
            outOfStockProducts: data.outOfStockProducts ?? 0,
            totalRevenue: data.totalRevenue ?? 0,
            recentActivity: Array.isArray(data.recentOrders)
              ? data.recentOrders
              : [],
          })
        }
      } catch (err) {
        console.error('Seller dashboard error:', err)

        if (active) {
          setError(
            err.response?.data?.message ||
              'Could not load seller dashboard.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (user) {
      loadDashboard()
    } else {
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [user])

  const recentActivity = Array.isArray(summary.recentActivity)
    ? summary.recentActivity
    : []

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      <SellerNav />

      <div style={{ display: 'grid', gap: '20px' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ margin: 0, color: '#5d554f' }}>
            Welcome back
          </p>

          <h2 style={{ margin: '8px 0 0', fontSize: '2rem' }}>
            {user?.username || user?.name || 'Seller'}
          </h2>

          <p style={{ margin: '10px 0 0', color: '#5d554f' }}>
            Your seller dashboard
          </p>
        </div>

        {loading && (
          <div className="inline-message">
            Loading dashboard...
          </div>
        )}

        {error && (
          <div className="inline-message error">
            {error}
          </div>
        )}

        <div className="grid grid-4">
          {statCards.map(({ key, label, icon: Icon }) => (
            <div key={key} className="dashboard-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ margin: 0, color: '#5d554f' }}>
                  {label}
                </p>

                <Icon size={18} color="#8d7ca2" />
              </div>

              <h3 style={{ margin: '14px 0 0' }}>
                {summary[key] ?? 0}
              </h3>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <h3 style={{ margin: 0 }}>
              Recent sales activity
            </h3>

            <BarChart3 size={18} color="#8d7ca2" />
          </div>

          {recentActivity.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {recentActivity.map((order) => (
                <div
                  key={order._id || order.orderId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    color: '#5d554f',
                    borderBottom: '1px solid rgba(32,29,26,0.08)',
                    paddingBottom: '8px',
                  }}
                >
                  <div>
                    <strong style={{ color: '#201d1a' }}>
                      {order.productName}
                    </strong>

                    <div>
                      Order: {order.orderId}
                    </div>
                  </div>

                  <span>
                    ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-message">
              {loading
                ? 'Loading activity...'
                : 'No recent sales yet.'}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Total revenue</h3>

          <h2 style={{ margin: 0, color: '#46614a' }}>
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </h2>
        </div>
      </div>
    </div>
  )
}
