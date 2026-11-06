
import { useEffect, useState } from 'react'
import { ShoppingBag, IndianRupee, Package } from 'lucide-react'
import SellerNav from '../components/SellerNav'
import { useAuth } from '../context/AuthContext'
import { getSellerOrders } from '../services/sellerService'

export default function SellerOrders() {
  const { user } = useAuth()

  const [orders, setOrders] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getSellerOrders(user)

        setOrders(
          Array.isArray(response.data.orders)
            ? response.data.orders
            : []
        )

        setTotalRevenue(Number(response.data.totalRevenue || 0))
      } catch (err) {
        console.error('Unable to load seller orders:', err)
        setError(
          err.response?.data?.message ||
          'Unable to load orders. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadOrders()
    }
  }, [user])

  return (
    <div className="auth-shell">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px minmax(0, 1fr)',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        <SellerNav />

        <section style={{ minWidth: 0 }}>
          <h2 style={{ marginTop: 0 }}>Seller Orders</h2>

          <p style={{ color: '#5d554f' }}>
            View orders received for your products.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div className="card" style={{ padding: '1.2rem' }}>
              <ShoppingBag size={22} />
              <p style={{ color: '#5d554f' }}>Total Orders</p>
              <h2>{orders.length}</h2>
            </div>

            <div className="card" style={{ padding: '1.2rem' }}>
              <IndianRupee size={22} />
              <p style={{ color: '#5d554f' }}>Total Revenue</p>
              <h2>₹{totalRevenue.toLocaleString('en-IN')}</h2>
            </div>
          </div>

          {loading ? (
            <p>Loading orders...</p>
          ) : error ? (
            <div className="card" style={{ padding: '1.2rem' }}>
              <p style={{ color: '#b42318' }}>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="card" style={{
              padding: '2rem',
              textAlign: 'center',
            }}>
              <Package size={36} />
              <h3>No orders yet</h3>
              <p style={{ color: '#5d554f' }}>
                Customer orders for your products will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {orders.map((order) => (
                <div
                  className="card"
                  key={order._id || order.orderId}
                  style={{ padding: '1.2rem' }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <div>
                      <h3 style={{ marginTop: 0 }}>
                        {order.productName}
                      </h3>

                      <p style={{ color: '#5d554f' }}>
                        Order ID: {order.orderId || order._id}
                      </p>

                      <p>
                        Customer: {order.buyerId?.username || 'Customer'}
                      </p>

                      <p>
                        Email: {order.buyerId?.emailId || 'Not available'}
                      </p>

                      <p>Quantity: {order.quantity}</p>

                      <p style={{ color: '#5d554f' }}>
                        Purchased on:{' '}
                        {order.purchaseDate
                          ? new Date(order.purchaseDate).toLocaleDateString('en-IN')
                          : 'Not available'}
                      </p>
                    </div>

                    <div>
                      <h3 style={{ color: '#46614a' }}>
                        ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
