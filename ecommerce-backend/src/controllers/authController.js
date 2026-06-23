import asyncHandler from 'express-async-handler'

import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

const buildAuthResponse = (user) => ({
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    sellerApprovalStatus: user.sellerApprovalStatus,
    sellerBusinessName: user.sellerBusinessName,
    walletBalance: Number(user.walletBalance || 0),
    createdAt: user.createdAt,
  },
  token: generateToken(user._id, user.role),
})

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, registerAsSeller, sellerBusinessName, accountType, role } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email, and password are required')
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() })

  if (existingUser) {
    res.status(400)
    throw new Error('User already exists')
  }

  const requestedType = String(accountType || role || '').toLowerCase()
  const asSeller = Boolean(registerAsSeller) || requestedType === 'seller'

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: asSeller ? 'seller' : 'user',
    sellerApprovalStatus: asSeller ? 'pending' : 'not_applicable',
    sellerBusinessName: asSeller ? String(sellerBusinessName || '').trim() : '',
    sellerRequestedAt: asSeller ? new Date() : null,
    sellerApprovedAt: null,
  })

  if (asSeller) {
    res.status(201).json({
      message: 'Seller registration submitted. Admin approval is required before login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerApprovalStatus: user.sellerApprovalStatus,
      },
    })
    return
  }

  res.status(201).json(buildAuthResponse(user))
})

export const requestSellerApproval = asyncHandler(async (req, res) => {
  const { sellerBusinessName } = req.body

  if (req.user.role === 'admin') {
    res.status(400)
    throw new Error('Admin account cannot request seller access')
  }

  if (req.user.role === 'seller' && req.user.sellerApprovalStatus === 'approved') {
    res.status(400)
    throw new Error('Seller account is already approved')
  }

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  user.role = 'seller'
  user.sellerApprovalStatus = 'pending'
  user.sellerRequestedAt = new Date()
  user.sellerApprovedAt = null
  if (sellerBusinessName !== undefined) {
    user.sellerBusinessName = String(sellerBusinessName || '').trim()
  }

  await user.save()

  res.json({
    message: 'Seller request submitted. Wait for admin approval.',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      sellerApprovalStatus: user.sellerApprovalStatus,
      sellerBusinessName: user.sellerBusinessName,
      createdAt: user.createdAt,
    },
  })
})

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Email and password are required')
  }

  const user = await User.findOne({ email: email.toLowerCase() })

  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (user.role === 'seller' && user.sellerApprovalStatus !== 'approved') {
    res.status(403)
    throw new Error('Seller account is pending admin approval')
  }

  res.json(buildAuthResponse(user))
})

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    sellerApprovalStatus: req.user.sellerApprovalStatus,
    sellerBusinessName: req.user.sellerBusinessName,
    walletBalance: Number(req.user.walletBalance || 0),
    createdAt: req.user.createdAt,
  })
})