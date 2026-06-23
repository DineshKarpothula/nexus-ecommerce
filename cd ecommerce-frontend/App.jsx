import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { ProtectedRoute, AdminRoute, SellerRoute } from './ProtectedRoute.jsx'

// Pages
import HomePage from './Homepage.jsx'
import LoginPage from './Loginpage.jsx'
import RegisterPage from './RegisterPage.jsx'
import ProductsPage from './ProductsPage.jsx'
import ProductDetailPage from './Productdetailpage.jsx'
import CartPage from './CartPage.jsx'
import CheckoutPage from './Checkoutpage.jsx'
import ProfilePage from './Profilepage.jsx'
import ReturnsPage from './ReturnsPage.jsx'
import AdminPage from './AdminPage.jsx'
import SellerPage from './SellerPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import WishlistPage from './WishlistPage.jsx'
import ReturnPage from './ReturnPage.jsx'
import HelpCenter from './HelpCenter.jsx'
import SupportTicket from './SupportTicket.jsx'
import SupportTickets from './SupportTickets.jsx'
import AdminSupportPanel from './AdminSupportPanel.jsx'
import AboutPage from './AboutPage.jsx'
import CollectionsPage from './CollectionsPage.jsx'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

function SellerPublicGate() {
  const { user, token } = useSelector((state) => state.auth)

  if (user && token && user.role === 'seller' && user.sellerApprovalStatus === 'approved') {
    return <Navigate to="/seller/dashboard" replace />
  }

  return <PublicLayout />
}

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search])

  return null
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '3px solid #000',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 rgba(0,0,0,1)',
            fontWeight: 700,
          },
        }}
      />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <>
                <Navbar />
                <AdminPage />
              </>
            </AdminRoute>
          }
        />

        <Route
          path="/seller"
          element={<Navigate to="/seller/dashboard" replace />}
        />

        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <>
                <Navbar />
                <SellerPage />
              </>
            </SellerRoute>
          }
        />

        <Route element={<SellerPublicGate />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <ProtectedRoute>
                <ReturnsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<HelpCenter />} />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/my"
            element={
              <ProtectedRoute>
                <SupportTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support"
            element={
              <AdminRoute>
                <AdminSupportPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-returns"
            element={
              <ProtectedRoute>
                <ReturnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}