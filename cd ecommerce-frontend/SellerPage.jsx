import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Bell,
  Clock,
  LayoutDashboard,
  MoreVertical,
  Package,
  PlusSquare,
  RotateCcw,
  Save,
  Search,
  Tags,
  Truck,
  TrendingUp,
} from 'lucide-react'
import {
  createSellerProduct,
  deliverSellerOrderItem,
  deleteSellerProduct,
  getSellerOrders,
  getSellerProducts,
  shipSellerOrderItem,
  updateSellerProduct,
  updateSellerReturnRequest,
  getSellerReturns,
} from './api.js'
import PromotionsPanel from './PromotionsPanel.jsx'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '',
  price: '',
  originalPrice: '',
  category: '',
  stock: '',
  description: '',
  images: '',
  specificationsText: '',
  returnable: false,
  returnWindow: '7',
  replaceable: false,
}
const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive']

const READY_PRODUCTS = [
  {
    name: 'Premium Basmati Rice 5kg',
    category: 'Home',
    price: 649,
    originalPrice: 799,
    stock: 120,
    description:
      'Long-grain premium basmati rice with rich aroma and fluffy texture after cooking. Ideal for biryani, pulao, and daily meals. Hygienically packed with moisture-lock freshness.',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'GrainCraft',
      Weight: '5 kg',
      GrainType: 'Extra Long',
      ShelfLife: '12 months',
      Packaging: 'Moisture-lock pouch',
    },
    returnable: true,
    returnWindow: 7,
    replaceable: true,
  },
  {
    name: 'Cold Pressed Groundnut Oil 1L',
    category: 'Home',
    price: 289,
    originalPrice: 349,
    stock: 85,
    description:
      'Wood-pressed groundnut oil with natural aroma and authentic flavor. Perfect for Indian cooking and deep frying with no artificial preservatives.',
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'PureFarm',
      Volume: '1 Liter',
      Extraction: 'Cold Pressed',
      Filtered: 'Yes',
      ShelfLife: '9 months',
    },
    returnable: true,
    returnWindow: 7,
    replaceable: true,
  },
  {
    name: 'Stainless Steel Pressure Cooker 5L',
    category: 'Home',
    price: 1899,
    originalPrice: 2399,
    stock: 34,
    description:
      'Heavy-gauge stainless steel pressure cooker with induction-compatible base and safety valve. Built for daily family cooking with long-lasting durability.',
    images: ['https://images.unsplash.com/photo-1584990347449-a90f0f6f2bd3?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'KitchenPro',
      Capacity: '5 Liter',
      Material: 'Stainless Steel',
      Compatible: 'Gas + Induction',
      Warranty: '5 years',
    },
    returnable: true,
    returnWindow: 10,
    replaceable: true,
  },
  {
    name: 'Wireless Bluetooth Earbuds',
    category: 'Electronics',
    price: 1299,
    originalPrice: 1999,
    stock: 60,
    description:
      'Compact true wireless earbuds with deep bass, low-latency mode, and ENC calling microphone. Delivers up to 24 hours playback with charging case.',
    images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'SoundPeak',
      Bluetooth: '5.3',
      Battery: '24 hours total',
      WaterResistance: 'IPX4',
      ChargingPort: 'USB-C',
    },
    returnable: true,
    returnWindow: 7,
    replaceable: true,
  },
  {
    name: 'Men Running Shoes - Mesh Comfort',
    category: 'Fashion',
    price: 1499,
    originalPrice: 2199,
    stock: 50,
    description:
      'Lightweight running shoes with breathable mesh upper, anti-slip sole, and cushioned footbed. Designed for daily wear, walking, and gym workouts.',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'Sprinton',
      Upper: 'Breathable Mesh',
      Sole: 'Rubber Grip',
      Insole: 'Cushioned',
      Fit: 'Regular',
    },
    returnable: true,
    returnWindow: 10,
    replaceable: true,
  },
  {
    name: 'Vitamin C Face Serum 30ml',
    category: 'Beauty',
    price: 399,
    originalPrice: 549,
    stock: 95,
    description:
      'Dermat-tested Vitamin C serum for brightening and uneven tone reduction. Lightweight, non-sticky formula suitable for daily AM/PM skincare routine.',
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'GlowRoot',
      Volume: '30 ml',
      KeyIngredient: 'Vitamin C',
      SkinType: 'All Skin Types',
      DermatTested: 'Yes',
    },
    returnable: true,
    returnWindow: 5,
    replaceable: false,
  },
  {
    name: 'Adjustable Dumbbells Set 20kg',
    category: 'Sports',
    price: 3299,
    originalPrice: 4299,
    stock: 28,
    description:
      'Space-saving adjustable dumbbell set with anti-slip grip and durable locking mechanism. Ideal for home strength training, HIIT workouts, and progressive overload sessions.',
    images: ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'IronCore',
      TotalWeight: '20 kg',
      Material: 'Cast Iron + ABS',
      Grip: 'Anti-slip textured',
      SuitableFor: 'Home workouts',
    },
    returnable: true,
    returnWindow: 7,
    replaceable: true,
  },
  {
    name: 'Atomic Habits - Paperback',
    category: 'Books',
    price: 399,
    originalPrice: 599,
    stock: 140,
    description:
      'Bestselling self-improvement book focused on tiny habit changes that deliver remarkable long-term results. A practical guide for productivity, discipline, and personal growth.',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Author: 'James Clear',
      Format: 'Paperback',
      Language: 'English',
      Pages: '320',
      Genre: 'Self-help',
    },
    returnable: true,
    returnWindow: 5,
    replaceable: true,
  },
  {
    name: 'STEM Building Blocks Kit - 500 Pieces',
    category: 'Toys',
    price: 1199,
    originalPrice: 1599,
    stock: 72,
    description:
      'Creative STEM construction set for kids with 500 colorful pieces. Encourages imagination, problem-solving, and motor-skill development through hands-on play.',
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'PlayNova',
      AgeGroup: '6+ years',
      Pieces: '500',
      Material: 'BPA-free plastic',
      Theme: 'STEM Creative Build',
    },
    returnable: true,
    returnWindow: 7,
    replaceable: true,
  },
  {
    name: 'Car Dashboard Phone Mount',
    category: 'Automotive',
    price: 699,
    originalPrice: 999,
    stock: 90,
    description:
      '360-degree rotatable dashboard phone mount with strong suction base and one-touch lock. Designed for stable navigation viewing on city roads and highways.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'],
    specifications: {
      Brand: 'DriveMate',
      Rotation: '360 degree',
      MountType: 'Dashboard suction',
      Compatibility: '4 to 7 inch phones',
      Material: 'ABS + Silicone',
    },
    returnable: true,
    returnWindow: 7,
    replaceable: true,
  },
]

