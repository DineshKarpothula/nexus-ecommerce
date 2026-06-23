import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Return from '../models/Return.js'
import { transferReturnRefund } from '../utils/refundWallet.js'

export const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 }).lean()
  res.json(products)
})

export const createSellerProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, originalPrice, stock, images, specifications, featured, returnable, returnWindow, replaceable } = req.body

  if (!name || !category || price === undefined || stock === undefined) {
    res.status(400)
    throw new Error('Name, category, price, and stock are required')
  }

  const product = await Product.create({
    seller: req.user._id,
    name,
    description,
    category,
    price: Number(price),
    originalPrice: Number(originalPrice) || 0,
    stock: Number(stock),
    images: Array.isArray(images) ? images : [],
    specifications: specifications || {},
    featured: Boolean(featured),
    returnable: Boolean(returnable),
    returnWindow: Math.max(1, Math.min(90, Number(returnWindow) || 7)),
    replaceable: Boolean(replaceable),
  })

  res.status(201).json(product)
})

export const updateSellerProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findOne({ _id: id, seller: req.user._id })

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const editableFields = [
    'name',
    'description',
    'category',
    'price',
    'originalPrice',
    'stock',
    'images',
    'specifications',
    'featured',
    'returnable',
    'returnWindow',
    'replaceable',
  ]

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field]
    }
  })

  if (req.body.price !== undefined) {
    product.price = Number(req.body.price)
  }

  if (req.body.originalPrice !== undefined) {
    product.originalPrice = Number(req.body.originalPrice)
  }

  if (req.body.stock !== undefined) {
    product.stock = Number(req.body.stock)
  }

  if (req.body.returnWindow !== undefined) {
    product.returnWindow = Math.max(1, Math.min(90, Number(req.body.returnWindow) || 7))
  }

  const updatedProduct = await product.save()
  res.json(updatedProduct)
})

export const deleteSellerProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findOne({ _id: id, seller: req.user._id })

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  await product.deleteOne()
  res.json({ message: 'Product deleted' })
})

export const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .lean()

  const response = orders.map((order) => {
    const sellerItems = (order.items || []).filter((item) => String(item.seller) === String(req.user._id))
    const sellerTotal = sellerItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0)

    return {
      _id: order._id,
      createdAt: order.createdAt,
      status: order.status,
      customer: order.user,
      address: order.address,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      sellerItems,
      sellerTotal,
    }
  })

  res.json(response)
})

export const shipOrderItem = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid order id or product id')
  }

  const order = await Order.findById(orderId)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  const item = order.items.find(
    (entry) => String(entry.product) === String(productId) && String(entry.seller) === String(req.user._id)
  )

  if (!item) {
    res.status(404)
    throw new Error('Order item not found for this seller')
  }

  item.fulfillmentStatus = 'shipped'

  const allShippedOrDelivered = order.items.every((entry) => ['shipped', 'delivered'].includes(entry.fulfillmentStatus))

  if (allShippedOrDelivered && ['pending', 'processing'].includes(order.status)) {
    order.status = 'shipped'
  }

  await order.save()

  res.json({
    message: 'Item marked as shipped',
    orderId: order._id,
    productId,
    itemStatus: item.fulfillmentStatus,
    orderStatus: order.status,
  })
})

export const deliverOrderItem = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid order id or product id')
  }

  const order = await Order.findById(orderId)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  const item = order.items.find(
    (entry) => String(entry.product) === String(productId) && String(entry.seller) === String(req.user._id)
  )

  if (!item) {
    res.status(404)
    throw new Error('Order item not found for this seller')
  }

  if (String(item.fulfillmentStatus || '').toLowerCase() === 'cancelled') {
    res.status(400)
    throw new Error('Cancelled item cannot be marked as delivered')
  }

  item.fulfillmentStatus = 'delivered'
  if (!item.deliveryDate) {
    item.deliveryDate = new Date()
  }

  const allDeliveredOrCancelled = order.items.every((entry) => ['delivered', 'cancelled'].includes(String(entry.fulfillmentStatus || '').toLowerCase()))
  if (allDeliveredOrCancelled) {
    order.status = 'delivered'
  }

  await order.save()

  res.json({
    message: 'Item marked as delivered',
    orderId: order._id,
    productId,
    itemStatus: item.fulfillmentStatus,
    orderStatus: order.status,
  })
})

export const updateReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params
  const { status } = req.body

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid order id or product id')
  }

  const allowedStatuses = new Set(['approved', 'rejected', 'completed'])
  const normalizedStatus = String(status || '').toLowerCase()
  if (!allowedStatuses.has(normalizedStatus)) {
    res.status(400)
    throw new Error('Invalid return status')
  }

  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  const item = order.items.find(
    (entry) => String(entry.product) === String(productId) && String(entry.seller) === String(req.user._id)
  )

  if (!item) {
    res.status(404)
    throw new Error('Order item not found for this seller')
  }

  if (!item.returnRequested && item.returnStatus !== 'requested') {
    res.status(400)
    throw new Error('No return request exists for this item')
  }

  item.returnStatus = normalizedStatus
  item.returnProcessedAt = new Date()
  if (normalizedStatus !== 'approved') {
    item.returnRequested = false
  }

  await order.save()

  const linkedReturn = await Return.findOne({
    order: order._id,
    product: productId,
    seller: req.user._id,
  }).sort({ createdAt: -1 })

  let refundSummary = null

  if (linkedReturn) {
    if (normalizedStatus === 'approved') {
      linkedReturn.status = 'approved'
      linkedReturn.approvedAt = new Date()
    } else if (normalizedStatus === 'rejected') {
      linkedReturn.status = 'rejected'
      linkedReturn.rejectedAt = new Date()
    } else if (normalizedStatus === 'completed') {
      if (linkedReturn.refundStatus !== 'processed') {
        refundSummary = await transferReturnRefund({
          buyerId: order.user,
          sellerId: req.user._id,
          amount: linkedReturn.refundAmount || Number(item.price || 0) * Number(item.qty || 0),
          orderId: order._id,
          productId,
          returnRequestId: linkedReturn._id,
        })
      }

      linkedReturn.status = 'received'
      linkedReturn.returnedAt = new Date()
      linkedReturn.refundStatus = 'processed'
      linkedReturn.refundedAt = new Date()
    }

    await linkedReturn.save()
  } else if (normalizedStatus === 'completed') {
    refundSummary = await transferReturnRefund({
      buyerId: order.user,
      sellerId: req.user._id,
      amount: Number(item.price || 0) * Number(item.qty || 0),
      orderId: order._id,
      productId,
      returnRequestId: null,
    })
  }

  res.json({
    message: `Return request ${normalizedStatus}`,
    orderId: order._id,
    productId,
    returnStatus: item.returnStatus,
    refund: refundSummary,
  })
})
