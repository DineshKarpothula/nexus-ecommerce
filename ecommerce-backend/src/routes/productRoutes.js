import express from 'express'

import {
	createProduct,
	deleteProduct,
	getFeaturedProducts,
	getProductById,
	getProducts,
	proxyProductImage,
	searchProducts,
	addProductReview,
	updateProduct,
} from '../controllers/productController.js'
import { admin, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/search', searchProducts)
router.get('/image-proxy', proxyProductImage)
router.post('/:id/reviews', protect, addProductReview)
router.get('/:id', getProductById)

router.post('/', protect, admin, createProduct)
router.put('/:id', protect, admin, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

export default router