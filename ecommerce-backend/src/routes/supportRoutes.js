import express from 'express'
import {
  createTicket,
  getMyTickets,
  getTicketById,
  addTicketMessage,
  getAllTickets,
  updateTicketStatus,
} from '../controllers/supportController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// user routes
router.post('/tickets', protect, createTicket)
router.get('/tickets/my', protect, getMyTickets)
router.get('/tickets/:id', protect, getTicketById)
router.post('/tickets/:id/messages', protect, addTicketMessage)

// admin routes
router.get('/tickets', protect, admin, getAllTickets)
router.put('/tickets/:id/status', protect, admin, updateTicketStatus)

export default router
