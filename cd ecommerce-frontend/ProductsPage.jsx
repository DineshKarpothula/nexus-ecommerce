import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { getProducts } from './api.js'
import ProductCard from './Productcard.jsx'
import { ProductSkeleton } from './Loaders.jsx'

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive']
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Best Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const category = searchParams.get('category') || 'All'
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val && val !== 'All') p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, sort }
      if (category !== 'All') params.category = category
      if (search) params.search = search
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      const { data } = await getProducts(params)
      setProducts(data.products || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      // Demo fallback
      setProducts(Array(12).fill(0).map((_, i) => ({
        _id: `p${i}`,
        name: ['Smart TV 55"','Running Shoes','Coffee Maker','Bluetooth Speaker','Laptop Bag','Sunglasses','Yoga Mat','Power Bank','Desk Lamp','Headphones','Watch','Keyboard'][i],
        price: [32999,2499,4299,3499,1899,1299,999,2299,899,5999,8999,7499][i],
        originalPrice: [45999,3499,5999,4999,2499,1999,1499,3499,1299,8999,12999,10999][i],
        category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
        rating: 3.8 + Math.random(),
        numReviews: Math.floor(Math.random() * 500 + 50),
        stock: i === 5 ? 0 : 20,
      })))
    } finally {
      setLoading(false)
    }
  }, [category, search, sort, page, minPrice, maxPrice])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return (
    <div className="pt-20 min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className={`md:w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24 glass p-5 space-y-6" style={{ background: 'linear-gradient(170deg, rgba(255,255,255,0.97), rgba(242,246,255,0.95))' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button className="md:hidden" onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Category */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-secondary)' }}>Category</h4>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    onClick={() => updateParam('category', cat)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all lift"
                    style={{
                      background: category === cat ? 'rgba(122,92,255,0.12)' : 'transparent',
                      color: category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                      border: category === cat ? '1px solid rgba(122,92,255,0.26)' : '1px solid transparent',
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-secondary)' }}>Price Range (₹)</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min"
                  value={minPrice}
                  onChange={e => updateParam('minPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <input type="number" placeholder="Max"
                  value={maxPrice}
                  onChange={e => updateParam('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-secondary)' }}>Min Rating</h4>
              <div className="space-y-1.5">
                {[4, 3, 2].map(r => (
                  <button key={r}
                    onClick={() => updateParam('rating', r)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}>
                    {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setSearchParams({})}
              className="w-full text-sm py-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              Clear Filters
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3 surface px-4 py-3">
            <div>
              <h1 className="font-display font-bold text-2xl">
                {search ? `Results for "${search}"` : category !== 'All' ? category : 'All Products'}
              </h1>
              {!loading && <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {products.length} products found</p>}
            </div>
            <div className="flex items-center gap-3">
              <button className="md:hidden flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                onClick={() => setShowFilters(true)}
                style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border)' }}>
                <SlidersHorizontal size={14} /> Filters
              </button>
              <div className="relative">
                <select value={sort} onChange={e => updateParam('sort', e.target.value)}
                  className="pl-3 pr-8 py-2 rounded-lg text-sm outline-none appearance-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : products.map((p, i) => (
                <motion.div key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p}
                  onClick={() => { const q = new URLSearchParams(searchParams); q.set('page', p); setSearchParams(q) }}
                  className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: page === p ? 'var(--accent)' : 'var(--bg-card)',
                    color: page === p ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}