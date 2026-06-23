import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Return from '../models/Return.js'
import User from '../models/User.js'

const mapReasonToReturnEnum = (reasonText) => {
  const normalized = String(reasonText || '').toLowerCase()

  if (normalized.includes('defect')) return 'defective'
  if (normalized.includes('not as described') || normalized.includes('description')) return 'notAsDescribed'
  if (normalized.includes('wrong item') || normalized.includes('wrong product')) return 'wrongItem'
  if (normalized.includes('damaged') || normalized.includes('damage')) return 'damageInShipping'
  return 'other'
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, address, paymentMethod, totalAmount, stripePaymentIntentId } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400)
    throw new Error('Order items are required')
  }

  if (!address?.street || !address?.city || !address?.state || !address?.pincode || !address?.phone) {
    res.status(400)
    throw new Error('Complete delivery address is required')
  }

  if (totalAmount === undefined) {
    res.status(400)
    throw new Error('Total amount is required')
  }

  const normalizedItems = items.map((item) => ({
    product: item.product,
    name: item.name,
    qty: Number(item.qty),
    price: Number(item.price),
  }))

  const validIds = normalizedItems.every((item) => mongoose.Types.ObjectId.isValid(item.product))

  if (!validIds) {
    res.status(400)
    throw new Error('One or more product ids are invalid')
  }

  const productIds = normalizedItems.map((item) => String(item.product))
  const products = await Product.find({ _id: { $in: productIds } }).select('_id seller stock').lean()
  const productMap = new Map(products.map((product) => [String(product._id), product]))

  if (products.length !== productIds.length) {
    res.status(400)
    throw new Error('One or more products no longer exist')
  }

  const fallbackAdmin = await User.findOne({ role: 'admin' }).select('_id').lean()

  normalizedItems.forEach((item) => {
    const product = productMap.get(String(item.product))

    if (!product?.seller && !fallbackAdmin?._id) {
      res.status(400)
      throw new Error(`Product ${item.name} is not assigned to a seller and no admin fallback is available`)
    }

    if (product.stock < item.qty) {
      res.status(400)
      throw new Error(`Insufficient stock for ${item.name}`)
    }

    item.seller = product.seller || fallbackAdmin._id
    item.fulfillmentStatus = 'processing'
  })

  const order = await Order.create({
    user: req.user._id,
    items: normalizedItems,
    address,
    paymentMethod: paymentMethod || 'stripe',
    paymentStatus: stripePaymentIntentId ? 'paid' : 'pending',
    stripePaymentIntentId: stripePaymentIntentId || '',
    totalAmount: Number(totalAmount),
    status: stripePaymentIntentId ? 'processing' : 'pending',
  })

  await Promise.all(
    normalizedItems.map(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.qty,
          popularity: item.qty,
        },
      })
    })
  )

  res.status(201).json(order)
})

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean()
  res.json(orders)
})

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid order id')
  }

  const order = await Order.findById(id).populate('user', 'name email')

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  if (String(order.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to access this order')
  }

  res.json(order)
})

export const requestOrderItemReturn = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params
  const { reason } = req.body
  const normalizedReasonText = String(reason || '').trim()

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid order id or product id')
  }

  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  if (String(order.user) !== String(req.user._id)) {
    res.status(403)
    throw new Error('Not authorized to request return for this order')
  }

  const item = order.items.find((entry) => String(entry.product) === String(productId))
  if (!item) {
    res.status(404)
    throw new Error('Order item not found')
  }

  const isDelivered =
    String(item.fulfillmentStatus || '').toLowerCase() === 'delivered' ||
    String(order.status || '').toLowerCase() === 'delivered'
  if (!isDelivered) {
    res.status(400)
    throw new Error('Return can only be requested after delivery')
  }

  const product = await Product.findById(productId).select('returnable returnWindow').lean()
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (!product.returnable) {
    res.status(400)
    throw new Error('This product is not eligible for return')
  }

  // Check if return is within the return window
  const deliveryDateValue = item.deliveryDate || order.updatedAt || order.createdAt
  if (deliveryDateValue) {
    const deliveryDate = new Date(deliveryDateValue)
    const returnWindowEnd = new Date(deliveryDate.getTime() + (product.returnWindow || 7) * 24 * 60 * 60 * 1000)
    const now = new Date()
    
    if (now > returnWindowEnd) {
      const daysElapsed = Math.floor((now - deliveryDate) / (24 * 60 * 60 * 1000))
      res.status(400)
      throw new Error(`Return window expired. Return period was ${product.returnWindow} days from delivery. ${daysElapsed} days have passed since delivery.`)
    }
  }

  if (item.returnRequested || item.returnStatus === 'requested') {
    res.status(400)
    throw new Error('Return is already requested for this item')
  }

  item.returnRequested = true
  item.returnStatus = 'requested'
  item.returnReason = normalizedReasonText
  item.returnRequestedAt = new Date()
  item.returnProcessedAt = null

  await order.save()

  const mappedReason = mapReasonToReturnEnum(normalizedReasonText)
  const existingReturn = await Return.findOne({
    order: order._id,
    product: productId,
    user: req.user._id,
  })

  if (existingReturn) {
    existingReturn.orderItem = item.toObject ? item.toObject() : item
    existingReturn.seller = item.seller
    existingReturn.reason = mappedReason
    existingReturn.description = normalizedReasonText
    existingReturn.refundAmount = Number(item.price || 0) * Number(item.qty || 0)
    existingReturn.status = 'requested'
    existingReturn.requestedAt = new Date()
    existingReturn.approvedAt = null
    existingReturn.rejectedAt = null
    existingReturn.returnedAt = null
    existingReturn.refundedAt = null
    existingReturn.refundStatus = 'pending'
    await existingReturn.save()
  } else {
    await Return.create({
      order: order._id,
      orderItem: item.toObject ? item.toObject() : item,
      user: req.user._id,
      product: productId,
      seller: item.seller,
      reason: mappedReason,
      description: normalizedReasonText,
      images: [],
      refundAmount: Number(item.price || 0) * Number(item.qty || 0),
      status: 'requested',
      requestedAt: new Date(),
      refundStatus: 'pending',
    })
  }

  res.json({
    message: 'Return request submitted',
    orderId: order._id,
    productId,
    returnStatus: item.returnStatus,
  })
})

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400)
    throw new Error('Invalid order id')
  }

  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  if (String(order.user) !== String(req.user._id)) {
    res.status(403)
    throw new Error('Not authorized to cancel this order')
  }

  const lockedStatuses = new Set(['shipped', 'delivered', 'cancelled'])
  if (lockedStatuses.has(String(order.status || '').toLowerCase())) {
    res.status(400)
    throw new Error('This order can no longer be cancelled')
  }

  order.status = 'cancelled'
  (order.items || []).forEach((item) => {
    item.fulfillmentStatus = 'cancelled'
  })

  await Promise.all(
    (order.items || []).map(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: Number(item.qty) || 0 },
      })
    })
  )

  await order.save()

  res.json({ message: 'Order cancelled successfully', orderId: order._id, status: order.status })
})