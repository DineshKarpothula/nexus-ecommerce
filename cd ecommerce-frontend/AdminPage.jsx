import { useEffect, useState } from 'react'
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { LayoutDashboard, ShoppingBag, Users, LogOut, TrendingUp, IndianRupee, Eye, UserCheck, X, RotateCcw, Zap } from 'lucide-react'
import {
  approveSeller,
  deleteUser,
  getAllOrders,
  getLowStockProducts,
  getReturnAnalytics,
  getAllUsers,
  getDashboardStats,
  getPendingSellers,
  rejectSeller,
  updateOrderStatus,
  getAllReturns,
} from './api.js'
import { logout } from './authSlice.js'
import PromotionsPanel from './PromotionsPanel.jsx'
import toast from 'react-hot-toast'

const DEMO_STATS = {
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalUsers: 0,
  recentOrders: [],
}

const STATUS_COLORS = {
  pending: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  processing: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  shipped: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  delivered: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
}

const TREND_COLOR = {
  positive: '#22c55e',
  neutral: 'var(--text-secondary)',
  negative: '#ef4444',
}

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/sellers', label: 'Seller Approvals', icon: UserCheck },
  { path: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { path: '/admin/promotions', label: 'Promotions', icon: Zap },
]

function Sidebar({ activePath }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isActive = (path) => {
    if (path === '/admin') {
      return activePath === '/admin'
    }
    return activePath.startsWith(path)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col p-4" style={{ background: 'var(--bg-card)', borderRight: '4px solid #000', minHeight: '100vh' }}>
      <div className="surface p-4">
        <div className="font-display text-2xl uppercase">Admin Panel</div>
        <div className="text-xs mt-1 uppercase" style={{ color: 'var(--text-secondary)' }}>Nexus control center</div>
      </div>
      <nav className="flex-1 mt-4 space-y-2">
        {NAV.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide"
            style={{
              background: isActive(path) ? '#ffe45c' : '#fff',
              color: '#000',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
            }}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>
      <div className="pt-2">
        <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-black uppercase" style={{ color: '#991b1b', background: '#fff0f0', border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}

function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [returnAnalytics, setReturnAnalytics] = useState(null)
  const [pendingSellersCount, setPendingSellersCount] = useState(0)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const getTrendDirection = (value) => {
    if (value > 0) return 'positive'
    if (value < 0) return 'negative'
    return 'neutral'
  }

  const formatTrend = (value) => {
    if (value > 0) return `+${value}% this week`
    if (value < 0) return `${value}% this week`
    return '0% this week'
  }

  const thisWeekOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return orderDate >= sevenDaysAgo
  }).length

  const previousWeekOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt)
    const sevenDaysAgo = new Date()
    const fourteenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    return orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo
  }).length

  const orderTrend = previousWeekOrders === 0
    ? (thisWeekOrders > 0 ? 100 : 0)
    : Math.round(((thisWeekOrders - previousWeekOrders) / previousWeekOrders) * 100)

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
  }

  const getOrderItems = (order) => {
    if (!order) return []
    if (Array.isArray(order.items) && order.items.length > 0) return order.items
    if (Array.isArray(order.orderItems) && order.orderItems.length > 0) return order.orderItems
    return []
  }

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllOrders(), getReturnAnalytics(), getPendingSellers(), getLowStockProducts(5)])
      .then(([s, o, r, pendingRes, lowStockRes]) => {
        setStats(s.data)
        setOrders(o.data?.slice(0, 5) || [])
        setReturnAnalytics(r.data || null)
        setPendingSellersCount((pendingRes.data || []).length)
        setLowStock(lowStockRes.data?.products || [])
      })
      .catch(() => {
        setStats(DEMO_STATS)
        setOrders([])
        setReturnAnalytics(null)
        setPendingSellersCount(0)
        setLowStock([])
      })
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: '#f97316',
      trend: Math.max(orderTrend, 0),
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: '#3b82f6',
      trend: orderTrend,
    },
    {
      label: 'Products',
      value: stats?.totalProducts || 0,
      icon: ShoppingBag,
      color: '#10b981',
      trend: Math.round(orderTrend * 0.4),
    },
    {
      label: 'Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: '#a855f7',
      trend: Math.round(orderTrend * 0.6),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, trend }, index) => {
          const trendDirection = getTrendDirection(trend)

          return (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="surface p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <TrendingUp size={14} style={{ color: TREND_COLOR[trendDirection] }} />
            </div>
            <div className="font-display font-bold text-2xl">{loading ? '...' : value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
            <div className="text-xs mt-1 font-semibold" style={{ color: TREND_COLOR[trendDirection] }}>
              {loading ? '...' : formatTrend(trend)}
            </div>
          </motion.div>
          )
        })}
      </div>

      <div className="surface p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Return Analytics</h2>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live</span>
        </div>
        {loading ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading return analytics...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Return Rate</div>
              <div className="font-bold text-lg">{returnAnalytics?.returnRate ?? 0}%</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Approval Rate</div>
              <div className="font-bold text-lg">{returnAnalytics?.approvalRate ?? 0}%</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Requested</div>
              <div className="font-bold text-lg">{returnAnalytics?.statusCounts?.requested ?? 0}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Approved</div>
              <div className="font-bold text-lg">{(returnAnalytics?.statusCounts?.approved ?? 0) + (returnAnalytics?.statusCounts?.completed ?? 0)}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rejected</div>
              <div className="font-bold text-lg">{returnAnalytics?.statusCounts?.rejected ?? 0}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="surface p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Operational Alerts</h2>
            <Link to="/admin/sellers" className="text-xs" style={{ color: 'var(--accent)' }}>Manage</Link>
          </div>
          <div className="space-y-2 text-sm">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              Pending seller approvals: <strong>{pendingSellersCount}</strong>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              Low-stock SKUs ({'<='} 5): <strong>{lowStock.length}</strong>
            </div>
          </div>
        </div>

        <div className="surface p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Low Stock Preview</h2>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Top 3</span>
          </div>
          <div className="space-y-2 text-sm">
            {lowStock.slice(0, 3).map((product) => (
              <div key={product._id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <span>{product.name}</span>
                <span className="font-semibold" style={{ color: '#ef4444' }}>{product.stock} left</span>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                No low-stock products.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs" style={{ color: 'var(--accent)' }}>View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date', 'Action'].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
                return (
                  <tr key={order._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-5 py-3 font-mono text-xs">#{order._id}</td>
                    <td className="px-5 py-3">{order.user?.name || order.user}</td>
                    <td className="px-5 py-3 font-semibold">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full capitalize" style={{ background: sc.bg, color: sc.color }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--accent)' }}
                        title="View order details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="surface w-full max-w-2xl max-h-[85vh] overflow-auto p-5" style={{ border: '2px solid var(--border)', boxShadow: '6px 6px 0 #000' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-xl">Order Details</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>#{selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Close order details"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Customer</div>
                <div className="font-medium mt-1">{selectedOrder.user?.name || selectedOrder.user || 'N/A'}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Amount</div>
                <div className="font-semibold mt-1">₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || 0}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</div>
                <div className="capitalize font-medium mt-1">{selectedOrder.status}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Date</div>
                <div className="font-medium mt-1">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <div className="space-y-2">
                {getOrderItems(selectedOrder).length === 0 && (
                  <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    No item details available for this order.
                  </div>
                )}

                {getOrderItems(selectedOrder).map((item, index) => {
                  const quantity = item.qty ?? item.quantity ?? 0
                  const lineTotal = (item.price || 0) * quantity

                  return (
                  <div key={`${item.product || item._id || item.name || 'item'}-${index}`} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div>
                      <div className="font-medium">{item.name || 'Product'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Qty: {quantity}</div>
                    </div>
                    <div className="font-semibold">₹{lineTotal.toLocaleString('en-IN')}</div>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    getAllOrders()
      .then((response) => setOrders(response.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) => prev.map((order) => (order._id === id ? { ...order, status } : order)))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = String(searchQuery || '').trim().toLowerCase().replace(/^#/, '')
    const matchesStatus = statusFilter === 'all' || String(order.status || '').toLowerCase() === statusFilter
    if (!normalizedSearch) return matchesStatus

    const orderId = String(order._id || '').toLowerCase().replace(/^#/, '')
    const customerName = String(order.user?.name || order.user || '').toLowerCase()
    return matchesStatus && (orderId.includes(normalizedSearch) || customerName.includes(normalizedSearch))
  })

  const statusCounts = filteredOrders.reduce((acc, order) => {
    const key = String(order.status || 'pending').toLowerCase()
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const handleExportCsv = () => {
    const headers = ['Order ID', 'Customer', 'Amount', 'Status', 'Date']
    const rows = filteredOrders.map((order) => [
      order._id,
      order.user?.name || order.user || 'N/A',
      order.totalAmount || 0,
      order.status || '',
      new Date(order.createdAt).toISOString(),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-orders-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl mb-6">Orders</h1>
      <div className="surface p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by order id or customer"
          className="px-3 py-2 rounded-lg text-sm outline-none min-w-[240px]"
          style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}
        >
          <option value="all">All statuses</option>
          {Object.keys(STATUS_COLORS).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button onClick={handleExportCsv} className="btn-outline py-2 px-3 text-xs">Export CSV</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {Object.keys(STATUS_COLORS).map((status) => (
          <div key={status} className="surface p-3 text-xs capitalize">
            <div style={{ color: 'var(--text-secondary)' }}>{status}</div>
            <div className="font-bold text-base">{statusCounts[status] || 0}</div>
          </div>
        ))}
      </div>
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1, 2, 3, 4].map((row) => (
                  <tr key={row} style={{ borderTop: '1px solid var(--border)' }}>
                    {[1, 2, 3, 4, 5].map((cell) => <td key={cell} className="px-5 py-4"><div className="shimmer h-4 rounded w-24" /></td>)}
                  </tr>
                ))
                : filteredOrders.map((order) => {
                  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
                  return (
                    <tr key={order._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-5 py-3 font-mono text-xs">#{order._id}</td>
                      <td className="px-5 py-3">{order.user?.name || order.user}</td>
                      <td className="px-5 py-3 font-semibold">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3">
                        <select
                          value={order.status}
                          onChange={(event) => changeStatus(order._id, event.target.value)}
                          className="text-xs font-semibold px-2 py-1 rounded-full outline-none cursor-pointer capitalize"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}55` }}
                        >
                          {Object.keys(STATUS_COLORS).map((status) => (
                            <option key={status} value={status} style={{ color: '#111827', background: '#ffffff' }}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const demoUsers = [
    { _id: 'u1', name: 'Rahul Kumar', email: 'rahul@email.com', role: 'user', createdAt: '2025-01-10', orders: 5 },
    { _id: 'u2', name: 'Priya Sharma', email: 'priya@email.com', role: 'user', createdAt: '2025-01-22', orders: 2 },
    { _id: 'u3', name: 'Amit Singh', email: 'amit@email.com', role: 'user', createdAt: '2025-02-01', orders: 8 },
  ]

  useEffect(() => {
    getAllUsers()
      .then((response) => setUsers(response.data))
      .catch(() => setUsers(demoUsers))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteUser = async (id, name) => {
    const confirmed = window.confirm(`Delete user ${name}?`)
    if (!confirmed) return

    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((entry) => entry._id !== id))
      toast.success('User deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete user')
    }
  }

  const filteredUsers = users.filter((user) => {
    const q = String(searchQuery || '').trim().toLowerCase()
    const matchesRole = roleFilter === 'all' || String(user.role || '').toLowerCase() === roleFilter
    if (!q) return matchesRole
    return matchesRole && (String(user.name || '').toLowerCase().includes(q) || String(user.email || '').toLowerCase().includes(q))
  })

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl mb-6">Users</h1>
      <div className="surface p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name or email"
          className="px-3 py-2 rounded-lg text-sm outline-none min-w-[240px]"
          style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="user">User</option>
        </select>
      </div>
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {['Name', 'Email', 'Role', 'Joined', 'Orders', 'Action'].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1, 2, 3].map((row) => (
                  <tr key={row} style={{ borderTop: '1px solid var(--border)' }}>
                    {[1, 2, 3, 4, 5, 6].map((cell) => <td key={cell} className="px-5 py-4"><div className="shimmer h-4 rounded w-24" /></td>)}
                  </tr>
                ))
                : filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-5 py-3 font-medium">{user.name}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: user.role === 'admin' ? 'rgba(249,115,22,0.15)' : user.role === 'seller' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.07)',
                          color: user.role === 'admin' ? 'var(--accent)' : user.role === 'seller' ? '#3b82f6' : 'var(--text-secondary)',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3">{user.orders || 0}</td>
                    <td className="px-5 py-3">
                      {String(user.role || '').toLowerCase() !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdminSellerApprovals() {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPendingSellers()
      .then((response) => setSellers(response.data || []))
      .catch(() => {
        toast.error('Unable to load pending sellers')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDecision = async (sellerId, action) => {
    try {
      if (action === 'approve') {
        await approveSeller(sellerId)
      } else {
        await rejectSeller(sellerId)
      }

      setSellers((prev) => prev.filter((seller) => seller._id !== sellerId))
      toast.success(`Seller ${action}d successfully`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update seller status')
    }
  }

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl mb-6">Seller Approvals</h1>
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {['Name', 'Email', 'Business', 'Requested On', 'Action'].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-5 py-4" colSpan={5}>Loading pending sellers...</td>
                </tr>
              )}

              {!loading && sellers.length === 0 && (
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-5 py-6" colSpan={5}>No pending seller requests.</td>
                </tr>
              )}

              {!loading && sellers.map((seller) => (
                <tr key={seller._id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-5 py-3 font-medium">{seller.name}</td>
                  <td className="px-5 py-3">{seller.email}</td>
                  <td className="px-5 py-3">{seller.sellerBusinessName || 'N/A'}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {seller.sellerRequestedAt ? new Date(seller.sellerRequestedAt).toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleDecision(seller._id, 'approve')} className="btn-primary py-2 px-3 text-xs">Approve</button>
                      <button onClick={() => handleDecision(seller._id, 'reject')} className="btn-outline py-2 px-3 text-xs">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar activePath={location.pathname} />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-dark)' }}>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminSellerApprovals />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="promotions" element={<PromotionsPanel isAdmin={true} />} />
        </Routes>
      </main>
    </div>
  )
}

function AdminReturns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchReturns()
  }, [filterStatus])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const params = filterStatus !== 'all' ? { status: filterStatus } : {}
      const res = await getAllReturns(params)
      setReturns(res.data || [])
    } catch (err) {
      toast.error('Failed to load returns')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl mb-6">Returns Management</h1>
      <div className="surface p-4 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}
        >
          <option value="all">All Status</option>
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="in_transit">In Transit</option>
          <option value="received">Received</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {['Product', 'Customer', 'Reason', 'Amount', 'Status', 'Date'].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1, 2, 3].map((row) => (
                  <tr key={row} style={{ borderTop: '1px solid var(--border)' }}>
                    {[1, 2, 3, 4, 5, 6].map((cell) => <td key={cell} className="px-5 py-4"><div className="shimmer h-4 rounded w-24" /></td>)}
                  </tr>
                ))
                : returns.map((ret) => (
                  <tr key={ret._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-5 py-3 font-medium">{ret.product?.name}</td>
                    <td className="px-5 py-3">{ret.user?.name}</td>
                    <td className="px-5 py-3"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{ret.reason}</span></td>
                    <td className="px-5 py-3 font-semibold">₹{ret.refundAmount}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        ret.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                        ret.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        ret.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(ret.requestedAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

