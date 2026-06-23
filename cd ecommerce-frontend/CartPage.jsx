import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { removeFromCart, updateQty, clearCart, setCartPromotion, clearCartPromotion } from './cartSlice.js'
import { getActivePromotions, validatePromoCode } from './api.js'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, promotion } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [activePromotions, setActivePromotions] = useState([])
  const [promoLoading, setPromoLoading] = useState(false)

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0)
  const delivery = subtotal >= 499 ? 0 : 49
  const discount = Number(promotion?.discount || 0)
  const totalBeforeDiscount = subtotal + delivery
  const total = Math.max(0, totalBeforeDiscount - discount)

  useEffect(() => {
    getActivePromotions()
      .then((res) => setActivePromotions(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActivePromotions([]))
  }, [])

  useEffect(() => {
    if (promotion?.code) {
      setCouponCode(promotion.code)
    }
  }, [promotion?.code])

  const handleApplyCoupon = async (overrideCode) => {
    const codeToApply = String(overrideCode || couponCode || '').trim().toUpperCase()
    if (!codeToApply) {
      toast.error('Enter a promo code')
      return
    }

    try {
      setPromoLoading(true)
      const selectedPromo = activePromotions.find((p) => String(p.code || '').toUpperCase() === codeToApply)
      const { data } = await validatePromoCode(codeToApply, subtotal)

      const safeDiscount = Math.min(Math.max(0, Number(data?.discount || 0)), totalBeforeDiscount)
      dispatch(setCartPromotion({
        code: codeToApply,
        type: selectedPromo?.type || data?.promotion?.type,
        discountValue: selectedPromo?.discountValue || data?.promotion?.discountValue,
        maxDiscount: selectedPromo?.maxDiscount ?? null,
        discount: safeDiscount,
      }))
      setCouponCode(codeToApply)
      toast.success(`Promo applied: -₹${safeDiscount.toLocaleString('en-IN')}`)
    } catch (err) {
      dispatch(clearCartPromotion())
      toast.error(err.response?.data?.message || 'Invalid promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="pt-20 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <ShoppingBag size={40} style={{ color: 'var(--text-secondary)' }} />
      </div>
      <h2 className="font-display font-bold text-2xl mb-2">Your cart is empty</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Looks like you haven't added anything yet</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl">Your Cart</h1>
        <button onClick={() => dispatch(clearCart())}
          className="text-sm flex items-center gap-1.5 transition-colors hover:text-red-400"
          style={{ color: 'var(--text-secondary)' }}>
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="glass p-4 flex gap-4">
                <img
                  src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/120/120`}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: 'var(--accent)' }}>{item.category}</p>
                  <h3 className="font-medium text-sm leading-snug mb-1 truncate">{item.name}</h3>
                  <p className="font-bold">₹{item.price?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <button onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-xs transition-colors hover:text-red-400"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <button onClick={() => dispatch(updateQty({ id: item._id, qty: Math.max(1, item.qty - 1) }))}>
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                    <button onClick={() => dispatch(updateQty({ id: item._id, qty: item.qty + 1 }))}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="glass p-6 h-fit sticky top-24">
          <h2 className="font-semibold mb-5 text-lg">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({items.length} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
              <span style={{ color: delivery === 0 ? '#22c55e' : 'inherit' }}>
                {delivery === 0 ? 'FREE' : `₹${delivery}`}
              </span>
            </div>
            {delivery > 0 && (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Add ₹{(499 - subtotal).toLocaleString('en-IN')} more for free delivery
              </p>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span style={{ color: '#16a34a' }}>Promotion ({promotion?.code || 'Applied'})</span>
                <span style={{ color: '#16a34a' }}>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-3 border-t flex justify-between font-bold text-base"
              style={{ borderColor: 'var(--border)' }}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="mt-4 flex gap-2">
            <input placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => handleApplyCoupon()}
              disabled={promoLoading}
              className="btn-outline text-sm py-2 px-3"
            >
              {promoLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {activePromotions.length > 0 && (
            <div className="mt-4 rounded-lg p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>Available Promotions</p>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {activePromotions.map((promo) => (
                  <div key={promo._id} className="text-xs rounded-lg p-2" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{promo.name}</p>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          {promo.type === 'percentage' ? `${promo.discountValue}% OFF` : `₹${Number(promo.discountValue || 0).toLocaleString('en-IN')} OFF`}
                          {promo.minOrderValue ? ` • Min ₹${Number(promo.minOrderValue).toLocaleString('en-IN')}` : ''}
                        </p>
                        {promo.code ? (
                          <p className="font-bold mt-1">Code: {promo.code}</p>
                        ) : (
                          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>No code set by seller</p>
                        )}
                      </div>
                      {promo.code && (
                        <button
                          onClick={() => handleApplyCoupon(promo.code)}
                          className="text-[11px] px-2 py-1 rounded"
                          style={{ background: '#00e5ff', border: '1px solid #000', color: '#000', fontWeight: 700 }}
                        >
                          Use
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => user ? navigate('/checkout') : navigate('/login')}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2 py-3.5">
            {user ? 'Proceed to Checkout' : 'Login to Checkout'} <ArrowRight size={16} />
          </button>
          <Link
            to="/products"
            className="btn-outline w-full mt-3 flex items-center justify-center gap-2 py-3.5"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}