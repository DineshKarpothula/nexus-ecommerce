import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  requestReturn,
  getUserReturns,
  getSellerReturns,
  approveReturn,
  rejectReturn,
  markReturnReceived,
  getAllReturns,
} from '../controllers/returnController.js'

const router = express.Router()

// User routes
router.post('/', protect, requestReturn)
router.get('/user/my-returns', protect, getUserReturns)

// Seller routes
router.get('/seller/returns', protect, getSellerReturns)
router.put('/:returnId/approve', protect, approveReturn)
router.put('/:returnId/reject', protect, rejectReturn)

// Admin routes
router.get('/admin/all', protect, admin, getAllReturns)
router.put('/:returnId/received', protect, admin, markReturnReceived)

export default router
