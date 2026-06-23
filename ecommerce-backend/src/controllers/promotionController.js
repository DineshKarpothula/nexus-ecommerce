import asyncHandler from 'express-async-handler'
import Promotion from '../models/Promotion.js'

// Create promotion (admin/seller)
export const createPromotion = asyncHandler(async (req, res) => {
  const {
    type,
    name,
    code,
    description,
    discountValue,
    minOrderValue,
    maxDiscount,
    applicableProducts,
    applicableCategories,
    usageLimit,
    perUserLimit,
    startDate,
    endDate,
  } = req.body

  if (!name || !type || !discountValue || !startDate || !endDate) {
    res.status(400)
    throw new Error('Required fields missing')
  }

  if (new Date(endDate) <= new Date(startDate)) {
    res.status(400)
    throw new Error('End date must be after start date')
  }

  const promotion = await Promotion.create({
    creator: req.user.id,
    type,
    name,
    code: code?.toUpperCase(),
    description,
    discountValue,
    minOrderValue,
    maxDiscount,
    applicableProducts,
    applicableCategories,
    usageLimit,
    perUserLimit,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  })

  res.status(201).json(promotion)
})

// Get all active promotions
export const getActivePromotions = asyncHandler(async (req, res) => {
  const now = new Date()

  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate('applicableProducts', 'name price')
    .populate('applicableSellers', 'name')

  res.status(200).json(promotions)
})

// Get promotions by creator
export const getPromotionsByCreator = asyncHandler(async (req, res) => {
  const promotions = await Promotion.find({ creator: req.user.id })
    .sort({ createdAt: -1 })
    .populate('applicableProducts', 'name')

  res.status(200).json(promotions)
})

// Validate promotion code
export const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body

  const promotion = await Promotion.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  })

  if (!promotion) {
    res.status(404)
    throw new Error('Invalid or expired promotion code')
  }

  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    res.status(400)
    throw new Error('Promotion code usage limit reached')
  }

  if (cartTotal < promotion.minOrderValue) {
    res.status(400)
    throw new Error(
      `Minimum order value is ₹${promotion.minOrderValue} for this promotion`
    )
  }

  // Calculate discount
  let discount = 0
  if (promotion.type === 'percentage') {
    discount = (cartTotal * promotion.discountValue) / 100
  } else if (promotion.type === 'flat') {
    discount = promotion.discountValue
  }

  res.status(200).json({
    valid: true,
    discount,
    finalTotal: cartTotal - discount,
    promotion: {
      code: promotion.code,
      type: promotion.type,
      discountValue: promotion.discountValue,
    },
  })
})

// Update promotion
export const updatePromotion = asyncHandler(async (req, res) => {
  const { promotionId } = req.params

  const promotion = await Promotion.findById(promotionId)
  if (!promotion) {
    res.status(404)
    throw new Error('Promotion not found')
  }

  if (promotion.creator.toString() !== req.user.id) {
    res.status(403)
    throw new Error('Not authorized')
  }

  const allowedFields = [
    'name',
    'description',
    'discountValue',
    'minOrderValue',
    'maxDiscount',
    'applicableProducts',
    'applicableCategories',
    'endDate',
    'isActive',
    'priority',
  ]

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      promotion[field] = req.body[field]
    }
  })

  await promotion.save()

  res.status(200).json(promotion)
})

// Delete promotion
export const deletePromotion = asyncHandler(async (req, res) => {
  const { promotionId } = req.params

  const promotion = await Promotion.findById(promotionId)
  if (!promotion) {
    res.status(404)
    throw new Error('Promotion not found')
  }

  if (promotion.creator.toString() !== req.user.id) {
    res.status(403)
    throw new Error('Not authorized')
  }

  await Promotion.findByIdAndDelete(promotionId)

  res.status(200).json({ message: 'Promotion deleted' })
})
