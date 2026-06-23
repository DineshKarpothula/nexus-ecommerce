import asyncHandler from 'express-async-handler'
import PaymentMethod from '../models/PaymentMethod.js'

// Get user payment methods
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = await PaymentMethod.find({ user: req.user.id })

  res.status(200).json(paymentMethods)
})

// Add payment method
export const addPaymentMethod = asyncHandler(async (req, res) => {
  const { type, cardDetails, upiDetails, walletDetails } = req.body

  if (!type || !['card', 'upi', 'wallet'].includes(type)) {
    res.status(400)
    throw new Error('Invalid payment method type')
  }

  // Check if this is the first payment method
  const existingMethods = await PaymentMethod.find({ user: req.user.id })
  const isDefault = existingMethods.length === 0

  const paymentMethod = await PaymentMethod.create({
    user: req.user.id,
    type,
    cardDetails: type === 'card' ? cardDetails : undefined,
    upiDetails: type === 'upi' ? upiDetails : undefined,
    walletDetails: type === 'wallet' ? walletDetails : undefined,
    isDefault,
  })

  res.status(201).json(paymentMethod)
})

// Set default payment method
export const setDefaultPaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethodId } = req.params

  const paymentMethod = await PaymentMethod.findById(paymentMethodId)
  if (!paymentMethod) {
    res.status(404)
    throw new Error('Payment method not found')
  }

  if (paymentMethod.user.toString() !== req.user.id) {
    res.status(403)
    throw new Error('Not authorized')
  }

  // Remove default from all other methods
  await PaymentMethod.updateMany(
    { user: req.user.id, _id: { $ne: paymentMethodId } },
    { isDefault: false }
  )

  paymentMethod.isDefault = true
  await paymentMethod.save()

  res.status(200).json(paymentMethod)
})

// Delete payment method
export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethodId } = req.params

  const paymentMethod = await PaymentMethod.findById(paymentMethodId)
  if (!paymentMethod) {
    res.status(404)
    throw new Error('Payment method not found')
  }

  if (paymentMethod.user.toString() !== req.user.id) {
    res.status(403)
    throw new Error('Not authorized')
  }

  const wasDefault = paymentMethod.isDefault

  await PaymentMethod.findByIdAndDelete(paymentMethodId)

  // If deleted method was default, set another as default
  if (wasDefault) {
    const firstMethod = await PaymentMethod.findOne({ user: req.user.id })
    if (firstMethod) {
      firstMethod.isDefault = true
      await firstMethod.save()
    }
  }

  res.status(200).json({ message: 'Payment method deleted' })
})
