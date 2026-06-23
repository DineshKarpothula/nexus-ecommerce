import asyncHandler from 'express-async-handler'
import crypto from 'crypto'

// Mock payment intent — no real Stripe keys needed (demo/college project)
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body

  if (!amount || Number(amount) <= 0) {
    res.status(400)
    throw new Error('Valid amount is required')
  }

  const mockId = 'pi_mock_' + crypto.randomBytes(12).toString('hex')

  res.status(201).json({
    clientSecret: 'mock_secret_' + crypto.randomBytes(16).toString('hex'),
    paymentIntentId: mockId,
  })
})