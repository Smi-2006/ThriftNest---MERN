
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerRoute from './components/CustomerRoute'
import SellerRoute from './components/SellerRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CustomerDashboard from './customer/CustomerDashboard'
import ProductDetails from './pages/ProductDetails'
import Rewards from './pages/Rewards'
import SellerDashboard from './seller/SellerDashboard'
import SellerAddProduct from './seller/SellerAddProduct'
import SellerProducts from './seller/SellerProducts'
import SellerOrders from './seller/SellerOrders'

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Products />} />
          <Route path="/shop/:productId" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <CustomerRoute>
                  <Rewards />
                </CustomerRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/purchase-history"
            element={
              <ProtectedRoute>
                <CustomerRoute>
                  <Rewards />
                </CustomerRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerRoute>
                  <SellerDashboard />
                </SellerRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/add-product"
            element={
              <ProtectedRoute>
                <SellerRoute>
                  <SellerAddProduct />
                </SellerRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/products"
            element={
              <ProtectedRoute>
                <SellerRoute>
                  <SellerProducts />
                </SellerRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute>
                <SellerRoute>
                  <SellerOrders />
                </SellerRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute>
                <CustomerRoute>
                  <CustomerDashboard />
                </CustomerRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
