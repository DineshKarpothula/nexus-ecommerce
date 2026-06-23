import express from 'express'

import { getProfile, loginUser, registerUser, requestSellerApproval } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', protect, getProfile)
router.post('/request-seller', protect, requestSellerApproval)

export default router