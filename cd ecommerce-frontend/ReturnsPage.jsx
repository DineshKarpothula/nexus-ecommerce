import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, ArrowLeft } from 'lucide-react'
import { getMyOrders, requestOrderItemReturn, getProductById } from './api.js'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const RETURN_REASONS = [
  { value: 'defective', label: 'Product is defective' },
  { value: 'notAsDescribed', label: 'Product is not as described' },
  { value: 'wrongItem', label: 'Wrong item delivered' },
  { value: 'damageInShipping', label: 'Damaged in shipping' },
  { value: 'other', label: 'Other reason' },
]

export default function ReturnsPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState('')
  const [returningItems, setReturningItems] = useState(new Set())
  const [productDetails, setProductDetails] = useState({})
  const [returnForm, setReturnForm] = useState({ reason: '', description: '' })
  const [returnDraft, setReturnDraft] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    // Fetch product details for ordered items so return rules can be shown correctly.
    const productIds = new Set()
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          productIds.add(item.product)
        })
      }
    })

    productIds.forEach((productId) => {
      if (productId && !productDetails[productId]) {
        getProductById(productId)
          .then((res) => {
            setProductDetails((prev) => ({
              ...prev,
              [productId]: res.data,
            }))
          })
          .catch(() => {
            // Fallback to default return window if product fetch fails
            setProductDetails((prev) => ({
              ...prev,
              [productId]: { returnWindow: 7 },
            }))
          })
      }
    })
  }, [orders])

  const loadOrders = async () => {
    try {
      const { data } = await getMyOrders()
      setOrders(data)
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = (item, order, product) => {
    const deliveryDateValue = item.deliveryDate || order?.updatedAt || order?.createdAt
    if (!deliveryDateValue) return null
    const deliveryDate = new Date(deliveryDateValue)
    const returnWindowDays = product?.returnWindow || 7
    const returnWindowEnd = new Date(deliveryDate.getTime() + returnWindowDays * 24 * 60 * 60 * 1000)
    const now = new Date()
    const daysRemaining = Math.ceil((returnWindowEnd - now) / (24 * 60 * 60 * 1000))
    return Math.max(0, daysRemaining)
  }

  const getItemReturnState = (item, order, product) => {
    const status = String(item.returnStatus || 'none').toLowerCase()
    if (status === 'requested') {
      return { canRequest: false, message: 'Return already requested' }
    }
    if (status === 'approved') {
      return { canRequest: false, message: 'Return approved by seller' }
    }
    if (status === 'completed') {
      return { canRequest: false, message: 'Return completed' }
    }
    if (status === 'rejected') {
      return { canRequest: false, message: 'Previous return request was rejected' }
    }

    if (product && product.returnable === false) {
      return { canRequest: false, message: 'Seller has disabled returns for this product' }
    }

    const itemFulfillmentStatus = String(item.fulfillmentStatus || '').toLowerCase()
    const orderStatus = String(order?.status || '').toLowerCase()
    const delivered = itemFulfillmentStatus === 'delivered' || orderStatus === 'delivered'
    if (!delivered) {
      return { canRequest: false, message: 'You can request return after the order is delivered' }
    }

    const daysRemaining = getDaysRemaining(item, order, product)
    if (daysRemaining !== null && daysRemaining <= 0) {
      return { canRequest: false, message: 'Return window expired' }
    }

    if (daysRemaining === null) {
      return { canRequest: true, message: 'Eligible for return' }
    }

    return { canRequest: true, message: `${daysRemaining} day(s) remaining to request return`, daysRemaining }
  }

  const openReturnRequest = ({ orderId, productId, productName, order, item, product }) => {
    const itemState = getItemReturnState(item, order, product)
    if (!itemState.canRequest) {
      toast.error(itemState.message || 'This item is not eligible for return')
      return
    }

    setReturnDraft({
      orderId,
      productId,
      productName,
      policyMessage: itemState.message,
      returnWindow: product?.returnWindow || 7,
    })
    setReturnForm({ reason: '', description: '' })
  }

  const closeReturnRequest = () => {
    setReturnDraft(null)
    setReturnForm({ reason: '', description: '' })
  }

  const submitReturnRequest = async () => {
    if (!returnDraft) return

    if (!returnForm.reason) {
      toast.error('Please select a return reason')
      return
    }

    const { orderId, productId, productName } = returnDraft
    const reasonLabel = RETURN_REASONS.find((entry) => entry.value === returnForm.reason)?.label || returnForm.reason

    setReturningItems((prev) => new Set([...prev, `${orderId}-${productId}`]))

    try {
      await requestOrderItemReturn(orderId, productId, {
        reason: `${reasonLabel}${returnForm.description ? ` - ${returnForm.description.trim()}` : ''}`,
      })
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order
          return {
            ...order,
            items: (order.items || []).map((item) =>
              String(item.product) === String(productId)
                ? {
                    ...item,
                    returnRequested: true,
                    returnStatus: 'requested',
                    returnReason: `${reasonLabel}${returnForm.description ? ` - ${returnForm.description.trim()}` : ''}`,
                  }
                : item
            ),
          }
        })
      )
      toast.success(`Return request submitted for ${productName}`)
      closeReturnRequest()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request')
    } finally {
      setReturningItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(`${orderId}-${productId}`)
        return newSet
      })
    }
  }

  // Show only items that are eligible now or already have a return request lifecycle.
  const returnableItems = []
  orders.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        const product = productDetails[item.product] || { returnWindow: 7 }
        const itemState = getItemReturnState(item, order, product)
        const returnStatus = String(item.returnStatus || 'none').toLowerCase()
        const shouldShow = itemState.canRequest || ['requested', 'approved', 'rejected', 'completed'].includes(returnStatus)

        if (!shouldShow) {
          return
        }

        returnableItems.push({
          orderId: order._id,
          orderDate: order.createdAt,
          orderStatus: order.status,
          ...item,
        })
      })
    }
  })

  return (
    <div className="pt-24 min-h-screen max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm font-semibold mb-4"
          style={{ color: 'var(--accent)' }}>
          <ArrowLeft size={16} /> Back to Profile
        </button>
        <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Returns & Refunds</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          View and manage returns for your delivered orders
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-32 rounded-2xl" />
          ))}
        </div>
      ) : returnableItems.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl">
          <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <p className="text-lg font-semibold mb-2">No eligible return items</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Only return-eligible items are shown here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(
            returnableItems.reduce((acc, item) => {
              if (!acc[item.orderId]) acc[item.orderId] = []
              acc[item.orderId].push(item)
              return acc
            }, {})
          ).map(([orderId, items]) => {
            const order = orders.find((o) => o._id === orderId)
            return (
              <motion.div key={orderId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '2px solid var(--border)' }}>
                  <div>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>ORDER #{orderId}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(order?.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button onClick={() => setExpandedOrderId(expandedOrderId === orderId ? '' : orderId)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--accent)', border: '2px solid var(--accent)' }}>
                    {expandedOrderId === orderId ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {/* Items */}
                {expandedOrderId === orderId && (
                  <div className="space-y-3">
                    {items.map((item, idx) => {
                      const itemKey = `${orderId}-${item.product}`
                      const isReturning = returningItems.has(itemKey)
                      const product = productDetails[item.product] || { returnWindow: 7 }
                      const itemState = getItemReturnState(item, order, product)

                      return (
                        <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Qty: {item.qty} × ₹{item.price.toLocaleString()} = ₹
                                {(item.qty * item.price).toLocaleString()}
                              </p>
                            </div>
                            {item.returnStatus === 'requested' ? (
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}>
                                Return Requested
                              </span>
                            ) : item.returnStatus === 'approved' ? (
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                                Return Approved
                              </span>
                            ) : item.returnStatus === 'rejected' ? (
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                Return Rejected
                              </span>
                            ) : item.returnStatus === 'completed' ? (
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                                Return Completed
                              </span>
                            ) : null}
                          </div>

                          <p className="text-xs mb-3" style={{ color: itemState.canRequest ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {itemState.message}
                          </p>

                          {!item.returnStatus || item.returnStatus === 'none' ? (
                            <button
                              onClick={() =>
                                openReturnRequest({
                                  orderId,
                                  productId: item.product,
                                  productName: item.name,
                                  order,
                                  item,
                                  product,
                                })
                              }
                              disabled={isReturning || !itemState.canRequest}
                              className="w-full mt-2 font-semibold py-2 px-3 rounded-lg text-sm transition-all"
                              style={{
                                background: isReturning || !itemState.canRequest ? 'var(--bg-card)' : 'var(--accent)',
                                color: isReturning || !itemState.canRequest ? 'var(--text-secondary)' : 'black',
                                border: '2px solid #000',
                                opacity: isReturning || !itemState.canRequest ? 0.5 : 1,
                              }}>
                              {isReturning ? 'Submitting...' : itemState.canRequest ? 'Request Return' : 'Not Eligible Yet'}
                            </button>
                          ) : (
                            <div className="text-xs mt-2">
                              {item.returnReason && (
                                <p className="mb-1">
                                  <strong>Reason:</strong> {item.returnReason}
                                </p>
                              )}
                              {item.returnRequestedAt && (
                                <p style={{ color: 'var(--text-secondary)' }}>
                                  Requested on {new Date(item.returnRequestedAt).toLocaleDateString('en-IN')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {returnDraft && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '3px solid #000', boxShadow: '8px 8px 0 #000' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl uppercase">Request Return</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {returnDraft.productName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReturnRequest}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{ border: '2px solid #000', background: '#fff', color: '#000' }}
              >
                Close
              </button>
            </div>

            <div className="mt-4 p-3 rounded-xl" style={{ background: '#fff7d6', border: '2px solid #000' }}>
              <p className="text-xs font-black uppercase tracking-wide">Return Policy</p>
              <p className="text-sm mt-1">
                {returnDraft.policyMessage || `Eligible for return within ${returnDraft.returnWindow} days from delivery.`}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold block mb-1">Reason for return</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <option value="">Select reason</option>
                  {RETURN_REASONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Additional details (optional)</label>
                <textarea
                  value={returnForm.description}
                  onChange={(e) => setReturnForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  maxLength={300}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  placeholder="Tell us what went wrong so seller can process it faster"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={submitReturnRequest}
                className="flex-1 py-2.5 rounded-lg text-sm font-black uppercase"
                style={{ background: '#ffeb3b', border: '3px solid #000', color: '#000' }}
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={closeReturnRequest}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: '#fff', border: '2px solid #000', color: '#000' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
