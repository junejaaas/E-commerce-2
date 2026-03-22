import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { Toaster } from 'react-hot-toast'

// Layouts
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'

// Auth Pages
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import VerifyOTP from './pages/auth/VerifyOTP.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'

// Shop Pages
import Home from './pages/shop/Home.jsx'
import ProductList from './pages/shop/ProductList.jsx'
import ProductDetail from './pages/shop/ProductDetail.jsx'
import Cart from './pages/shop/Cart.jsx'
import Wishlist from './pages/wishlist/Wishlist.jsx'
import Checkout from './pages/checkout/Checkout.jsx'
import OrderSuccess from './pages/checkout/OrderSuccess.jsx'

// Admin & Delivery Layouts
import AdminLayout from './components/layout/AdminLayout.jsx'
import DeliveryLayout from './components/layout/DeliveryLayout.jsx'

// Profile Pages
import Profile from './pages/profile/Profile.jsx'
import Orders from './pages/profile/Orders.jsx'
import OrderDetails from './pages/orders/OrderDetails.jsx'
import ReturnRequest from './pages/orders/ReturnRequest.jsx'
import Addresses from './pages/profile/Addresses.jsx'

import AdminCoupons from './pages/admin/AdminCoupons.jsx'
import AdminAgents from './pages/admin/AdminAgents.jsx'
import AdminNotifications from './pages/admin/AdminNotifications.jsx'
import SupportTickets from './pages/support/SupportTickets.jsx'
import TicketDetails from './pages/support/TicketDetails.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import SupportPanel from './pages/admin/SupportPanel.jsx'
import SupportTicketDetails from './pages/admin/SupportTicketDetails.jsx'

// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard.jsx'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { token, user } = useAuthStore()
    if (!token) return <Navigate to="/login" />
    return children
}

const AdminRoute = ({ children }) => {
    const { token, user } = useAuthStore()
    if (!token) return <Navigate to="/login" />
    if (user && user.role !== 'admin') return <Navigate to="/" />
    return children
}

const DeliveryRoute = ({ children }) => {
    const { token, user } = useAuthStore()
    if (!token) return <Navigate to="/login" />
    if (user && user.role !== 'delivery' && user.role !== 'admin') return <Navigate to="/" />
    return children
}

const Layout = ({ children }) => (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50">{children}</main>
        <Footer />
    </div>
)

function App() {
    console.log('App Rendering')
    const { user, fetchMe } = useAuthStore()

    useEffect(() => {
        console.log('App Mounted, fetching user...')
        fetchMe()
    }, [])

    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Shop Routes */}
                <Route path="/" element={
                    user?.role === 'admin' ? <Navigate to="/admin" replace /> : 
                    user?.role === 'delivery' ? <Navigate to="/delivery" replace /> :
                    <Layout><Home /></Layout>
                } />
                <Route path="/products" element={<Layout><ProductList /></Layout>} />
                <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
                <Route path="/cart" element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Layout><Wishlist /></Layout></ProtectedRoute>} />

                {/* Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
                <Route path="/order-success/:id" element={<ProtectedRoute><Layout><OrderSuccess /></Layout></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetails /></Layout></ProtectedRoute>} />
                <Route path="/orders/:orderId/return/:productId" element={<ProtectedRoute><Layout><ReturnRequest /></Layout></ProtectedRoute>} />
                <Route path="/addresses" element={<ProtectedRoute><Layout><Addresses /></Layout></ProtectedRoute>} />

                {/* Support Routes */}
                <Route path="/support/tickets" element={<ProtectedRoute><Layout><SupportTickets /></Layout></ProtectedRoute>} />
                <Route path="/support/tickets/:id" element={<ProtectedRoute><Layout><TicketDetails /></Layout></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
                <Route path="/admin/support" element={<AdminRoute><AdminLayout><SupportPanel /></AdminLayout></AdminRoute>} />
                <Route path="/admin/support/:id" element={<AdminRoute><AdminLayout><SupportTicketDetails /></AdminLayout></AdminRoute>} />
                <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCoupons /></AdminLayout></AdminRoute>} />
                <Route path="/admin/notifications" element={<AdminRoute><AdminLayout><AdminNotifications /></AdminLayout></AdminRoute>} />
                <Route path="/admin/agents" element={<AdminRoute><AdminLayout><AdminAgents /></AdminLayout></AdminRoute>} />

                {/* Delivery Routes */}
                <Route path="/delivery" element={<DeliveryRoute><DeliveryLayout><DeliveryDashboard /></DeliveryLayout></DeliveryRoute>} />
            </Routes>
        </Router>
    )
}

export default App
