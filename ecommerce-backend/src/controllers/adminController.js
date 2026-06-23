import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean()

  res.json(orders)
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid order id')
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  if (!validStatuses.includes(status)) {
    res.status(400)
    throw new Error('Invalid order status')
  }

  const order = await Order.findById(id)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  order.status = status
  
  // If marking entire order as delivered, also update individual items
  if (status === 'delivered') {
    order.items.forEach((item) => {
      if (item.fulfillmentStatus !== 'cancelled') {
        item.fulfillmentStatus = 'delivered'
        item.deliveryDate = new Date()
      }
    })
  }
  
  await order.save()
  res.json(order)
})

export const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { itemIndex, status } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid order id')
  }

  const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled']

  if (!validStatuses.includes(status)) {
    res.status(400)
    throw new Error('Invalid order item status')
  }

  const order = await Order.findById(id)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  const item = order.items[itemIndex]
  if (!item) {
    res.status(404)
    throw new Error('Order item not found')
  }

  item.fulfillmentStatus = status
  
  // Set delivery date when marking as delivered
  if (status === 'delivered' && !item.deliveryDate) {
    item.deliveryDate = new Date()
  }

  await order.save()
  res.json(order)
})

export const getAllUsers = asyncHandler(async (_req, res) => {
  const orderCounts = await Order.aggregate([
    { $group: { _id: '$user', orders: { $sum: 1 } } },
  ])

  const orderMap = new Map(orderCounts.map((entry) => [String(entry._id), entry.orders]))
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean()
  const response = users.map((user) => ({
    ...user,
    orders: orderMap.get(String(user._id)) || 0,
  }))

  res.json(response)
})

export const getPendingSellers = asyncHandler(async (_req, res) => {
  const sellers = await User.find({ role: 'seller', sellerApprovalStatus: 'pending' })
    .select('-password')
    .sort({ sellerRequestedAt: -1, createdAt: -1 })
    .lean()

  res.json(sellers)
})

export const approveSeller = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid seller id')
  }

  const seller = await User.findOne({ _id: id, role: 'seller' })

  if (!seller) {
    res.status(404)
    throw new Error('Seller not found')
  }

  seller.sellerApprovalStatus = 'approved'
  seller.sellerApprovedAt = new Date()
  await seller.save()

  res.json({ message: 'Seller approved', sellerId: seller._id, status: seller.sellerApprovalStatus })
})

export const rejectSeller = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid seller id')
  }

  const seller = await User.findOne({ _id: id, role: 'seller' })

  if (!seller) {
    res.status(404)
    throw new Error('Seller not found')
  }

  seller.sellerApprovalStatus = 'rejected'
  seller.sellerApprovedAt = null
  await seller.save()

  res.json({ message: 'Seller rejected', sellerId: seller._id, status: seller.sellerApprovalStatus })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid user id')
  }

  if (String(req.user._id) === id) {
    res.status(400)
    throw new Error('Admin cannot delete the current logged in account')
  }

  const user = await User.findById(id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  await user.deleteOne()
  res.json({ message: 'User deleted' })
})

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueResult, recentOrders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]),
    Order.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(5).lean(),
  ])

  res.json({
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
  })
})

export const getReturnAnalytics = asyncHandler(async (_req, res) => {
  const orders = await Order.find({}).select('items').lean()

  let totalItems = 0
  let returnRequested = 0
  let approved = 0
  let rejected = 0
  let completed = 0

  orders.forEach((order) => {
    ;(order.items || []).forEach((item) => {
      totalItems += 1
      const status = String(item.returnStatus || 'none').toLowerCase()
      if (status === 'requested') returnRequested += 1
      if (status === 'approved') approved += 1
      if (status === 'rejected') rejected += 1
      if (status === 'completed') completed += 1
    })
  })

  const totalReturns = returnRequested + approved + rejected + completed
  const returnRate = totalItems > 0 ? Number(((totalReturns / totalItems) * 100).toFixed(2)) : 0
  const approvalRate = totalReturns > 0 ? Number((((approved + completed) / totalReturns) * 100).toFixed(2)) : 0

  res.json({
    totalItems,
    totalReturns,
    returnRate,
    approvalRate,
    statusCounts: {
      requested: returnRequested,
      approved,
      rejected,
      completed,
    },
  })
})

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Math.max(Number(req.query.threshold) || 5, 0)

  const products = await Product.find({ stock: { $lte: threshold } })
    .select('name category stock price seller createdAt')
    .populate('seller', 'name sellerBusinessName email')
    .sort({ stock: 1, updatedAt: -1 })
    .limit(20)
    .lean()

  res.json({ threshold, count: products.length, products })
})