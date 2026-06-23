import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  createPromotion,
  getActivePromotions,
  getPromotionsByCreator,
  validatePromoCode,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotionController.js'

const router = express.Router()

router.get('/active', getActivePromotions)
router.post('/validate', validatePromoCode)

router.post('/', protect, createPromotion)
router.get('/creator/my-promotions', protect, getPromotionsByCreator)
router.put('/:promotionId', protect, updatePromotion)
router.delete('/:promotionId', protect, deletePromotion)

export default router
