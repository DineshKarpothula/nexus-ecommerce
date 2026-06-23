import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Star, ShoppingBag, Heart } from 'lucide-react'
import { getActivePromotions, getFeaturedProducts } from './api.js'
import { ProductSkeleton } from './Loaders.jsx'

const FALLBACK_PRODUCTS = [
  {
    _id: 'fallback-1',
    name: 'Aura Over-Ear Headphones',
    price: 299,
    rating: 4.8,
    numReviews: 124,
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'],
    tag: 'Best Seller',
  },
  {
    _id: 'fallback-2',
    name: 'Lunar Ascend Sneakers',
    price: 185,
    rating: 4.9,
    numReviews: 89,
    images: ['https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80&w=800'],
    tag: 'New Arrival',
  },
  {
    _id: 'fallback-3',
    name: 'Obsidian Chronograph Watch',
    price: 450,
    rating: 4.7,
    numReviews: 56,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
    tag: 'Limited',
  },
  {
    _id: 'fallback-4',
    name: 'Velvet Lounge Chair',
    price: 890,
    rating: 5,
    numReviews: 32,
    images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800'],
    tag: 'Interior',
  },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getFeaturedProducts()
      .then((r) => setFeatured(r.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getActivePromotions()
      .then((r) => setPromotions(Array.isArray(r.data) ? r.data.slice(0, 3) : []))
      .catch(() => setPromotions([]))
  }, [])

  const trendingProducts = featured.length > 0
    ? featured.slice(0, 4).map((item, index) => ({
      ...item,
      tag: ['Best Seller', 'New Arrival', 'Limited', 'Interior'][index] || 'Trending',
      images: item.images?.length ? item.images : FALLBACK_PRODUCTS[index % FALLBACK_PRODUCTS.length].images,
    }))
    : FALLBACK_PRODUCTS

  return (
    <div className="pt-20 pb-20 bg-[#f4f4f0] text-black">
      <section className="bg-[#ffeb3b] border-b-4 border-black noise">
        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-20 text-center">
          <div className="inline-flex items-center gap-2 pill mb-7 px-5 py-2"
            style={{ background: '#00e5ff', border: '2px solid #000', color: '#000' }}>
            <Sparkles size={14} /> Fall/Winter 2026 Collection
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display uppercase leading-[0.95] text-5xl sm:text-6xl lg:text-7xl"
          >
            Redefine Your
            <br />
            <span className="text-gradient">Everyday Style.</span>
          </motion.h1>
          <p className="mt-8 text-xl max-w-3xl mx-auto font-medium">
            Discover curated pieces designed for the modern minimalist. High-quality materials meet extraordinary design in our latest drop.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/products')} className="btn-primary text-lg flex items-center justify-center gap-2">
              Shop Collection <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/register')} className="btn-outline text-lg">
              View Lookbook
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="rounded-[28px] overflow-hidden border-4 border-black shadow-[8px_8px_0_0_#000]">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400"
            alt="Fashion model"
            className="w-full h-[260px] sm:h-[340px] lg:h-[430px] object-cover"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase">Trending Now</h2>
            <p className="text-xl mt-2 font-medium">Our most coveted pieces this week.</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-3xl font-display uppercase hover:underline">
            View All <ArrowRight size={26} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : trendingProducts.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35 }}
                className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0_0_#000] group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/800/800`}
                    alt={product.name}
                    className="w-full h-[220px] sm:h-[260px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 px-3 py-1 text-xs font-black uppercase rounded-full"
                    style={{ background: '#00e5ff', border: '2px solid #000' }}>
                    {product.tag || 'Trending'}
                  </span>
                  <button className="absolute right-4 top-4 w-10 h-10 bg-white border-3 border-black rounded-full flex items-center justify-center shadow-[3px_3px_0_0_#000] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star size={16} fill="#e91e63" color="#e91e63" />
                    <span className="font-black text-xl">{Number(product.rating || 4.7).toFixed(1)}</span>
                    <span className="text-base">({product.numReviews || 0})</span>
                  </div>
                  <h3 className="font-display uppercase text-3xl leading-tight mb-3">{product.name}</h3>
                  <div className="text-4xl font-black text-[#e91e63] mb-4">₹{Number(product.price || 0).toLocaleString('en-IN')}</div>
                  <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={18} /> View Product
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display uppercase text-4xl sm:text-5xl">Live Seller Promotions</h2>
              <p className="text-lg sm:text-xl font-medium mt-2">Grab active deals created by verified sellers.</p>
            </div>
            <Link to="/cart" className="btn-outline inline-flex items-center gap-2 text-sm uppercase">
              Apply In Cart <ArrowRight size={16} />
            </Link>
          </div>

          {promotions.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              No active promotions right now.
            </div>
          ) : (
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo._id}
                  className="rounded-xl p-5 h-full min-h-[260px] flex flex-col justify-between"
                  style={{ background: '#f7f7f7', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}
                >
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--accent)' }}>{promo.type}</p>
                    <h3 className="font-display text-4xl uppercase mt-2 leading-none">{promo.name}</h3>
                    <p className="mt-4 text-3xl font-black" style={{ color: '#e91e63' }}>
                      {promo.type === 'percentage'
                        ? `${promo.discountValue}% OFF`
                        : `₹${Number(promo.discountValue || 0).toLocaleString('en-IN')} OFF`}
                    </p>
                    {promo.code && (
                      <p className="mt-4 text-lg font-black uppercase">
                        Code: <span style={{ color: '#e91e63' }}>{promo.code}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Min order: ₹{Number(promo.minOrderValue || 0).toLocaleString('en-IN')}
                    </p>
                    <span
                      className="text-xs font-black uppercase px-2 py-1 rounded"
                      style={{ background: '#00e5ff', border: '2px solid #000', color: '#000' }}
                    >
                      Live
                    </span>
                  </div>
                </div>
              ))}

              <div
                className="rounded-xl p-5 h-full flex flex-col justify-between"
                style={{ background: '#fff7e8', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}
              >
                <div>
                  <p className="text-xs font-black uppercase" style={{ color: '#ff5722' }}>How To Redeem</p>
                  <h3 className="font-display text-2xl uppercase mt-1">Use Seller Promo In 3 Steps</h3>
                  <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Pick a code from this section, open your cart, paste the code, and tap Apply.
                  </p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Discount will reflect in cart summary and continue to checkout automatically.
                  </p>
                </div>
                <Link to="/cart" className="btn-primary mt-5 inline-flex items-center justify-center gap-2 text-sm uppercase">
                  Go To Cart <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}