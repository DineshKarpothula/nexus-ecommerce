import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth)
  if (!user || !token) return <Navigate to="/login" replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth)
  if (!user || !token) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export function SellerRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth)
  if (!user || !token) return <Navigate to="/login" replace />
  if (user.role !== 'seller') return <Navigate to="/" replace />
  if (user.sellerApprovalStatus !== 'approved') return <Navigate to="/profile" replace />
  return children
}