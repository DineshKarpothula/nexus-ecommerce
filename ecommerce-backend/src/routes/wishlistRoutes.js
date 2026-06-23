import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  getWishlistCount,
  enablePriceDropNotification,
} from '../controllers/wishlistController.js'

const router = express.Router()

// Specific routes before parameterized routes
router.get('/count/total', protect, getWishlistCount)

// General routes
router.get('/', protect, getWishlist)
router.post('/', protect, addToWishlist)

// Parameterized routes
router.get('/check/:productId', protect, isInWishlist)
router.delete('/:productId', protect, removeFromWishlist)
router.put('/:productId/notify', protect, enablePriceDropNotification)

export default router
