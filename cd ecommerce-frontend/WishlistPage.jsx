import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Trash2 } from 'lucide-react'
import Loader from './Loaders.jsx'
import { getWishlist, removeFromWishlist } from './api.js'
import { addToCart as addToCartAction } from './cartSlice.js'
import { useDispatch } from 'react-redux'

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchWishlist()
  }, [])

  // Refetch wishlist when page comes into focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('📝 Wishlist page gained focus, refetching...')
      fetchWishlist()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const res = await getWishlist()
      console.log('📦 Wishlist fetched:', res.data)
      setWishlistItems(res.data || [])
      setError('')
    } catch (err) {
      console.error('❌ Error fetching wishlist:', err)
      setError(err.response?.data?.message || 'Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId)
      setWishlistItems(wishlistItems.filter(item => item.product._id !== productId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item')
    }
  }

  const handleAddToCart = (product) => {
    try {
      dispatch(addToCartAction({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: 1,
      }))
      navigate('/cart')
    } catch (err) {
      setError('Failed to add to cart')
    }
  }

  if (loading) return <Loader />

  return (
    <motion.div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--bg)' }}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h1 variants={itemVariants} className="font-display text-4xl uppercase mb-8">My Wishlist</motion.h1>

        {error && (
          <motion.div variants={itemVariants} className="px-4 py-3 rounded-xl mb-4 text-sm font-semibold" style={{ background: '#ffe4e6', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#9f1239' }}>
            {error}
          </motion.div>
        )}

        {wishlistItems.length === 0 ? (
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-8 text-center" style={{ border: '3px solid #000', boxShadow: '5px 5px 0 #000' }}>
            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>Your wishlist is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary px-6 py-2.5 uppercase text-sm"
            >
              Continue Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.product._id}
                variants={itemVariants}
                transition={{ delay: index * 0.04 }}
                className="product-card group"
                style={{ background: '#fff', border: '4px solid #000', borderRadius: '16px', overflow: 'hidden', boxShadow: '8px 8px 0 #000' }}>
                <Link to={`/products/${item.product._id}`} className="block">
                  <div className="relative aspect-square overflow-hidden" style={{ background: '#ececec' }}>
                    <img
                      src={item.product.images?.[0] || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                      <span
                        className="absolute top-3 left-3 text-xs font-black px-2 py-1 rounded-full uppercase"
                        style={{ background: '#00e5ff', color: 'black', border: '2px solid #000' }}
                      >
                        -{Math.round((1 - item.product.price / item.product.originalPrice) * 100)}%
                      </span>
                    )}
                    {item.priceAtAddTime > item.product.price && (
                      <span
                        className="absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-full uppercase"
                        style={{ background: '#22c55e', color: '#000', border: '2px solid #000' }}
                      >
                        Price Drop
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs mb-1 uppercase font-black" style={{ color: 'var(--accent)' }}>
                      {item.product.category || 'Products'}
                    </p>
                    <h3 className="font-display text-xl mb-2 line-clamp-2 leading-snug uppercase">{item.product.name}</h3>
                    <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Sold by: {item.product.seller?.sellerBusinessName || item.product.seller?.name || 'Platform Trader'}
                    </p>

                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            fill={s <= Math.round(item.product.rating || 0) ? 'var(--accent-3)' : 'none'}
                            color={s <= Math.round(item.product.rating || 0) ? 'var(--accent-3)' : '#666'}
                          />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        ({item.product.numReviews || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="font-black text-3xl text-[#e91e63]">₹{Number(item.product.price || 0).toLocaleString('en-IN')}</span>
                        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <span className="text-xs ml-2 line-through" style={{ color: 'var(--text-secondary)' }}>
                            ₹{Number(item.product.originalPrice || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddToCart(item.product)
                        }}
                        className="p-2.5 rounded-xl transition-all"
                        style={{ background: '#ff5722', color: '#fff', border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}
                        title="Add to cart"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>

                    {item.priceAtAddTime > item.product.price && (
                      <div className="text-xs font-black uppercase mb-3" style={{ color: '#16a34a' }}>
                        Price dropped by ₹{Number(item.priceAtAddTime - item.product.price).toLocaleString('en-IN')}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemove(item.product._id)
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase transition-all"
                      style={{ background: '#ffe4e6', color: '#9f1239', border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}
                    >
                      <Trash2 size={14} /> Remove from Wishlist
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
