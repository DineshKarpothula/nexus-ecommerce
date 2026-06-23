import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from '../controllers/paymentMethodController.js'

const router = express.Router()

router.get('/', protect, getPaymentMethods)
router.post('/', protect, addPaymentMethod)
router.put('/:paymentMethodId/default', protect, setDefaultPaymentMethod)
router.delete('/:paymentMethodId', protect, deletePaymentMethod)

export default router
