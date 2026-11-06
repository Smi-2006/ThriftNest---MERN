import { useEffect, useState } from 'react'
import { Gift, TrendingUp, Wallet, Clock3, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/orderService'
import { getRewardSummary } from '../services/rewardService'

const summaryCards = [
  { key: 'balance', label: 'Current balance', icon: Wallet },
  { key: 'totalEarned', label: 'Total earned', icon: TrendingUp },
  { key: 'totalRedeemed', label: 'Total redeemed', icon: Gift },
]

export default function Rewards() {
  const { user } = useAuth()
  const [points, setPoints] = useState(null)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [rewardsLoading, setRewardsLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [rewardsError, setRewardsError] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      const [rewardsResult, ordersResult] = await Promise.allSettled([
        getRewardSummary(),
        getMyOrders(),
      ])

      if (!active) return

      if (rewardsResult.status === 'fulfilled') {
        const rewardData = rewardsResult.value.data
        if (Number.isFinite(rewardData?.points)) {
          setPoints(rewardData.points)
        } else {
          setRewardsError('The rewards service returned an unexpected response.')
        }
      } else {
        setRewardsError(
          rewardsResult.reason?.response?.data?.message ||
          rewardsResult.reason?.message ||
          'Unable to load your reward balance. Please try again.',
        )
      }

      if (ordersResult.status === 'fulfilled') {
        if (Array.isArray(ordersResult.value.data)) {
          setPurchaseHistory(ordersResult.value.data)
        } else {
          setOrdersError('The purchase history service returned an unexpected response.')
        }
      } else {
        setOrdersError(
          ordersResult.reason?.response?.data?.message ||
          ordersResult.reason?.message ||
          'Unable to load your purchase history. Please try again.',
        )
      }

      setRewardsLoading(false)
      setOrdersLoading(false)
    }

    loadData()

    return () => {
      active = false
    }
  }, [refreshCount])

  const handleRefresh = () => {
    setRewardsLoading(true)
    setOrdersLoading(true)
    setRewardsError('')
    setOrdersError('')
    setRefreshCount((count) => count + 1)
  }
  const summaryValues = {
    balance: points,
    totalEarned: null,
    totalRedeemed: null,
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div className="section-heading">
        <h2>Rewards</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/shop" className="button-secondary">Continue shopping</Link>
          <button type="button" className="button-secondary" onClick={handleRefresh} disabled={rewardsLoading || ordersLoading}>
            {rewardsLoading || ordersLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#5d554f' }}>Customer rewards</p>
            <h3 style={{ margin: '8px 0 0' }}>{user?.username || user?.name || 'Customer'}</h3>
          </div>
        </div>
        <p style={{ margin: '14px 0 0', color: '#5d554f' }}>
          Your available reward balance is provided by your account. Total earned and redeemed points are not provided by the rewards service.
        </p>
      </div>

      <div className="rewards-grid">
        {summaryCards.map(({ key, label, icon: Icon }) => (
          <div key={key} className="dashboard-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <p style={{ margin: 0, color: '#5d554f' }}>{label}</p>
              <Icon size={18} color="#8d7ca2" />
            </div>
            <h3 style={{ margin: '14px 0 0' }}>
              {key === 'balance' && rewardsLoading && points === null
                ? 'Loading...'
                : rewardsError && key === 'balance'
                  ? 'Unavailable'
                  : summaryValues[key] === null
                    ? 'Not provided'
                    : `${summaryValues[key]} pts`}
            </h3>
          </div>
        ))}
      </div>
      {rewardsError && <div className="inline-message error">{rewardsError}</div>}

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>Reward transaction history</h3>
          <Clock3 size={18} color="#8d7ca2" />
        </div>

        <div className="inline-message">
          Reward transaction history is not available from the backend.
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>Purchase history</h3>
          <ArrowRight size={18} color="#8d7ca2" />
        </div>

        {ordersError ? (
          <div className="inline-message error">{ordersError}</div>
        ) : ordersLoading ? (
          <div className="inline-message">Loading purchase history...</div>
        ) : purchaseHistory.length ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {purchaseHistory.map((order) => (
              <div key={order.orderId} style={{ display: 'grid', gap: '8px', border: '1px solid rgba(32,29,26,0.08)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <strong style={{ color: '#201d1a' }}>Order #{order.orderId}</strong>
                </div>
                <div style={{ color: '#5d554f', display: 'grid', gap: '4px' }}>
                  <span>{new Date(order.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span>{order.productName} × {order.quantity}</span>
                  <span>₹{Number(order.totalPrice).toLocaleString('en-IN')} total</span>
                  {order.pointsEarned != null && <span>{order.pointsEarned} points earned</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="inline-message">No purchase history yet.</div>
        )}
      </div>
    </div>
  )
}
