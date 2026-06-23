import asyncHandler from 'express-async-handler'
import Ticket from '../models/Ticket.js'

// Create a new ticket
export const createTicket = asyncHandler(async (req, res) => {
  const { subject, description } = req.body

  if (!subject) {
    res.status(400)
    throw new Error('Subject is required')
  }

  const ticket = await Ticket.create({
    user: req.user._id,
    subject,
    description,
    messages: description ? [{ sender: req.user._id, message: description }] : [],
  })

  res.status(201).json(ticket)
})

// Get tickets for current user
export const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id }).sort('-createdAt')
  res.json(tickets)
})

// Get single ticket (user or admin)
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('messages.sender', 'name email').populate('user', 'name email')

  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  if (String(ticket.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Access denied')
  }

  res.json(ticket)
})

// Add a message to a ticket (user or admin)
export const addTicketMessage = asyncHandler(async (req, res) => {
  const { message } = req.body
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  if (String(ticket.user) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Access denied')
  }

  ticket.messages.push({ sender: req.user._id, message })
  if (req.body.status) ticket.status = req.body.status

  await ticket.save()
  res.json(ticket)
})

// Admin: get all tickets
export const getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find().populate('user', 'name email').sort('-createdAt')
  res.json(tickets)
})

// Admin: update ticket status
export const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  ticket.status = req.body.status || ticket.status
  await ticket.save()
  res.json(ticket)
})
