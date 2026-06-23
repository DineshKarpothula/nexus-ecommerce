import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Truck, Shield, ArrowLeft, Heart, Share2, Minus, Plus } from 'lucide-react'
import {
  addProductReview,
  getProductById,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  buildProductImageProxyUrl,
} from './api.js'
import { addToCart } from './cartSlice.js'
import { PageLoader } from './Loaders.jsx'
import toast from 'react-hot-toast'

const normalizeImageUrl = (url) => {
  const raw = String(url || '').trim()
  if (!raw) return ''

  const driveMatch = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/i)
  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  }

  if (raw.includes('dropbox.com')) {
    return raw.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1')
  }

  return raw
}

const buildImageCandidates = (images, productId, imageIndex) => {
  const list = (Array.isArray(images) ? images : [images])
    .map((item) => String(item || '').trim())
    .filter(Boolean)

  const candidates = []

  if (list.length >= 2 && /^https?:\/\//i.test(list[0]) && !/^https?:\/\//i.test(list[1])) {
    const normalized = normalizeImageUrl(`${list[0]},${list[1]}`)
    if (normalized) {
      candidates.push(normalized)
      candidates.push(buildProductImageProxyUrl(normalized))
    }
  }

  list.forEach((item) => {
    const normalized = normalizeImageUrl(item)
    if (normalized) {
      candidates.push(normalized)
      candidates.push(buildProductImageProxyUrl(normalized))
    }
  })

  candidates.push(`https://picsum.photos/seed/${productId}-${imageIndex}/600/600`)
  return [...new Set(candidates)]
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [detailImageIndex, setDetailImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    getProductById(id)
      .then(r => {
        setProduct(r.data)
        // Check if product is in wishlist
        if (user) {
          isInWishlist(id)
            .then(res => {
              console.log('✅ isInWishlist check for', id, ':', res.data)
              setIsLiked(res.data?.inWishlist || false)
            })
            .catch(err => {
              console.error('❌ isInWishlist error:', err)
              setIsLiked(false)
            })
        }
      })
      .catch(() => {
        // Demo fallback
        setProduct({
          _id: id,
          name: 'Premium Wireless Headphones Pro',
          price: 5999,
          originalPrice: 9999,
          category: 'Electronics',
          rating: 4.5,
          numReviews: 328,
          stock: 15,
          description: 'Experience audio like never before with our Premium Wireless Headphones. Featuring 40mm drivers, active noise cancellation, and up to 30 hours of battery life. The premium leather ear cushions provide exceptional comfort for all-day wear.',
          images: [
            `https://picsum.photos/seed/${id}a/600/600`,
            `https://picsum.photos/seed/${id}b/600/600`,
            `https://picsum.photos/seed/${id}c/600/600`,
          ],
          reviews: [
            { user: 'Rahul K.', rating: 5, comment: 'Absolutely amazing sound quality! Worth every rupee.', date: '2024-12-01' },
            { user: 'Priya S.', rating: 4, comment: 'Great build quality, comfortable for long sessions.', date: '2024-11-28' },
          ],
          specifications: { 'Driver Size': '40mm', 'Frequency': '20Hz–20kHz', 'Battery': '30 hours', 'Weight': '250g', 'Connectivity': 'Bluetooth 5.2' }
        })
      })
      .finally(() => setLoading(false))
  }, [id, user])

  const detailImageCandidates = useMemo(
    () => buildImageCandidates(product?.images, product?._id || id, activeImg),
    [product?.images, product?._id, id, activeImg]
  )

  useEffect(() => {
    setDetailImageIndex(0)
  }, [activeImg, product?._id])

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }))
    toast.success('Added to cart!', {
      style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
    })
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist')
      navigate('/login')
      return
    }

    try {
      console.log('❤️ Toggle wishlist for product:', product._id, 'Current state:', isLiked)
      
      if (isLiked) {
        // Remove from wishlist
        console.log('Removing from wishlist...')
        const res = await removeFromWishlist(product._id)
        console.log('Remove response:', res.data)
        setIsLiked(false)
        toast.success('Removed from wishlist', {
          style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
        })
      } else {
        // Add to wishlist
        console.log('Adding to wishlist...')
        const res = await addToWishlist(product._id)
        console.log('Add response:', res.data)
        setIsLiked(true)
        toast.success('Added to wishlist', {
          style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
        })
      }
    } catch (error) {
      console.error('❌ Wishlist error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      toast.error(error.response?.data?.message || 'Failed to update wishlist', {
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
      })
    }
  }

  const handleShare = () => {
    const shareText = `${product.name} - ₹${product.price?.toLocaleString('en-IN')} on NEXUS`
    const shareUrl = window.location.href
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: shareUrl
      }).catch(() => {})
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      toast.success('Product link copied to clipboard!', {
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
      })
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please login to add a review')
      navigate('/login')
      return
    }

    setReviewLoading(true)
    try {
      const { data } = await addProductReview(product._id, reviewForm)
      setProduct((prev) => ({
        ...prev,
        rating: data.rating,
        numReviews: data.numReviews,
        reviews: data.reviews,
      }))
      setReviewForm({ rating: 5, comment: '' })
      toast.success(data.message || 'Review submitted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit review')
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) return <PageLoader />
  if (!product) return null

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const traderName = product.seller?.sellerBusinessName || product.seller?.name || 'Platform Trader'
  const traderEmail = product.seller?.email || ''

  return (
    <div className="pt-20 min-h-screen max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="rounded-2xl overflow-hidden aspect-square mb-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <img src={detailImageCandidates[detailImageIndex]} alt={product.name}
              className="w-full h-full object-cover"
              onError={() => {
                if (detailImageIndex < detailImageCandidates.length - 1) {
                  setDetailImageIndex((prev) => prev + 1)
                }
              }} />
          </div>
          <div className="flex gap-2">
            {product.images?.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                style={{ border: activeImg === i ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                <img src={normalizeImageUrl(img) || `https://picsum.photos/seed/${product._id}-thumb-${i}/80/80`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="space-y-5">
          <div>
            <span className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent)' }}>
              {product.category}
            </span>
            <h1 className="font-display font-bold text-3xl mt-3 leading-tight">{product.name}</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Sold by: <strong style={{ color: 'var(--text-primary)' }}>{traderName}</strong>
              {traderEmail ? ` (${traderEmail})` : ''}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16}
                  fill={s <= Math.round(product.rating) ? '#f97316' : 'none'}
                  color={s <= Math.round(product.rating) ? '#f97316' : '#444'} />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating?.toFixed(1)}</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display font-bold text-4xl">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg line-through" style={{ color: 'var(--text-secondary)' }}>
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14} /></button>
                <span className="w-6 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}><Plus size={14} /></button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 disabled:opacity-40">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleLike} className="p-3.5 rounded-xl transition-colors hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: isLiked ? '#e91e63' : 'var(--text-primary)' }}>
              <Heart size={18} fill={isLiked ? '#e91e63' : 'none'} />
            </button>
            <button onClick={handleShare} className="p-3.5 rounded-xl transition-colors hover:bg-white/5"
              style={{ border: '1px solid var(--border)' }}>
              <Share2 size={18} />
            </button>
          </div>

          {/* Delivery */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Truck, text: 'Free delivery above ₹499', color: '#3b82f6' },
              { icon: Shield, text: '1 Year warranty included', color: '#10b981' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <Icon size={16} style={{ color }} />
                <span className="text-xs">{text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl text-sm font-semibold"
              style={{
                border: '1px solid var(--border)',
                background: product.returnable ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                color: product.returnable ? '#166534' : '#991b1b',
              }}>
              {product.returnable ? 'Return Available' : 'No Returns'}
            </div>
            <div className="p-3 rounded-xl text-sm font-semibold"
              style={{
                border: '1px solid var(--border)',
                background: product.replaceable ? 'rgba(59,130,246,0.12)' : 'rgba(107,114,128,0.18)',
                color: product.replaceable ? '#1e40af' : '#374151',
              }}>
              {product.replaceable ? 'Replacement Available' : 'No Replacement'}
            </div>
          </div>

          <div className="p-4 rounded-xl"
            style={{ background: '#fff7d6', border: '2px solid #000' }}>
            <p className="text-xs font-black uppercase tracking-wide">Return Policy</p>
            {product.returnable ? (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#1f2937' }}>
                Easy return within <strong>{Math.max(1, Number(product.returnWindow) || 7)} days</strong> of delivery.
                Item must be in original condition with all accessories and packaging.
              </p>
            ) : (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#7f1d1d' }}>
                This item is currently not eligible for return as per seller policy.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <div className="mt-14">
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {['description', 'specifications', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="glass p-6">
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
          </div>
        )}

        {activeTab === 'specifications' && product.specifications && (
          <div className="glass overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([k, v], i) => (
                  <tr key={k} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td className="px-6 py-3 font-medium w-1/3" style={{ color: 'var(--text-secondary)' }}>{k}</td>
                    <td className="px-6 py-3">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <form onSubmit={handleSubmitReview} className="glass p-5 space-y-3">
              <div className="font-semibold">Write a review</div>
              <div className="grid md:grid-cols-2 gap-3">
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <button type="submit" disabled={reviewLoading} className="btn-primary py-2.5">
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="How was this product?"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Only users with delivered orders can submit reviews.
              </div>
            </form>

            {(product.reviews || []).length === 0 && (
              <div className="glass p-5 text-sm" style={{ color: 'var(--text-secondary)' }}>No reviews yet.</div>
            )}

            {(product.reviews || []).map((r, i) => (
              <div key={i} className="glass p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{r.name || r.user || 'Customer'}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {r.date ? new Date(r.date).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>
                <div className="flex mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} fill={s <= Number(r.rating || 0) ? '#f97316' : 'none'} color={s <= Number(r.rating || 0) ? '#f97316' : '#444'} />
                  ))}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}