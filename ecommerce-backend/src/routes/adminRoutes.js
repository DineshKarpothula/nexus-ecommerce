import express from 'express'

import {
	approveSeller,
	deleteUser,
	getAllOrders,
	getAllUsers,
	getDashboardStats,
	getLowStockProducts,
	getReturnAnalytics,
	getPendingSellers,
	rejectSeller,
	updateOrderStatus,
	updateOrderItemStatus,
} from '../controllers/adminController.js'
import { admin, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, admin)

router.get('/dashboard', getDashboardStats)
router.get('/returns/analytics', getReturnAnalytics)
router.get('/products/low-stock', getLowStockProducts)
router.get('/orders', getAllOrders)
router.put('/orders/:id', updateOrderStatus)
router.put('/orders/:id/items/:itemIndex', updateOrderItemStatus)
router.get('/users', getAllUsers)
router.delete('/users/:id', deleteUser)
router.get('/sellers/pending', getPendingSellers)
router.put('/sellers/:id/approve', approveSeller)
router.put('/sellers/:id/reject', rejectSeller)

export default router