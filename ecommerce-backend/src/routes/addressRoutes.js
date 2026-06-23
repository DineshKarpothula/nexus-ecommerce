import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js'

const router = express.Router()

router.get('/', protect, getAddresses)
router.post('/', protect, addAddress)
router.put('/:addressId', protect, updateAddress)
router.delete('/:addressId', protect, deleteAddress)
router.put('/:addressId/default', protect, setDefaultAddress)

export default router
