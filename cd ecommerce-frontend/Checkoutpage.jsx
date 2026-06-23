import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, CreditCard, CheckCircle, Lock } from 'lucide-react'
import { createPaymentIntent, placeOrder } from './api.js'
import { clearCart } from './cartSlice.js'
import toast from 'react-hot-toast'

const STEPS = ['Address', 'Payment', 'Confirm']

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}
function formatExpiry(val) {
  const cleaned = val.replace(/\D/g, '').slice(0, 4)
  return cleaned.length >= 3 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2) : cleaned
}

function MockCardForm({ totalAmount, onPaymentReady, onPaymentError }) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [processing, setProcessing] = useState(false)

  const handlePay = async () => {
    const rawNumber = cardNumber.replace(/\s/g, '')
    if (rawNumber.length < 16) return onPaymentError('Enter a valid 16-digit card number')
    if (expiry.length < 5) return onPaymentError('Enter a valid expiry date (MM/YY)')
    if (cvv.length < 3) return onPaymentError('Enter a valid CVV')
    if (!name.trim()) return onPaymentError('Enter the cardholder name')

    setProcessing(true)
    try {
      const { data } = await createPaymentIntent({ amount: totalAmount })
      onPaymentReady({ paymentIntentId: data.paymentIntentId, paymentMethod: 'card' })
    } catch (err) {
      onPaymentError(err.response?.data?.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: 'var(--accent)' }} />
            <span className="font-medium text-sm">Test Card Payment</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Demo Mode</span>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Card Number</label>
          <input
            value={cardNumber}
            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none tracking-widest"
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Expiry</label>
            <input
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>CVV</label>
            <input
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              type="password"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Name on Card</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Demo: use any 16-digit number, any future expiry, any CVV
        </p>
      </div>

      <button onClick={handlePay} disabled={processing}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        {processing
          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
      </button>
    </div>
  )
}

export default function CheckoutPage() {
  const { items, promotion } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' })
  const [payment, setPayment] = useState('stripe')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0)
  const delivery = subtotal >= 499 ? 0 : 49
  const discount = Number(promotion?.discount || 0)
  const totalBeforeDiscount = subtotal + delivery
  const total = Math.max(0, totalBeforeDiscount - discount)

  const handleOrder = async () => {
    if (!paymentConfirmed || !paymentIntentId) {
      toast.error('Complete the card payment before placing your order', {
        style: { background: 'var(--bg-card)', color: '#ef4444', border: '1px solid #ef444444' }
      })
      return
    }

    setLoading(true)
    try {
      await placeOrder({
        items: items.map(i => ({ product: i._id, name: i.name, qty: i.qty, price: i.price })),
        address,
        paymentMethod: payment,
        stripePaymentIntentId: paymentIntentId,
        promotionCode: promotion?.code || undefined,
        discount,
        totalAmount: total,
      })
      dispatch(clearCart())
      setOrdered(true)
    } catch {
      toast.error('Order failed. Please try again.', {
        style: { background: 'var(--bg-card)', color: '#ef4444', border: '1px solid #ef444444' }
      })
    } finally {
      setLoading(false)
    }
  }

  if (ordered) return (
    <div className="pt-20 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e' }}>
          <CheckCircle size={48} color="#22c55e" />
        </div>
      </motion.div>
      <h2 className="font-display font-bold text-3xl mb-3">Order Placed!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
        Thank you, {user?.name}! Your order is confirmed and will be delivered soon.
      </p>
      <button onClick={() => navigate('/profile/orders')} className="btn-primary">View My Orders</button>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all`}
              style={{
                background: i <= step ? 'var(--accent)' : 'var(--bg-elevated)',
                color: i <= step ? 'white' : 'var(--text-secondary)',
              }}>
              {i + 1}
            </div>
            <span className="text-sm font-medium hidden md:block"
              style={{ color: i === step ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className="w-12 h-0.5 rounded" style={{ background: i < step ? 'var(--accent)' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">

          {/* Step 0: Address */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} style={{ color: 'var(--accent)' }} />
                <h2 className="font-semibold text-lg">Delivery Address</h2>
              </div>
              {['street', 'city', 'state', 'pincode', 'phone'].map(field => (
                <div key={field}>
                  <label className="text-sm font-medium block mb-1.5 capitalize">{field}</label>
                  <input value={address[field]} onChange={e => setAddress({ ...address, [field]: e.target.value })}
                    placeholder={field === 'street' ? 'Street address' : field === 'pincode' ? '6-digit PIN code' : field}
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
              <button onClick={() => setStep(1)} className="btn-primary w-full py-3 mt-2">Continue to Payment</button>
            </motion.div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={18} style={{ color: 'var(--accent)' }} />
                <h2 className="font-semibold text-lg">Card Payment</h2>
              </div>
              <MockCardForm
                totalAmount={total}
                onPaymentReady={({ paymentIntentId: nextId, paymentMethod }) => {
                  setPayment(paymentMethod)
                  setPaymentIntentId(nextId)
                  setPaymentConfirmed(true)
                  toast.success('Payment authorized! Review and place your order.', {
                    style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
                  })
                }}
                onPaymentError={(message) => {
                  setPaymentConfirmed(false)
                  setPaymentIntentId('')
                  toast.error(message, {
                    style: { background: 'var(--bg-card)', color: '#ef4444', border: '1px solid #ef444444' }
                  })
                }}
              />
              {paymentConfirmed && (
                <div className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }}>
                  Payment completed! You can now continue to review your order.
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3">Back</button>
                <button onClick={() => setStep(2)} disabled={!paymentConfirmed}
                  className="btn-primary flex-1 py-3 disabled:opacity-50">Review Order</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6">
              <h2 className="font-semibold text-lg mb-4">Review & Confirm</h2>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/60/60`}
                      className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div className="flex-1 text-sm">
                      <div className="font-medium truncate">{item.name}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Qty: {item.qty}</div>
                    </div>
                    <div className="text-sm font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm p-4 rounded-xl mb-5"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1">Delivery to:</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {address.street}, {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Payment: Test Card</p>
                {promotion?.code && (
                  <p className="mt-1" style={{ color: '#16a34a' }}>
                    Promo: {promotion.code} (−₹{discount.toLocaleString('en-IN')})
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">Back</button>
                <button onClick={handleOrder} disabled={loading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Place Order'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="glass p-5 h-fit sticky top-24 text-sm">
          <h3 className="font-semibold mb-4">Price Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Items ({items.length})</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
              <span style={{ color: delivery === 0 ? '#22c55e' : 'inherit' }}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span style={{ color: '#16a34a' }}>Promotion ({promotion?.code || 'Applied'})</span>
                <span style={{ color: '#16a34a' }}>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-2 border-t flex justify-between font-bold text-base"
              style={{ borderColor: 'var(--border)' }}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}