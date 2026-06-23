import express from 'express'

import {
  createSellerProduct,
  deliverOrderItem,
  deleteSellerProduct,
  getMyProducts,
  getSellerOrders,
  shipOrderItem,
  updateReturnRequest,
  updateSellerProduct,
} from '../controllers/sellerController.js'
import { protect, sellerApproved } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, sellerApproved)

router.get('/products', getMyProducts)
router.post('/products', createSellerProduct)
router.put('/products/:id', updateSellerProduct)
router.delete('/products/:id', deleteSellerProduct)

router.get('/orders', getSellerOrders)
router.put('/orders/:orderId/items/:productId/ship', shipOrderItem)
router.put('/orders/:orderId/items/:productId/deliver', deliverOrderItem)
router.put('/orders/:orderId/items/:productId/return', updateReturnRequest)

export default router