const resolveSectionFromHash = (hash) => {
  const value = String(hash || '').toLowerCase()
  if (value === '#dashboard') return 'dashboard'
  if (value === '#my-products') return 'my-products'
  if (value === '#orders-to-fulfill') return 'orders-to-fulfill'
  if (value === '#analytics') return 'analytics'
  if (value === '#promotions') return 'promotions'
  if (value === '#returns') return 'returns'
  if (value === '#add-product') return 'add-product'
  return 'dashboard'
}

const SELLER_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'my-products', label: 'My Products', icon: Package },
  { key: 'orders-to-fulfill', label: 'Orders', icon: Truck },
  { key: 'add-product', label: 'Add Product', icon: PlusSquare },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'promotions', label: 'Promotions', icon: Tags },
  { key: 'returns', label: 'Returns', icon: RotateCcw },
]

const SELLER_THEME = {
  pageBg: 'linear-gradient(180deg, #f3f7ff 0%, #eef4ff 60%, #f8fbff 100%)',
  sidebarBg: 'linear-gradient(180deg, #f9fbff 0%, #f2f7ff 100%)',
  panelBorder: '#cfdcff',
  accent: '#4f46e5',
  accentSoft: '#e0e7ff',
  accentHover: '#eef2ff',
  textMuted: '#64748b',
}

