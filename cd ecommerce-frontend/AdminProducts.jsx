import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct } from './api.js'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', price: '', originalPrice: '', category: '', stock: '', description: '', images: '' }
const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const DEMO_PRODUCTS = Array(8).fill(0).map((_, i) => ({
    _id: `p${i}`,
    name: ['Smart TV','Headphones','Sneakers','Coffee Maker','Desk Lamp','Yoga Mat','Keyboard','Watch'][i],
    price: [32999, 5999, 2499, 4299, 899, 999, 7499, 8999][i],
    category: CATEGORIES[i % CATEGORIES.length],
    stock: [10, 25, 5, 0, 18, 30, 12, 7][i],
    rating: 4.0 + Math.random() * 0.9,
  }))

  useEffect(() => {
    getProducts({ limit: 50 })
      .then(r => setProducts(r.data.products || []))
      .catch(() => setProducts(DEMO_PRODUCTS))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p._id)
    setForm({ ...p, images: p.images?.join(',') || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice), stock: Number(form.stock), images: form.images.split(',').map(s => s.trim()).filter(Boolean) }
    try {
      if (editing) {
        await updateProduct(editing, payload)
        setProducts(prev => prev.map(p => p._id === editing ? { ...p, ...payload } : p))
        toast.success('Product updated!', { style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' } })
      } else {
        const { data } = await createProduct(payload)
        setProducts(prev => [data, ...prev])
        toast.success('Product created!', { style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' } })
      }
      setShowModal(false)
    } catch {
      toast.error('Save failed', { style: { background: 'var(--bg-card)', color: '#ef4444', border: '1px solid #ef444444' } })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p._id !== id))
      toast.success('Deleted!', { style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' } })
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Products</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{products.length} products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 py-2.5 px-5">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Products table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {['Product','Category','Price','Stock','Rating','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    {[1,2,3,4,5,6].map(j => <td key={j} className="px-5 py-4"><div className="shimmer h-4 rounded w-20" /></td>)}
                  </tr>
                ))
                : products.map(p => (
                  <tr key={p._id} style={{ borderTop: '1px solid var(--border)' }}
                    className="transition-colors hover:bg-white/2">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/40/40`}
                          className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <span className="font-medium truncate max-w-[160px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(249,115,22,0.1)', color: 'var(--accent)' }}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span style={{ color: p.stock === 0 ? '#ef4444' : p.stock < 5 ? '#eab308' : '#22c55e' }}>
                        {p.stock === 0 ? 'Out' : p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs">{p.rating?.toFixed(1) || '-'} ★</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          style={{ color: '#3b82f6' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          style={{ color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="w-full max-w-lg glass p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Wireless Headphones Pro' },
                  { name: 'price', label: 'Price (₹)', type: 'number', placeholder: '999' },
                  { name: 'originalPrice', label: 'Original Price (₹)', type: 'number', placeholder: '1499' },
                  { name: 'stock', label: 'Stock Quantity', type: 'number', placeholder: '50' },
                  { name: 'images', label: 'Image URLs (comma-separated)', type: 'text', placeholder: 'https://...' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-sm font-medium block mb-1.5">{f.label}</label>
                    <input type={f.type} value={form[f.name]} placeholder={f.placeholder}
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                ))}

                <div>
                  <label className="text-sm font-medium block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} placeholder="Product description..."
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="btn-outline flex-1 py-3">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    {saving
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Save size={15} /> {editing ? 'Save Changes' : 'Create Product'}</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}