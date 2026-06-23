import express from 'express'

import { cancelMyOrder, createOrder, getMyOrders, getOrderById, requestOrderItemReturn } from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.post('/', createOrder)
router.get('/my', getMyOrders)
router.put('/:orderId/cancel', cancelMyOrder)
router.put('/:orderId/items/:productId/return', requestOrderItemReturn)
router.get('/:id', getOrderById)

export default router