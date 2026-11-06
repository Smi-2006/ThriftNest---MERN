import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/orderService'
import { getRewardSummary } from '../services/rewardService'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [points, setPoints] = useState(null)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [ordersError, setOrdersError] = useState(false)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      const [rewardsResult, ordersResult] = await Promise.allSettled([
        getRewardSummary(),
        getMyOrders(),
      ])

      if (!active) return

      const errors = []
      if (rewardsResult.status === 'fulfilled' && Number.isFinite(rewardsResult.value.data?.points)) {
        setPoints(rewardsResult.value.data.points)
      } else {
        errors.push(
          rewardsResult.status === 'rejected'
            ? rewardsResult.reason?.response?.data?.message || rewardsResult.reason?.message || 'Unable to load reward points.'
            : 'The rewards service returned an unexpected response.',
        )
      }

      if (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value.data)) {
        setPurchaseHistory(ordersResult.value.data)
      } else {
        setOrdersError(true)
        errors.push(
          ordersResult.status === 'rejected'
            ? ordersResult.reason?.response?.data?.message || ordersResult.reason?.message || 'Unable to load purchase history.'
            : 'The purchase history service returned an unexpected response.',
        )
      }

      setError(errors.join(' '))
      setIsLoading(false)
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div className="section-heading">
        <h2>Customer dashboard</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/shop" className="button-secondary">Continue shopping</Link>
          <Link to="/rewards" className="button-primary">Rewards</Link>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="dashboard-card">
          <p style={{ margin: 0, color: '#5d554f' }}>Customer</p>
          <h3 style={{ margin: '8px 0 0' }}>{user?.name || 'Welcome back'}</h3>
        </div>
        <div className="dashboard-card">
          <p style={{ margin: 0, color: '#5d554f' }}>Total orders</p>
          <h3 style={{ margin: '8px 0 0' }}>{isLoading ? 'Loading...' : ordersError ? 'Unavailable' : purchaseHistory.length}</h3>
        </div>
        <div className="dashboard-card">
          <p style={{ margin: 0, color: '#5d554f' }}>Reward points</p>
          <h3 style={{ margin: '8px 0 0' }}>{points === null ? (isLoading ? 'Loading...' : 'Unavailable') : `${points} pts`}</h3>
        </div>
      </div>
      {error && <div className="inline-message error">{error}</div>}

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gift size={18} color="#8d7ca2" />
          Rewards and purchase activity
        </h3>

        <div style={{ display: 'grid', gap: '12px', color: '#5d554f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid rgba(32,29,26,0.08)', paddingBottom: '8px' }}>
            <span>Current balance</span>
            <strong style={{ color: '#201d1a' }}>
              {points === null ? (isLoading ? 'Loading...' : 'Unavailable') : `${points} pts`}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid rgba(32,29,26,0.08)', paddingBottom: '8px' }}>
            <span>Total earned</span>
            <strong style={{ color: '#201d1a' }}>Not provided</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>Purchase history</span>
            <strong style={{ color: '#201d1a' }}>{isLoading ? 'Loading...' : ordersError ? 'Unavailable' : `${purchaseHistory.length} orders`}</strong>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingBag size={18} color="#8d7ca2" />
          Recent orders
        </h3>
        {isLoading ? (
          <p style={{ margin: 0, color: '#5d554f' }}>Loading purchase history...</p>
        ) : purchaseHistory.length ? (
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#5d554f', display: 'grid', gap: '8px' }}>
            {purchaseHistory.slice(0, 4).map((order) => (
              <li key={order.orderId}>
                Order #{order.orderId} • {order.productName} × {order.quantity} • ₹{Number(order.totalPrice).toLocaleString('en-IN')}
              </li>
            ))}
          </ul>
        ) : ordersError ? (
          <p style={{ margin: 0, color: '#5d554f' }}>Unable to display purchase history.</p>
        ) : (
          <p style={{ margin: 0, color: '#5d554f' }}>No purchase history yet.</p>
        )}
      </div>
    </div>
  )
}
