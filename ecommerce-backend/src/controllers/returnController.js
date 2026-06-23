import asyncHandler from 'express-async-handler'
import Return from '../models/Return.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { transferReturnRefund } from '../utils/refundWallet.js'

// Request return
export const requestReturn = asyncHandler(async (req, res) => {
  const { orderId, itemIndex, reason, description, images } = req.body

  const order = await Order.findById(orderId).populate('items.product')
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  if (order.user.toString() !== req.user.id) {
    res.status(403)
    throw new Error('Not authorized to return items from this order')
  }

  const orderItem = order.items[itemIndex]
  if (!orderItem) {
    res.status(400)
    throw new Error('Invalid item index')
  }

  if (orderItem.fulfillmentStatus !== 'delivered') {
    res.status(400)
    throw new Error('Can only return delivered items')
  }

  // Check return window
  const product = await Product.findById(orderItem.product)
  const deliveryDate = new Date(orderItem.deliveryDate)
  const returnWindowEnd = new Date(
    deliveryDate.getTime() + product.returnWindow * 24 * 60 * 60 * 1000
  )

  if (new Date() > returnWindowEnd) {
    res.status(400)
    throw new Error(`Return window expired. Return period was ${product.returnWindow} days`)
  }

  const returnRequest = await Return.create({
    order: orderId,
    orderItem,
    user: req.user.id,
    product: orderItem.product,
    seller: orderItem.seller,
    reason,
    description,
    images: images || [],
    refundAmount: orderItem.price * orderItem.qty,
  })

  // Update order item status
  orderItem.returnRequested = true
  orderItem.returnReason = reason
  orderItem.returnStatus = 'requested'
  orderItem.returnRequestedAt = new Date()
  await order.save()

  res.status(201).json(returnRequest)
})

// Get user returns
export const getUserReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({ user: req.user.id })
    .populate('order')
    .populate('product')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 })

  res.status(200).json(returns)
})

// Get seller returns
export const getSellerReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({ seller: req.user.id })
    .populate('order')
    .populate('product')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })

  const existingKeys = new Set(
    returns.map((entry) => `${String(entry.order?._id || entry.order)}:${String(entry.product?._id || entry.product)}`)
  )

  const orders = await Order.find({
    items: {
      $elemMatch: {
        seller: req.user.id,
        returnStatus: { $in: ['requested', 'approved', 'rejected', 'completed'] },
      },
    },
  })
    .populate('user', 'name email phone')
    .sort({ updatedAt: -1 })
    .lean()

  const syntheticReturns = []

  orders.forEach((order) => {
    ;(order.items || []).forEach((item) => {
      if (String(item.seller) !== String(req.user.id)) return

      const status = String(item.returnStatus || '').toLowerCase()
      if (!['requested', 'approved', 'rejected', 'completed'].includes(status)) return

      const key = `${String(order._id)}:${String(item.product)}`
      if (existingKeys.has(key)) return

      syntheticReturns.push({
        _id: `legacy-${String(order._id)}-${String(item.product)}`,
        order: { _id: order._id },
        product: { _id: item.product, name: item.name },
        user: order.user,
        reason: item.returnReason || 'other',
        description: item.returnReason || '',
        status,
        refundAmount: Number(item.price || 0) * Number(item.qty || 0),
        requestedAt: item.returnRequestedAt || order.updatedAt || order.createdAt,
      })
    })
  })

  const merged = [...returns, ...syntheticReturns].sort(
    (a, b) => new Date(b.requestedAt || b.createdAt || 0).getTime() - new Date(a.requestedAt || a.createdAt || 0).getTime()
  )

  res.status(200).json(merged)
})

// Approve return (seller)
export const approveReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params
  const { shippingLabel } = req.body

  const returnRequest = await Return.findById(returnId)
  if (!returnRequest) {
    res.status(404)
    throw new Error('Return request not found')
  }

  if (returnRequest.seller.toString() !== req.user.id) {
    res.status(403)
    throw new Error('Not authorized')
  }

  returnRequest.status = 'approved'
  returnRequest.approvedAt = new Date()
  if (shippingLabel) returnRequest.shippingLabel = shippingLabel

  await returnRequest.save()

  // Update order item status
  const order = await Order.findById(returnRequest.order)
  const orderItem = order.items.find(
    (item) => item.product.toString() === returnRequest.product.toString()
  )
  if (orderItem) {
    orderItem.returnStatus = 'approved'
    await order.save()
  }

  res.status(200).json(returnRequest)
})

// Reject return (seller)
export const rejectReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params
  const { reason } = req.body

  const returnRequest = await Return.findById(returnId)
  if (!returnRequest) {
    res.status(404)
    throw new Error('Return request not found')
  }

  if (returnRequest.seller.toString() !== req.user.id) {
    res.status(403)
    throw new Error('Not authorized')
  }

  returnRequest.status = 'rejected'
  returnRequest.rejectedAt = new Date()
  returnRequest.rejectionReason = reason

  await returnRequest.save()

  // Update order item status
  const order = await Order.findById(returnRequest.order)
  const orderItem = order.items.find(
    (item) => item.product.toString() === returnRequest.product.toString()
  )
  if (orderItem) {
    orderItem.returnStatus = 'rejected'
    await order.save()
  }

  res.status(200).json(returnRequest)
})

// Mark return as received (admin)
export const markReturnReceived = asyncHandler(async (req, res) => {
  const { returnId } = req.params

  const returnRequest = await Return.findById(returnId)
  if (!returnRequest) {
    res.status(404)
    throw new Error('Return request not found')
  }

  let refundSummary = null
  if (returnRequest.refundStatus !== 'processed') {
    refundSummary = await transferReturnRefund({
      buyerId: returnRequest.user,
      sellerId: returnRequest.seller,
      amount: returnRequest.refundAmount,
      orderId: returnRequest.order,
      productId: returnRequest.product,
      returnRequestId: returnRequest._id,
    })
  }

  returnRequest.status = 'received'
  returnRequest.returnedAt = new Date()
  returnRequest.refundStatus = 'processed'
  returnRequest.refundedAt = new Date()

  await returnRequest.save()

  res.status(200).json({ ...returnRequest.toObject(), refund: refundSummary })
})

// Get all returns (admin)
export const getAllReturns = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query

  let filter = {}

  if (status) {
    filter.status = status
  }

  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate) filter.createdAt.$lte = new Date(endDate)
  }

  const returns = await Return.find(filter)
    .populate('order')
    .populate('product', 'name')
    .populate('user', 'name email')
    .populate('seller', 'name')
    .sort({ createdAt: -1 })

  res.status(200).json(returns)
})
