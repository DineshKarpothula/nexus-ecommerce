import { useEffect, useState } from 'react'
import Loader from './Loaders.jsx'
import {
  createPromotion,
  getMyPromotions,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
} from './api.js'

export default function PromotionsPanel({ isAdmin = false }) {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const res = isAdmin ? await getActivePromotions() : await getMyPromotions()
      setPromotions(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load promotions')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePromotion = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updatePromotion(editingId, formData)
      } else {
        await createPromotion(formData)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: '',
        type: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
      })
      fetchPromotions()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save promotion')
    }
  }

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm('Delete this promotion?')) {
      try {
        await deletePromotion(promotionId)
        fetchPromotions()
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete promotion')
      }
    }
  }

  if (loading) return <Loader />

  return (
    <div className="surface p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display text-4xl uppercase">Promotions</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Track all live campaign performance' : 'Create and manage your store offers'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
            }}
            className="btn-primary px-5 py-2.5 text-sm uppercase"
          >
            + Create Promotion
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl mb-4 text-sm font-semibold"
          style={{ background: '#fff3cd', border: '3px solid #000', color: '#7a4b00', boxShadow: '3px 3px 0 #000' }}>
          {error}
        </div>
      )}

      {promotions.length === 0 ? (
        <div className="p-10 text-center rounded-2xl"
          style={{ background: '#fff', border: '3px solid #000', boxShadow: '6px 6px 0 #000' }}>
          <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No promotions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <div key={promo._id} className="surface p-5 h-full">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
                  {promo.type}
                </p>
                <span
                  className="text-[10px] font-black uppercase px-2 py-1 rounded"
                  style={{
                    background: promo.isActive ? 'var(--accent-2)' : '#e5e7eb',
                    border: '2px solid #000',
                    color: '#000',
                  }}
                >
                  {promo.isActive ? 'Live' : 'Paused'}
                </span>
              </div>

              <h3 className="font-display text-3xl uppercase leading-none">{promo.name}</h3>

              <p className="mt-3 text-2xl font-black" style={{ color: 'var(--accent)' }}>
                {promo.type === 'percentage'
                  ? `${promo.discountValue}% OFF`
                  : `₹${Number(promo.discountValue || 0).toLocaleString('en-IN')} OFF`}
              </p>

              <div className="mt-4 space-y-1 text-sm">
                <p><span className="font-bold">Code:</span> {promo.code || 'N/A'}</p>
                <p><span className="font-bold">Usage:</span> {promo.usageCount}/{promo.usageLimit || '∞'}</p>
                <p><span className="font-bold">Valid Till:</span> {new Date(promo.endDate).toLocaleDateString('en-IN')}</p>
              </div>

              {!isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(promo._id)
                      setFormData(promo)
                      setShowForm(true)
                    }}
                    className="btn-outline flex-1 text-xs py-2 uppercase"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePromotion(promo._id)}
                    className="flex-1 text-xs py-2 rounded-lg uppercase font-bold"
                    style={{ background: '#fff0f0', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#b91c1c' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && !isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="surface max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="font-display text-3xl uppercase mb-4">{editingId ? 'Edit' : 'Create'} Promotion</h2>
            <form onSubmit={handleSavePromotion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Promotion Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                  required
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                  <option value="bogo">BOGO</option>
                   <option value="freeship">Free Shipping</option>
                </select>
                <input
                  type="number"
                  placeholder={formData.type === 'percentage' ? 'Discount %' : 'Discount Amount'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                  required
                />
                <input
                  type="text"
                  placeholder="Promo Code (Optional)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                />
                <input
                  type="number"
                  placeholder="Min Order Value"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                />
                <input
                  type="number"
                  placeholder="Max Discount (Optional)"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                />
                <input
                  type="datetime-local"
                  placeholder="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                  required
                />
                <input
                  type="datetime-local"
                  placeholder="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                  required
                />
                <input
                  type="number"
                  placeholder="Usage Limit (Optional)"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                />
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 uppercase text-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1 py-2.5 uppercase text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
