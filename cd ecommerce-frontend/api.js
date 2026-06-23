import axios from 'axios'

const RENDER_API_BASE_URL = 'https://nexus-ecommerceplatform.onrender.com/api'

const resolveApiBaseUrl = () => {
  const configured = String(import.meta.env.VITE_API_URL || '').trim()

  if (!import.meta.env.PROD) {
    return configured || '/api'
  }

  // In production, ignore localhost-style values that can break Vercel deploys.
  if (!configured || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configured)) {
    return RENDER_API_BASE_URL
  }

  return configured
}

const apiBaseUrl = resolveApiBaseUrl()

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

const normalizedApiBaseUrl = String(apiBaseUrl || '').replace(/\/+$/, '')

export const buildProductImageProxyUrl = (imageUrl) => {
  const raw = String(imageUrl || '').trim()
  if (!raw) return ''
  return `${normalizedApiBaseUrl}/products/image-proxy?url=${encodeURIComponent(raw)}`
}

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getProfile = () => api.get('/auth/profile')
export const requestSellerApproval = (data) => api.post('/auth/request-seller', data)

// ── Products ─────────────────────────────────────
export const getProducts = (params) => api.get('/products', { params })
export const getProductById = (id) => api.get(`/products/${id}`)
export const addProductReview = (id, data) => api.post(`/products/${id}/reviews`, data)
export const getFeaturedProducts = () => api.get('/products/featured')
export const searchProducts = (query) => api.get('/products/search', { params: { q: query } })

// ── Admin Products ───────────────────────────────
export const createProduct = (data) => api.post('/admin/products', data)
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`)

// ── Orders ───────────────────────────────────────
export const placeOrder = (data) => api.post('/orders', data)
export const getMyOrders = () => api.get('/orders/my')
export const getOrderById = (id) => api.get(`/orders/${id}`)
export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`)
export const requestOrderItemReturn = (orderId, productId, data) => api.put(`/orders/${orderId}/items/${productId}/return`, data)

// ── Payments ─────────────────────────────────────
export const createPaymentIntent = (data) => api.post('/payments/create-intent', data)

// ── Admin Orders ─────────────────────────────────
export const getAllOrders = () => api.get('/admin/orders')
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}`, { status })

// ── Admin Users ──────────────────────────────────
export const getAllUsers = () => api.get('/admin/users')
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)

// ── Admin Dashboard ──────────────────────────────
export const getDashboardStats = () => api.get('/admin/dashboard')
export const getReturnAnalytics = () => api.get('/admin/returns/analytics')
export const getLowStockProducts = (threshold = 5) => api.get('/admin/products/low-stock', { params: { threshold } })
export const getPendingSellers = () => api.get('/admin/sellers/pending')
export const approveSeller = (id) => api.put(`/admin/sellers/${id}/approve`)
export const rejectSeller = (id) => api.put(`/admin/sellers/${id}/reject`)

// ── Seller ───────────────────────────────────────
export const getSellerProducts = () => api.get('/seller/products')
export const createSellerProduct = (data) => api.post('/seller/products', data)
export const updateSellerProduct = (id, data) => api.put(`/seller/products/${id}`, data)
export const deleteSellerProduct = (id) => api.delete(`/seller/products/${id}`)
export const getSellerOrders = () => api.get('/seller/orders')
export const shipSellerOrderItem = (orderId, productId) => api.put(`/seller/orders/${orderId}/items/${productId}/ship`)
export const deliverSellerOrderItem = (orderId, productId) => api.put(`/seller/orders/${orderId}/items/${productId}/deliver`)
export const updateSellerReturnRequest = (orderId, productId, status) =>
  api.put(`/seller/orders/${orderId}/items/${productId}/return`, { status })

// ── Wishlist ─────────────────────────────────────
export const getWishlist = () => api.get('/wishlist')
export const addToWishlist = (productId) => api.post('/wishlist', { productId })
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`)
export const isInWishlist = (productId) => api.get(`/wishlist/check/${productId}`)
export const getWishlistCount = () => api.get('/wishlist/count/total')
export const enablePriceDropNotification = (productId) => api.put(`/wishlist/${productId}/notify`)

// ── Address Book ─────────────────────────────────
export const getAddresses = () => api.get('/address')
export const addAddress = (data) => api.post('/address', data)
export const updateAddress = (addressId, data) => api.put(`/address/${addressId}`, data)
export const deleteAddress = (addressId) => api.delete(`/address/${addressId}`)
export const setDefaultAddress = (addressId) => api.put(`/address/${addressId}/default`)

// ── Returns ──────────────────────────────────────
export const requestReturn = (data) => api.post('/returns', data)
export const getUserReturns = () => api.get('/returns/user/my-returns')
export const getSellerReturns = () => api.get('/returns/seller/returns')
export const approveReturn = (returnId, data) => api.put(`/returns/${returnId}/approve`, data)
export const rejectReturn = (returnId, data) => api.put(`/returns/${returnId}/reject`, data)
export const getAllReturns = (params) => api.get('/returns/admin/all', { params })
export const markReturnReceived = (returnId) => api.put(`/returns/${returnId}/received`)

// ── Promotions ───────────────────────────────────
export const createPromotion = (data) => api.post('/promotions', data)
export const getActivePromotions = () => api.get('/promotions/active')
export const validatePromoCode = (code, cartTotal) => api.post('/promotions/validate', { code, cartTotal })
export const getMyPromotions = () => api.get('/promotions/creator/my-promotions')
export const updatePromotion = (promotionId, data) => api.put(`/promotions/${promotionId}`, data)
export const deletePromotion = (promotionId) => api.delete(`/promotions/${promotionId}`)

// ── Payment Methods ──────────────────────────────
export const getPaymentMethods = () => api.get('/payment-methods')
export const addPaymentMethod = (data) => api.post('/payment-methods', data)
export const setDefaultPaymentMethod = (paymentMethodId) => api.put(`/payment-methods/${paymentMethodId}/default`)
export const deletePaymentMethod = (paymentMethodId) => api.delete(`/payment-methods/${paymentMethodId}`)

// ── Support Tickets ─────────────────────────────
export const createTicket = (data) => api.post('/support/tickets', data)
export const getMyTickets = () => api.get('/support/tickets/my')
export const getTicket = (id) => api.get(`/support/tickets/${id}`)
export const addTicketMessage = (id, data) => api.post(`/support/tickets/${id}/messages`, data)
export const getAllTicketsAdmin = () => api.get('/support/tickets')
export const updateTicketStatus = (id, status) => api.put(`/support/tickets/${id}/status`, { status })

export default api