export default function SellerPage() {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [activeSection, setActiveSection] = useState(() => resolveSectionFromHash(window.location.hash))
  const [dashboardSearch, setDashboardSearch] = useState('')
  const [dashboardSearchInput, setDashboardSearchInput] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [revenueRange, setRevenueRange] = useState('7')
  const [showNotifications, setShowNotifications] = useState(false)
  const dashboardQuery = dashboardSearch.trim().toLowerCase()
  const productQuery = productSearch.trim().toLowerCase()
  const effectiveProductQuery = (productQuery || dashboardQuery).trim()
  const activeProductSearchTerm = productQuery ? productSearch : dashboardSearch

  useEffect(() => {
    Promise.all([getSellerProducts(), getSellerOrders(), getSellerReturns()])
      .then(([productsRes, ordersRes, returnsRes]) => {
        setProducts(productsRes.data || [])
        setOrders(ordersRes.data || [])
        setReturns(returnsRes.data || [])
      })
      .catch(() => {
        toast.error('Unable to load seller dashboard')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setActiveSection(resolveSectionFromHash(location.hash))
  }, [location.hash])

  useEffect(() => {
    setDashboardSearchInput(dashboardSearch)
  }, [dashboardSearch])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const pendingItems = orders.reduce(
      (count, order) => count + (order.sellerItems || []).filter((item) => item.fulfillmentStatus === 'processing').length,
      0
    )
    const revenue = orders.reduce((sum, order) => sum + Number(order.sellerTotal || 0), 0)
    return { totalProducts, pendingItems, revenue }
  }, [products, orders])

  const lowStockProducts = useMemo(
    () => products.filter((product) => Number(product.stock || 0) <= 5),
    [products]
  )

  const orderDerivedReturns = useMemo(() => {
    const rows = []

    ;(orders || []).forEach((order) => {
      ;(order.sellerItems || []).forEach((item) => {
        const status = String(item.returnStatus || '').toLowerCase()
        if (!['requested', 'approved', 'rejected', 'completed'].includes(status)) return

        rows.push({
          _id: `${order._id}-${item.product}`,
          order: { _id: order._id },
          product: { _id: item.product, name: item.name },
          user: order.customer,
          reason: item.returnReason || 'Customer requested return',
          description: item.returnReason || '',
          refundAmount: Number(item.price || 0) * Number(item.qty || 0),
          status,
          requestedAt: item.returnRequestedAt || order.updatedAt || order.createdAt,
        })
      })
    })

    return rows.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
  }, [orders])

  const visibleReturns = returns.length > 0 ? returns : orderDerivedReturns

  const revenueSeries = useMemo(() => {
    const days = Math.max(7, Math.min(30, Number(revenueRange) || 7))
    const now = new Date()
    const buckets = Array.from({ length: days }, (_, index) => {
      const date = new Date(now)
      date.setDate(now.getDate() - (days - 1 - index))
      date.setHours(0, 0, 0, 0)
      return {
        key: date.toISOString().slice(0, 10),
        date,
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        compactLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: 0,
      }
    })

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

    ;(orders || []).forEach((order) => {
      const orderDate = new Date(order.createdAt || order.updatedAt || Date.now())
      orderDate.setHours(0, 0, 0, 0)
      const key = orderDate.toISOString().slice(0, 10)
      const bucket = bucketMap.get(key)
      if (bucket) {
        bucket.amount += Number(order.sellerTotal || 0)
      }
    })

    return buckets
  }, [orders, revenueRange])

  const displayRevenueSeries = useMemo(() => {
    const source = [...revenueSeries]
    if (Number(revenueRange) !== 30) {
      return source
    }

    const grouped = []
    for (let index = 0; index < source.length; index += 3) {
      const chunk = source.slice(index, index + 3)
      if (chunk.length === 0) continue

      grouped.push({
        key: chunk[0].key,
        label: `${chunk[0].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${chunk[chunk.length - 1].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
        amount: chunk.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
      })
    }

    return grouped
  }, [revenueSeries, revenueRange])

  const revenueTotal = useMemo(
    () => revenueSeries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
    [revenueSeries]
  )

  const maxRevenue = useMemo(
    () => Math.max(1, ...displayRevenueSeries.map((entry) => Number(entry.amount || 0))),
    [displayRevenueSeries]
  )

  const notifications = useMemo(() => {
    const pendingOrders = (orders || []).filter((order) =>
      (order.sellerItems || []).some((item) => String(item.fulfillmentStatus || '').toLowerCase() === 'processing')
    )

    const pendingReturns = visibleReturns.filter((entry) => String(entry.status || '').toLowerCase() === 'requested')

    return [
      ...pendingOrders.slice(0, 3).map((order) => ({
        title: `Order ${String(order._id || '').slice(-6).toUpperCase()}`,
        message: 'Has items waiting to be shipped.',
        tone: 'warning',
        action: () => setActiveSection('orders-to-fulfill'),
      })),
      ...pendingReturns.slice(0, 3).map((entry) => ({
        title: `Return request for ${entry.product?.name || 'product'}`,
        message: 'Needs seller review.',
        tone: 'info',
        action: () => setActiveSection('returns'),
      })),
      ...lowStockProducts.slice(0, 2).map((product) => ({
        title: product.name,
        message: `Only ${Number(product.stock || 0)} left in stock.`,
        tone: 'danger',
        action: () => setActiveSection('my-products'),
      })),
    ].slice(0, 6)
  }, [orders, visibleReturns, lowStockProducts])

  const dashboardTasks = useMemo(
    () => [
      {
        text: `Fulfill ${Math.max(1, stats.pendingItems)} processing item(s)`,
        time: 'Open orders to ship them',
        icon: AlertCircle,
        bg: '#fee2e2',
        color: '#b91c1c',
        action: () => setActiveSection('orders-to-fulfill'),
      },
      {
        text: `Low stock on ${lowStockProducts.length} product(s)`,
        time: 'Review inventory',
        icon: Clock,
        bg: '#fef3c7',
        color: '#a16207',
        action: () => setActiveSection('my-products'),
      },
      {
        text: `Handle ${visibleReturns.filter((ret) => ret.status === 'requested').length} return request(s)`,
        time: 'Approve or reject returns',
        icon: RotateCcw,
        bg: '#dbeafe',
        color: '#1d4ed8',
        action: () => setActiveSection('returns'),
      },
      {
        text: 'Review current promotions for this week',
        time: 'Update offers',
        icon: Tags,
        bg: '#ede9fe',
        color: '#6d28d9',
        action: () => setActiveSection('promotions'),
      },
    ],
    [stats.pendingItems, lowStockProducts.length, visibleReturns]
  )

  const recentOrders = useMemo(
    () =>
      (orders || []).slice(0, 6).map((order) => {
        const firstItem = (order.sellerItems || [])[0]
        const status = String(firstItem?.fulfillmentStatus || order.status || 'pending').toLowerCase()
        return {
          id: `#ORD-${String(order._id || '').slice(-4).toUpperCase()}`,
          product: firstItem?.name || 'Order item',
          status,
          amount: Number(order.sellerTotal || 0),
          order,
        }
      }),
    [orders]
  )

  const filteredProducts = useMemo(() => {
    if (!effectiveProductQuery) return products

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.category,
        product.description,
        product.sku,
        product.brand,
        ...(Object.entries(product.specifications || {}).flatMap(([key, value]) => [key, value])),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(effectiveProductQuery)
    })
  }, [products, effectiveProductQuery])

  const filteredRecentOrders = useMemo(() => {
    if (!dashboardQuery) return recentOrders

    return recentOrders.filter((entry) => {
      const orderText = [
        entry.id,
        entry.product,
        entry.status,
        entry.order?.customer?.name,
        entry.order?.customer?.email,
        entry.order?._id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return orderText.includes(dashboardQuery)
    })
  }, [recentOrders, dashboardQuery])

  const filteredOrdersToFulfill = useMemo(() => {
    if (!dashboardQuery) return orders

    return (orders || []).filter((order) => {
      const orderText = [
        order._id,
        order.status,
        order.customer?.name,
        order.customer?.email,
        order.address?.city,
        order.address?.state,
        ...(order.sellerItems || []).flatMap((item) => [item.name, item.fulfillmentStatus]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return orderText.includes(dashboardQuery)
    })
  }, [orders, dashboardQuery])

  const dashboardStats = useMemo(
    () => [
      { label: 'Total Revenue', value: `₹${revenueTotal.toLocaleString('en-IN')}`, trend: `Last ${revenueSeries.length} days`, up: true, icon: TrendingUp },
      { label: 'Orders to Fulfill', value: String(stats.pendingItems), trend: stats.pendingItems > 0 ? 'Needs action' : 'On track', alert: true, icon: Truck },
      { label: 'Active Products', value: String(products.length), trend: `+${Math.min(products.length, 4)} this week`, up: true, icon: Package },
      { label: 'Unread Messages', value: String(notifications.length), trend: notifications.length > 0 ? `${Math.max(1, Math.min(3, notifications.length))} urgent` : 'No alerts', alert: true, icon: Bell },
    ],
    [stats, products.length, revenueSeries.length, revenueTotal, notifications.length]
  )

  const resetForm = () => {
    setEditingId('')
    setForm(EMPTY_FORM)
  }

  const applyHeaderSearch = () => {
    const nextQuery = String(dashboardSearchInput || '').trim()
    setDashboardSearch(nextQuery)
    setProductSearch(nextQuery)
    if (nextQuery) {
      setActiveSection('my-products')
    }
  }

  const clearHeaderSearch = () => {
    setDashboardSearch('')
    setDashboardSearchInput('')
    setProductSearch('')
  }

  const handleEdit = (product) => {
    setActiveSection('add-product')
    setEditingId(product._id)
    setForm({
      name: product.name || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || '',
      stock: product.stock || '',
      description: product.description || '',
      images: product.images?.join(', ') || '',
      specificationsText: Object.entries(product.specifications || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n'),
      returnable: Boolean(product.returnable),
      returnWindow: String(product.returnWindow || '7'),
      replaceable: Boolean(product.replaceable),
    })
  }

  const handleSaveProduct = async () => {
    if (!form.name || !form.category || form.price === '' || form.stock === '') {
      toast.error('Name, category, price and stock are required')
      return
    }

    const imagesRaw = String(form.images || '').trim()
    const parsedImages = imagesRaw
      ? (imagesRaw.includes('\n')
        ? imagesRaw.split(/\r?\n/).map((img) => img.trim()).filter(Boolean)
        : [imagesRaw])
      : []

    const specifications = String(form.specificationsText || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce((acc, line) => {
        const [rawKey, ...rest] = line.split(':')
        const key = String(rawKey || '').trim()
        const value = rest.join(':').trim()
        if (key && value) {
          acc[key] = value
        }
        return acc
      }, {})

    setSaving(true)
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || 0,
      stock: Number(form.stock),
      images: parsedImages,
      specifications,
      returnable: Boolean(form.returnable),
      returnWindow: Math.max(1, Math.min(90, Number(form.returnWindow) || 7)),
      replaceable: Boolean(form.replaceable),
    }

    try {
      if (editingId) {
        const { data } = await updateSellerProduct(editingId, payload)
        setProducts((prev) => prev.map((product) => (product._id === editingId ? data : product)))
        toast.success('Product updated')
      } else {
        const { data } = await createSellerProduct(payload)
        setProducts((prev) => [data, ...prev])
        toast.success('Product added')
      }
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return

    try {
      await deleteSellerProduct(id)
      setProducts((prev) => prev.filter((product) => product._id !== id))
      toast.success('Product deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleShipItem = async (orderId, productId) => {
    try {
      await shipSellerOrderItem(orderId, productId)
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order
          return {
            ...order,
            sellerItems: (order.sellerItems || []).map((item) =>
              String(item.product) === String(productId) ? { ...item, fulfillmentStatus: 'shipped' } : item
            ),
          }
        })
      )
      toast.success('Item marked as shipped')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update shipment')
    }
  }

  const handleReturnUpdate = async (orderId, productId, status) => {
    try {
      await updateSellerReturnRequest(orderId, productId, status)
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order
          return {
            ...order,
            sellerItems: (order.sellerItems || []).map((item) => {
              if (String(item.product) !== String(productId)) return item
              return {
                ...item,
                returnStatus: status,
                returnRequested: status === 'approved',
              }
            }),
          }
        })
      )

      setReturns((prev) =>
        (prev || []).map((entry) => {
          const entryOrderId = String(entry?.order?._id || entry?.order || '')
          const entryProductId = String(entry?.product?._id || entry?.product || '')
          if (entryOrderId !== String(orderId) || entryProductId !== String(productId)) {
            return entry
          }

          if (status === 'completed') {
            return { ...entry, status: 'received' }
          }

          return { ...entry, status }
        })
      )

      toast.success(`Return ${status}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update return request')
    }
  }

  const handleShipAllProcessing = async (order) => {
    const processingItems = (order.sellerItems || []).filter(
      (item) => String(item.fulfillmentStatus || '').toLowerCase() === 'processing'
    )

    if (processingItems.length === 0) {
      toast('No processing items to ship')
      return
    }

    try {
      await Promise.all(
        processingItems.map((item) => shipSellerOrderItem(order._id, item.product))
      )

      setOrders((prev) =>
        prev.map((entry) => {
          if (entry._id !== order._id) return entry
          return {
            ...entry,
            sellerItems: (entry.sellerItems || []).map((item) =>
              String(item.fulfillmentStatus || '').toLowerCase() === 'processing'
                ? { ...item, fulfillmentStatus: 'shipped' }
                : item
            ),
            status: 'shipped',
          }
        })
      )

      toast.success(`${processingItems.length} item(s) marked shipped`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk shipment failed')
    }
  }

  const handleDeliverItem = async (orderId, productId) => {
    try {
      await deliverSellerOrderItem(orderId, productId)
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order
          const nextSellerItems = (order.sellerItems || []).map((item) =>
            String(item.product) === String(productId)
              ? { ...item, fulfillmentStatus: 'delivered', deliveryDate: new Date().toISOString() }
              : item
          )
          const allSellerItemsDelivered = nextSellerItems.every(
            (item) => String(item.fulfillmentStatus || '').toLowerCase() === 'delivered'
          )
          return {
            ...order,
            sellerItems: nextSellerItems,
            status: allSellerItemsDelivered ? 'delivered' : order.status,
          }
        })
      )
      toast.success('Item marked as delivered')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark delivered')
    }
  }

  const handleAddReadyProducts = async () => {
    if (saving) return

    setSaving(true)
    try {
      const responses = await Promise.all(
        READY_PRODUCTS.map((product) => createSellerProduct(product))
      )

      const created = responses.map((entry) => entry.data).filter(Boolean)
      setProducts((prev) => [...created, ...prev])
      toast.success(`${created.length} products added with details and photos`)
      setActiveSection('my-products')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add ready products')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationClick = (notification) => {
    setShowNotifications(false)
    notification.action?.()
  }

  return (
    <div className="flex min-h-screen pt-16">
      <aside
        className="w-72 flex-shrink-0 border-r flex flex-col"
        style={{ background: SELLER_THEME.sidebarBg, borderColor: SELLER_THEME.panelBorder }}
      >
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: SELLER_THEME.panelBorder }}>
          <h1
            className="text-3xl font-black tracking-tight leading-none m-0"
            style={{ color: SELLER_THEME.accent, transform: 'translateY(8px)' }}
          >
            Nexus<span className="text-gray-900">Seller</span>
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {SELLER_NAV.map((item) => {
            const isActive = activeSection === item.key
            const Icon = item.icon
            return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive ? 'text-indigo-700' : 'text-slate-700'
              }`}
              style={{
                background: isActive ? SELLER_THEME.accentSoft : 'transparent',
                border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
              }}
            >
              <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
              {item.label}
            </button>
            )
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: SELLER_THEME.panelBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-indigo-700 font-bold" style={{ background: SELLER_THEME.accentSoft }}>S</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Store Owner</p>
              <p className="text-xs truncate" style={{ color: SELLER_THEME.textMuted }}>seller@nexus.com</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: SELLER_THEME.pageBg }}>
        <header className="h-16 border-b flex items-center justify-between px-6 lg:px-8 z-10 flex-shrink-0"
          style={{ background: '#fbfdff', borderColor: SELLER_THEME.panelBorder }}>
          <div className="flex-1 flex items-center">
            <form
              className="max-w-xl w-full flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                applyHeaderSearch()
              }}
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-indigo-500" />
                </div>
                <input
                  type="text"
                  value={dashboardSearchInput}
                  onChange={(event) => setDashboardSearchInput(event.target.value)}
                  placeholder="Search products, orders, customers..."
                  className="block w-full pl-10 pr-3 py-2 border rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  style={{ borderColor: SELLER_THEME.panelBorder, background: '#ffffff' }}
                  aria-label="Search seller data"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 text-xs font-bold rounded-xl transition-colors hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: '2px solid #1e3a8a',
                  boxShadow: '2px 2px 0 #1e3a8a',
                }}
              >
                Search
              </button>
              {(dashboardSearchInput || dashboardSearch) && (
                <button
                  type="button"
                  onClick={clearHeaderSearch}
                  className="py-2 px-3 text-xs font-semibold rounded-xl"
                  style={{ background: '#eef2ff', color: '#3730a3', border: '1px solid #c7d2fe' }}
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          <div className="ml-4 flex items-center gap-4 relative">
            <button
              className="text-gray-400 hover:text-gray-500 relative p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="button"
              onClick={() => setShowNotifications((open) => !open)}
              aria-label="Toggle notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] z-20 overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: SELLER_THEME.panelBorder }}>
                  <div>
                    <p className="font-black uppercase text-sm">Notifications</p>
                    <p className="text-xs text-gray-500">Seller activity and alerts</p>
                  </div>
                  <span className="text-xs font-black px-2 py-1 rounded-full" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                    {notifications.length}
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500">No new alerts.</div>
                  ) : (
                    notifications.map((notification, index) => (
                      <button
                        key={`${notification.title}-${index}`}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full text-left px-4 py-3 border-b hover:bg-indigo-50 transition-colors"
                        style={{ borderColor: '#eef2ff' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-sm text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          </div>
                          <span
                            className="text-[10px] font-black uppercase px-2 py-1 rounded-full"
                            style={{
                              background:
                                notification.tone === 'danger'
                                  ? '#fee2e2'
                                  : notification.tone === 'warning'
                                    ? '#fef3c7'
                                    : '#dbeafe',
                              color:
                                notification.tone === 'danger'
                                  ? '#991b1b'
                                  : notification.tone === 'warning'
                                    ? '#92400e'
                                    : '#1d4ed8',
                            }}
                          >
                            Open
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {activeSection !== 'dashboard' && (
        <div>
          <h1 className="font-display text-4xl uppercase">Seller Dashboard</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Manage your products and fulfill incoming orders.</p>
        </div>
      )}

      {activeSection === 'dashboard' && (
      <section id="dashboard" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Your store's performance at a glance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="surface p-5 flex flex-col" style={{ background: '#ffffff' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: '#4f46e5' }}>
                    <Icon size={20} />
                  </div>
                  {stat.alert ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      {stat.trend}
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                  <p className="text-3xl font-black mt-1">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 surface p-6" style={{ background: '#ffffff' }}>
            <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
              <h3 className="font-display text-2xl uppercase">Revenue</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Range</label>
                <select
                  value={revenueRange}
                  onChange={(event) => setRevenueRange(event.target.value)}
                  className="text-sm rounded-md py-1 pl-2 pr-6"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>
            </div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--text-secondary)' }}>Collected revenue</p>
                <p className="text-3xl font-black">₹{revenueTotal.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{displayRevenueSeries.length} bar view</p>
            </div>
            <div
              className="h-64 mt-4 grid gap-2 items-end rounded-2xl p-3"
              style={{
                background: 'var(--bg-elevated)',
                border: '2px dashed #000',
                gridTemplateColumns: `repeat(${displayRevenueSeries.length}, minmax(0, 1fr))`,
              }}
            >
              {displayRevenueSeries.map((entry, index) => {
                const height = Math.max(8, (entry.amount / maxRevenue) * 100)
                return (
                  <div key={`${entry.key}-${index}`} className="flex h-full flex-col items-center justify-end gap-2 group">
                    <div className="relative flex h-full w-full items-end justify-center">
                      <div
                        title={`₹${Number(entry.amount || 0).toLocaleString('en-IN')}`}
                        className="w-full max-w-14 rounded-t-lg border-2 border-black shadow-[3px_3px_0_0_#000] transition-all duration-200 group-hover:-translate-y-1"
                        style={{
                          height: `${height}%`,
                          minHeight: '16px',
                          background:
                            'linear-gradient(180deg, #7c3aed 0%, #4f46e5 45%, #22d3ee 100%)',
                        }}
                      />
                      {entry.amount > 0 && (
                        <span className="absolute -top-6 text-[10px] font-black whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                          ₹{Number(entry.amount).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>{entry.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>Chart is based on actual seller order totals.</span>
              <span>Tap bars for value hover.</span>
            </div>
          </div>

          <div className="surface p-6 flex flex-col" style={{ background: '#ffffff' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl uppercase">Tasks</h3>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {dashboardTasks.map((task) => {
                const Icon = task.icon
                return (
                  <button key={task.text} type="button" onClick={task.action} className="group flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer text-left"
                    style={{ border: '2px solid #000', background: SELLER_THEME.accentHover }}>
                    <div className="p-2 rounded-lg" style={{ background: task.bg, color: task.color, border: '1px solid #000' }}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{task.text}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{task.time}</p>
                    </div>
                    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="surface overflow-hidden" style={{ background: '#ffffff' }}>
          <div className="px-6 py-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-display text-xl uppercase">Recent Orders</h3>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700" type="button" onClick={() => setActiveSection('orders-to-fulfill')}>
              View All Orders
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentOrders.map((entry) => {
                  const status = entry.status
                  const badgeClass =
                    status === 'processing' || status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'

                  return (
                    <tr key={entry.order?._id || entry.id} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{entry.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>{entry.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">₹{entry.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="hover:opacity-70" style={{ color: 'var(--text-secondary)' }} type="button">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {filteredRecentOrders.length === 0 && (
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-6 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }} colSpan={5}>
                      {dashboardQuery ? 'No matching orders found.' : 'No orders found yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {activeSection === 'add-product' && (
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="surface p-5">
          <div className="text-xs uppercase font-black mb-1">Products</div>
          <div className="text-3xl font-black">{stats.totalProducts}</div>
        </div>
        <div className="surface p-5">
          <div className="text-xs uppercase font-black mb-1">Items To Ship</div>
          <div className="text-3xl font-black">{stats.pendingItems}</div>
        </div>
        <div className="surface p-5">
          <div className="text-xs uppercase font-black mb-1">Order Value</div>
          <div className="text-3xl font-black">₹{stats.revenue.toLocaleString()}</div>
        </div>
      </div>
      )}

      {activeSection === 'add-product' && (
      <section className="surface p-6">
        <h2 className="font-display text-2xl uppercase mb-4">Low Stock Alerts</h2>
        {lowStockProducts.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No low-stock products right now.</div>
        ) : (
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div key={`low-stock-${product._id}`} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#fff7ed', border: '2px solid #f97316' }}>
                <span className="font-semibold">{product.name}</span>
                <span className="text-xs font-bold" style={{ color: '#c2410c' }}>
                  Only {Number(product.stock || 0)} left
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {activeSection === 'add-product' && (
      <section id="add-product" className="surface p-6">
        <h2 className="font-display text-2xl uppercase mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Product name"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#fff', border: '2px solid #000' }} />
          <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#fff', border: '2px solid #000' }}>
            <option value="">Select category</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="Price"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#fff', border: '2px solid #000' }} />
          <input type="number" value={form.originalPrice} onChange={(e) => setForm((prev) => ({ ...prev, originalPrice: e.target.value }))} placeholder="Original price"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#fff', border: '2px solid #000' }} />
          <input type="number" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} placeholder="Stock"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#fff', border: '2px solid #000' }} />
          <textarea value={form.images} onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))} placeholder="Image URL (or one URL per line)"
            rows={2}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ background: '#fff', border: '2px solid #000' }} />
        </div>
        <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3}
          placeholder="Description"
          className="w-full mt-4 px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#fff', border: '2px solid #000' }} />

        <textarea
          value={form.specificationsText}
          onChange={(e) => setForm((prev) => ({ ...prev, specificationsText: e.target.value }))}
          rows={4}
          placeholder={"Specifications (one per line)\nWeight: 25kg\nGrain Type: Medium"}
          className="w-full mt-4 px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: '#fff', border: '2px solid #000' }}
        />

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#fff', border: '2px solid #000' }}>
            <input
              type="checkbox"
              checked={form.returnable}
              onChange={(e) => setForm((prev) => ({ ...prev, returnable: e.target.checked }))}
            />
            <span className="text-sm font-semibold">Allow Returns</span>
          </label>
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#fff', border: '2px solid #000' }}>
            <input
              type="checkbox"
              checked={form.replaceable}
              onChange={(e) => setForm((prev) => ({ ...prev, replaceable: e.target.checked }))}
            />
            <span className="text-sm font-semibold">Allow Replacements</span>
          </label>
        </div>

        {form.returnable && (
          <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: '#fff', border: '2px solid #000' }}>
            <label className="text-sm font-semibold block mb-2">Return Window (Days)</label>
            <input
              type="number"
              min="1"
              max="90"
              value={form.returnWindow}
              onChange={(e) => setForm((prev) => ({ ...prev, returnWindow: String(e.target.value) }))}
              placeholder="Number of days to allow returns"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#f4f4f0', border: '2px solid #000' }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Buyers can request returns within this many days from delivery date (1-90 days)
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button onClick={handleSaveProduct} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
          </button>
          {!editingId && (
            <button onClick={handleAddReadyProducts} disabled={saving} className="btn-outline">
              {saving ? 'Adding...' : 'Add Ready Products'}
            </button>
          )}
          {editingId && <button onClick={resetForm} className="btn-outline">Cancel</button>}
        </div>
      </section>
      )}

      {activeSection === 'my-products' && (
      <section id="my-products" className="surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-2xl uppercase">My Products</h2>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
            <input
              type="text"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search your products..."
              className="w-full pl-10 pr-16 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}
            />
            {productSearch && (
              <button
                type="button"
                onClick={() => setProductSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: '#eef2ff', color: '#4338ca' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {effectiveProductQuery ? `No products match "${activeProductSearchTerm}".` : 'No products yet.'}
          </div>
        ) : (
          <>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div className="grid md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-black rounded-xl p-4 shadow-[6px_6px_0_0_#000]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-lg uppercase">{product.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{product.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xl">₹{Number(product.price || 0).toLocaleString('en-IN')}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Stock: {product.stock}</div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <div className="px-2 py-1 rounded-lg font-semibold mb-1" style={{ background: product.returnable ? '#dcfce7' : '#fee2e2', color: product.returnable ? '#166534' : '#991b1b', border: '2px solid #000' }}>
                      {product.returnable ? 'Return: Enabled' : 'Return: Disabled'}
                    </div>
                    {product.returnable && (
                      <div className="px-2 py-1 rounded-lg" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#d97706', border: '2px solid #000' }}>
                        Window: {product.returnWindow || 7} days
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1 rounded-lg font-semibold" style={{ background: product.replaceable ? '#dbeafe' : '#e5e7eb', color: product.replaceable ? '#1e40af' : '#374151', border: '2px solid #000' }}>
                    {product.replaceable ? 'Replace: Enabled' : 'Replace: Disabled'}
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '2px solid #000', boxShadow: '3px 3px 0 #000' }}>
                  <div className="text-xs font-black uppercase mb-2">Latest Reviews</div>
                  {(product.reviews || []).length === 0 ? (
                    <div className="text-xs" style={{ color: '#6b7280' }}>No reviews yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {(product.reviews || []).slice(0, 3).map((review, reviewIndex) => (
                        <div key={`${product._id}-review-${reviewIndex}`} className="text-xs">
                          <span className="font-bold">{review.name || 'Customer'}</span>
                          <span> • {review.rating}/5</span>
                          <div style={{ color: '#374151' }}>{review.comment || 'No comment provided.'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(product)} className="btn-outline py-2 px-4">Edit</button>
                  <button onClick={() => handleDelete(product._id)} className="py-2 px-4 rounded-xl font-bold"
                    style={{ background: '#fff', border: '3px solid #000', color: '#ef4444' }}>
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          </>
        )}
        
      </section>
      )}

      {activeSection === 'orders-to-fulfill' && (
      <section id="orders-to-fulfill" className="surface p-6">
        <h2 className="font-display text-2xl uppercase mb-4">Orders To Fulfill</h2>
        {loading ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        ) : filteredOrdersToFulfill.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {dashboardQuery ? 'No orders match your search.' : 'No seller orders yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrdersToFulfill.map((order) => (
              <div key={order._id} className="bg-white border-4 border-black rounded-xl p-4 shadow-[6px_6px_0_0_#000]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="font-black">Order #{order._id}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')} • {order.customer?.name} ({order.customer?.email})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black">₹{Number(order.sellerTotal || 0).toLocaleString()}</div>
                    <div className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{order.status}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <button onClick={() => handleShipAllProcessing(order)} className="btn-outline py-2 px-4 text-xs font-bold">
                    Ship All Processing Items
                  </button>
                </div>

                <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ship To</div>
                  <div>{order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}</div>
                  <div>Phone: {order.address?.phone}</div>
                </div>

                <div className="space-y-2">
                  {(order.sellerItems || []).map((item) => (
                    <div key={`${order._id}-${item.product}`} className="flex flex-wrap items-center justify-between gap-2 border-t pt-2" style={{ borderColor: '#ddd' }}>
                      <div className="flex items-center gap-2">
                        <Package size={14} />
                        <span>{item.name} x {item.qty}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold">₹{Number(item.price * item.qty).toLocaleString()}</span>
                        {item.fulfillmentStatus === 'delivered' ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>
                            Delivered
                          </span>
                        ) : item.fulfillmentStatus === 'shipped' ? (
                          <button onClick={() => handleDeliverItem(order._id, item.product)} className="btn-outline py-2 px-4 flex items-center gap-2">
                            <Truck size={14} /> Mark Delivered
                          </button>
                        ) : (
                          <button onClick={() => handleShipItem(order._id, item.product)} className="btn-primary py-2 px-4 flex items-center gap-2">
                            <Truck size={14} /> Ship Item
                          </button>
                        )}

                        {item.returnStatus && item.returnStatus !== 'none' && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full capitalize" style={{ background: '#fef3c7', color: '#92400e' }}>
                            Return: {item.returnStatus}
                          </span>
                        )}

                        {item.returnStatus === 'requested' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReturnUpdate(order._id, item.product, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{ background: '#dcfce7', border: '2px solid #166534', color: '#166534' }}
                            >
                              Approve Return
                            </button>
                            <button
                              onClick={() => handleReturnUpdate(order._id, item.product, 'rejected')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{ background: '#fee2e2', border: '2px solid #b91c1c', color: '#991b1b' }}
                            >
                              Reject Return
                            </button>
                          </div>
                        )}

                        {item.returnStatus === 'approved' && (
                          <button
                            onClick={() => handleReturnUpdate(order._id, item.product, 'completed')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{ background: '#dbeafe', border: '2px solid #1d4ed8', color: '#1e40af' }}
                          >
                            Mark Return Completed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {activeSection === 'analytics' && (
      <section id="analytics" className="surface p-6">
        <h2 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
          <TrendingUp size={28} /> Performance Analytics
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0_#000]">
            <div className="text-xs uppercase font-black mb-2">Total Sales</div>
            <div className="text-3xl font-black">₹{orders.reduce((sum, o) => sum + (o.sellerTotal || 0), 0).toLocaleString()}</div>
          </div>
          <div className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0_#000]">
            <div className="text-xs uppercase font-black mb-2">Total Orders</div>
            <div className="text-3xl font-black">{orders.length}</div>
          </div>
          <div className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0_#000]">
            <div className="text-xs uppercase font-black mb-2">Total Products</div>
            <div className="text-3xl font-black">{products.length}</div>
          </div>
          <div className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0_#000]">
            <div className="text-xs uppercase font-black mb-2">Pending Returns</div>
            <div className="text-3xl font-black">{visibleReturns.filter(r => r.status === 'requested').length}</div>
          </div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm" style={{ color: '#1e40af' }}>
            <strong>Advanced Analytics</strong> including charts, trends, and customer insights are coming soon!
          </p>
        </div>
      </section>
      )}

      {activeSection === 'promotions' && (
      <section id="promotions">
        <PromotionsPanel isAdmin={false} />
      </section>
      )}

      {activeSection === 'returns' && (
      <section id="returns" className="surface p-6">
        <h2 className="font-display text-2xl uppercase mb-4">Returns Management</h2>
        {loading ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        ) : visibleReturns.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No returns yet.</div>
        ) : (
          <div className="space-y-4">
            {visibleReturns.map((ret) => (
              <div key={ret._id} className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0_#000]">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div>
                    <div className="font-black">{ret.product?.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Order: {ret.order._id}</div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    ret.status === 'requested' ? 'bg-yellow-200 border-2 border-yellow-600' :
                    ret.status === 'approved' ? 'bg-blue-200 border-2 border-blue-600' :
                    ret.status === 'rejected' ? 'bg-red-200 border-2 border-red-600' :
                    'bg-green-200 border-2 border-green-600'
                  }`}>
                    {ret.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 mb-3 text-sm">
                  <div><strong>Customer:</strong> {ret.user?.name}</div>
                  <div><strong>Reason:</strong> {ret.reason}</div>
                  <div><strong>Refund Amount:</strong> ₹{ret.refundAmount}</div>
                  <div><strong>Date Requested:</strong> {new Date(ret.requestedAt).toLocaleDateString()}</div>
                </div>
                {ret.description && (
                  <div className="mb-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}>
                    <strong className="text-sm">Customer Message:</strong>
                    <p className="text-sm mt-1">{ret.description}</p>
                  </div>
                )}

                {ret.status === 'requested' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleReturnUpdate(
                          ret.order?._id || ret.order,
                          ret.product?._id || ret.product,
                          'approved'
                        )
                      }
                      className="px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: '#dcfce7', border: '2px solid #166534', color: '#166534' }}
                    >
                      Approve Return
                    </button>
                    <button
                      onClick={() =>
                        handleReturnUpdate(
                          ret.order?._id || ret.order,
                          ret.product?._id || ret.product,
                          'rejected'
                        )
                      }
                      className="px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: '#fee2e2', border: '2px solid #b91c1c', color: '#991b1b' }}
                    >
                      Reject Return
                    </button>
                  </div>
                )}

                {ret.status === 'approved' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleReturnUpdate(
                          ret.order?._id || ret.order,
                          ret.product?._id || ret.product,
                          'completed'
                        )
                      }
                      className="px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: '#dbeafe', border: '2px solid #1d4ed8', color: '#1e40af' }}
                    >
                      Mark Return Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      )}
        </div>
        </div>
      </main>
    </div>
  )
}
