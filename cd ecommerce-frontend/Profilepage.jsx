import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Package, MapPin, LogOut, ChevronRight, Heart, RotateCcw, CreditCard } from 'lucide-react'
import { cancelOrder, getMyOrders, getOrderById, requestOrderItemReturn, requestSellerApproval } from './api.js'
import { addToCart } from './cartSlice.js'
import { logout } from './authSlice.js'
import { setCredentials } from './authSlice.js'
import AddressBookDrawer from './AddressBook.jsx'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:    { bg: 'rgba(234,179,8,0.15)',  color: '#eab308' },
  processing: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  shipped:    { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  delivered:  { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  cancelled:  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
}

const NAV_ITEMS = [
  { id: 'orders', icon: Package, label: 'My Orders' },
  { id: 'returns', icon: RotateCcw, label: 'My Returns' },
  { id: 'wishlist', icon: Heart, label: 'Wishlist' },
  { id: 'address', icon: MapPin, label: 'Addresses' },
  { id: 'payments', icon: CreditCard, label: 'Payments' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState('')
  const [detailsLoadingId, setDetailsLoadingId] = useState('')
  const [orderDetailsById, setOrderDetailsById] = useState({})
  const [detailsErrorById, setDetailsErrorById] = useState({})
  const [showAddressDrawer, setShowAddressDrawer] = useState(false)

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const handleSellerRequest = async () => {
    const businessName = window.prompt('Enter your business/store name:')
    if (businessName === null) return

    try {
      const { data } = await requestSellerApproval({ sellerBusinessName: businessName })
      const token = localStorage.getItem('token')
      if (token && data.user) {
        dispatch(setCredentials({ user: data.user, token }))
      }
      toast.success(data.message || 'Seller request submitted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit seller request')
    }
  }

  const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''))

  const handleRequestReturn = async (orderId, productId) => {
    const reason = window.prompt('Reason for return (optional):')
    if (reason === null) return

    try {
      await requestOrderItemReturn(orderId, productId, { reason })
      setOrderDetailsById((prev) => {
        const detail = prev[orderId]
        if (!detail) return prev
        return {
          ...prev,
          [orderId]: {
            ...detail,
            items: (detail.items || []).map((item) =>
              String(item.product) === String(productId)
                ? { ...item, returnRequested: true, returnStatus: 'requested', returnReason: reason }
                : item
            ),
          },
        }
      })
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order
          return {
            ...order,
            items: (order.items || []).map((item) =>
              String(item.product) === String(productId)
                ? { ...item, returnRequested: true, returnStatus: 'requested', returnReason: reason }
                : item
            ),
          }
        })
      )
      toast.success('Return request submitted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to request return')
    }
  }

  const handleViewDetails = async (order) => {
    if (expandedOrderId === order._id) {
      setExpandedOrderId('')
      return
    }

    setExpandedOrderId(order._id)

    if (orderDetailsById[order._id]) {
      return
    }

    if (!isMongoObjectId(order._id)) {
      setOrderDetailsById((prev) => ({ ...prev, [order._id]: order }))
      return
    }

    try {
      setDetailsLoadingId(order._id)
      setDetailsErrorById((prev) => ({ ...prev, [order._id]: '' }))
      const { data } = await getOrderById(order._id)
      setOrderDetailsById((prev) => ({ ...prev, [order._id]: data }))
    } catch {
      setDetailsErrorById((prev) => ({ ...prev, [order._id]: 'Unable to load order details right now.' }))
    } finally {
      setDetailsLoadingId('')
    }
  }

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm('Cancel this order? This action cannot be undone.')
    if (!confirmed) return

    try {
      await cancelOrder(orderId)
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: 'cancelled' } : order)))
      setOrderDetailsById((prev) => {
        const detail = prev[orderId]
        if (!detail) return prev
        return {
          ...prev,
          [orderId]: {
            ...detail,
            status: 'cancelled',
            items: (detail.items || []).map((item) => ({ ...item, fulfillmentStatus: 'cancelled' })),
          },
        }
      })
      toast.success('Order cancelled successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel this order')
    }
  }

  const handleReorder = (order) => {
    const items = Array.isArray(order.items) ? order.items : []
    if (items.length === 0) {
      toast.error('No items available to reorder')
      return
    }

    items.forEach((item) => {
      dispatch(
        addToCart({
          _id: String(item.product),
          name: item.name,
          price: Number(item.price) || 0,
          image: item.image || '',
          qty: Number(item.qty) || 1,
          countInStock: 999,
        })
      )
    })

    toast.success('Items added to cart')
    navigate('/cart')
  }

  const handleDownloadInvoice = (order) => {
    const lines = []
    lines.push('NEXUS INVOICE')
    lines.push(`Order ID: ${order._id}`)
    lines.push(`Date: ${new Date(order.createdAt).toLocaleString('en-IN')}`)
    lines.push(`Status: ${order.status}`)
    lines.push('')
    lines.push('Items:')
    ;(order.items || []).forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.name} x ${item.qty} = Rs.${Number(item.price * item.qty).toLocaleString('en-IN')}`)
    })
    lines.push('')
    lines.push(`Total: Rs.${Number(order.totalAmount || 0).toLocaleString('en-IN')}`)
    lines.push(`Payment: ${order.paymentMethod || 'N/A'} (${order.paymentStatus || 'N/A'})`)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `invoice-${order._id}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pt-20 min-h-screen max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="glass p-5 mb-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 font-display font-bold text-2xl"
                style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', color: 'white' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
          </div>

          <div className="glass overflow-hidden">
            {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm transition-all"
                style={{
                  background: activeTab === id ? 'rgba(249,115,22,0.1)' : 'transparent',
                  color: activeTab === id ? 'var(--accent)' : 'var(--text-secondary)',
                  borderLeft: activeTab === id ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                <div className="flex items-center gap-2">
                  <Icon size={15} />
                  {label}
                </div>
                <ChevronRight size={14} />
              </button>
            ))}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/5"
              style={{ color: '#ef4444', borderTop: '1px solid var(--border)' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="font-display font-bold text-2xl mb-5">My Orders</h2>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="shimmer h-28 rounded-2xl" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="glass p-10 text-center">
                  <Package size={48} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, i) => {
                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
                    return (
                      <motion.div key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-mono text-sm font-semibold">#{order._id}</span>
                            <span className="text-xs ml-3" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                            style={{ background: sc.bg, color: sc.color }}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm space-y-1 mb-3">
                          {order.items?.map((item, j) => (
                            <div key={j} className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                              <span>{item.name} × {item.qty}</span>
                              <span>₹{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 flex items-center justify-between"
                          style={{ borderTop: '1px solid var(--border)' }}>
                          <span className="font-bold">Total: ₹{order.totalAmount?.toLocaleString()}</span>
                          <div className="flex items-center gap-3">
                            <button
                              className="text-xs font-semibold"
                              style={{ color: '#2563eb' }}
                              onClick={() => handleReorder(order)}
                            >
                              Reorder
                            </button>
                            <button
                              className="text-xs font-semibold"
                              style={{ color: '#374151' }}
                              onClick={() => handleDownloadInvoice(order)}
                            >
                              Download Invoice
                            </button>
                            {['pending', 'processing'].includes(String(order.status || '').toLowerCase()) && (
                              <button
                                className="text-xs font-semibold"
                                style={{ color: '#ef4444' }}
                                onClick={() => handleCancelOrder(order._id)}
                              >
                                Cancel Order
                              </button>
                            )}
                            <button
                              className="text-xs font-medium"
                              style={{ color: 'var(--accent)' }}
                              onClick={() => handleViewDetails(order)}
                            >
                              {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                            </button>
                          </div>
                        </div>

                        {expandedOrderId === order._id && (
                          <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px dashed var(--border)' }}>
                            {detailsLoadingId === order._id ? (
                              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Loading order details...
                              </div>
                            ) : detailsErrorById[order._id] ? (
                              <div className="text-sm" style={{ color: '#ef4444' }}>
                                {detailsErrorById[order._id]}
                              </div>
                            ) : (
                              (() => {
                                const detail = orderDetailsById[order._id] || order
                                return (
                                  <>
                                    <div className="space-y-2 text-sm">
                                      {(detail.items || []).map((item, itemIndex) => (
                                        <div key={`${item.name}-${itemIndex}`} className="p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                                          <div className="flex items-center justify-between">
                                            <span>
                                              {item.name} x {item.qty}
                                            </span>
                                            <span className="font-semibold">₹{Number(item.price * item.qty).toLocaleString()}</span>
                                          </div>

                                          {item.returnStatus && item.returnStatus !== 'none' && (
                                            <div className="text-xs mt-1 capitalize" style={{ color: '#b45309' }}>
                                              Return status: {item.returnStatus}
                                            </div>
                                          )}

                                          {item.fulfillmentStatus === 'delivered' && (!item.returnStatus || item.returnStatus === 'none') && (
                                            <button
                                              className="mt-2 text-xs font-semibold"
                                              style={{ color: 'var(--accent)' }}
                                              onClick={() => handleRequestReturn(order._id, item.product)}
                                            >
                                              Request Return
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    {detail.address && (
                                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Delivery Address</div>
                                        <div>
                                          {detail.address.street}, {detail.address.city}, {detail.address.state} - {detail.address.pincode}
                                        </div>
                                        <div>Phone: {detail.address.phone}</div>
                                      </div>
                                    )}

                                    <div className="text-sm flex flex-wrap gap-4" style={{ color: 'var(--text-secondary)' }}>
                                      <span>Payment: <strong style={{ color: 'var(--text-primary)' }}>{detail.paymentMethod || 'N/A'}</strong></span>
                                      <span>Status: <strong style={{ color: 'var(--text-primary)' }}>{detail.paymentStatus || order.status}</strong></span>
                                    </div>
                                  </>
                                )
                              })()
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile edit */}
          {activeTab === 'profile' && (
            <div className="glass p-6">
              <h2 className="font-display font-bold text-2xl mb-5">Profile Information</h2>
              <div className="space-y-4">
                {['name', 'email', 'phone'].map(f => (
                  <div key={f}>
                    <label className="text-sm font-medium block mb-1.5 capitalize">{f}</label>
                    <input defaultValue={user?.[f]} disabled
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', opacity: 0.7 }}
                    />
                  </div>
                ))}
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Profile editing will be connected to the backend API.
                </p>
                {user?.role === 'user' && (
                  <button onClick={handleSellerRequest} className="btn-outline py-3 px-6">
                    Request Seller Access
                  </button>
                )}
                {user?.role === 'seller' && user?.sellerApprovalStatus === 'pending' && (
                  <p className="text-xs" style={{ color: '#b45309' }}>
                    Seller request is pending admin approval.
                  </p>
                )}
                <button className="btn-primary py-3 px-6">Save Changes</button>
              </div>
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'address' && (
            <div className="glass p-6">
              <h2 className="font-display font-bold text-2xl mb-5">Saved Addresses</h2>
              <button
                onClick={() => setShowAddressDrawer(true)}
                className="btn-primary py-3 px-6"
              >
                Manage Addresses
              </button>
            </div>
          )}

          {/* Returns */}
          {activeTab === 'returns' && (
            <div className="glass p-6">
              <h2 className="font-display font-bold text-2xl mb-5">My Returns</h2>
              <button
                onClick={() => navigate('/my-returns')}
                className="btn-primary py-3 px-6"
              >
                View Returns
              </button>
            </div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="glass p-6">
              <h2 className="font-display font-bold text-2xl mb-5">My Wishlist</h2>
              <button
                onClick={() => navigate('/wishlist')}
                className="btn-primary py-3 px-6"
              >
                View Wishlist
              </button>
            </div>
          )}

          {/* Payment Methods */}
          {activeTab === 'payments' && (
            <div className="glass p-6">
              <h2 className="font-display font-bold text-2xl mb-5">Payment Methods</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Manage your saved payment methods for quick checkout.
              </p>
              <button
                className="btn-outline py-3 px-6"
              >
                Add Payment Method
              </button>
            </div>
          )}
        </div>
      </div>

      <AddressBookDrawer
        isOpen={showAddressDrawer}
        onClose={() => setShowAddressDrawer(false)}
      />
    </div>
  )
}