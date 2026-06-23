import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from './cartSlice.js'
import { buildProductImageProxyUrl } from './api.js'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const normalizeImageUrl = (imageUrl) => {
  const raw = String(imageUrl || '').trim()
  if (!raw) return ''

  // Convert common Google Drive share links to direct-view URLs.
  const driveMatch = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/i)
  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  }

  // Convert Dropbox share links to direct file links.
  if (raw.includes('dropbox.com')) {
    return raw.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1')
  }

  return raw
}

const buildImageCandidates = (images, productId) => {
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

  candidates.push(`https://picsum.photos/seed/${productId}/400/400`)
  return [...new Set(candidates)]
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const imageCandidates = useMemo(() => buildImageCandidates(product.images, product._id), [product.images, product._id])
  const [imageIndex, setImageIndex] = useState(0)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addToCart(product))
    toast.success('Added to cart!', {
      style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
    })
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const traderName = product.seller?.sellerBusinessName || product.seller?.name || 'Platform Trader'

  // Keep image in sync if product data changes between renders.
  useEffect(() => {
    setImageIndex(0)
  }, [product.images, product._id])

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked((prev) => !prev)
    toast.success(liked ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div className="product-card group"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/products/${product._id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/products/${product._id}`)
        }
      }}
      style={{ background: '#fff', border: '4px solid #000', borderRadius: '16px', overflow: 'hidden', boxShadow: '8px 8px 0 #000', cursor: 'pointer' }}>
      <div className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden"
          style={{ background: '#ececec' }}>
          <img
            src={imageCandidates[imageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => {
              if (imageIndex < imageCandidates.length - 1) {
                setImageIndex((prev) => prev + 1)
              }
            }}
          />
          {discount && (
            <span className="absolute top-3 left-3 text-xs font-black px-2 py-1 rounded-full uppercase"
              style={{ background: '#00e5ff', color: 'black', border: '2px solid #000' }}>-{discount}%</span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <span className="text-sm font-bold uppercase" style={{ color: '#ff3d00' }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs mb-1 uppercase font-black" style={{ color: 'var(--accent)' }}>{product.category}</p>
          <h3 className="font-display text-xl mb-2 line-clamp-2 leading-snug uppercase">{product.name}</h3>
          <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Sold by: {traderName}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={11}
                  fill={s <= Math.round(product.rating || 4) ? 'var(--accent-3)' : 'none'}
                  color={s <= Math.round(product.rating || 4) ? 'var(--accent-3)' : '#666'}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({product.numReviews || 0})</span>
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-black text-3xl text-[#e91e63]">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-xs ml-2 line-through" style={{ color: 'var(--text-secondary)' }}>
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2.5 rounded-xl transition-all disabled:opacity-40"
              style={{ background: '#ff5722', color: '#fff', border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}
              title="Add to cart">
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Like Button Outside Link */}
      <button
        onClick={handleLike}
        className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: '#fff', border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}>
        <Heart size={14} fill={liked ? 'var(--accent)' : 'none'} style={{ color: liked ? 'var(--accent)' : 'var(--text-secondary)' }} />
      </button>
    </div>
  )
}