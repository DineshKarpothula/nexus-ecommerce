import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized, token missing')
  }

  const token = authorization.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      res.status(401)
      throw new Error('Not authorized, user not found')
    }

    next()
  } catch (error) {
    res.status(401)
    throw new Error('Not authorized, token invalid')
  }
})

export const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Admin access required')
  }

  next()
}

export const sellerApproved = (req, res, next) => {
  if (!req.user || req.user.role !== 'seller') {
    res.status(403)
    throw new Error('Seller access required')
  }

  if (req.user.sellerApprovalStatus !== 'approved') {
    res.status(403)
    throw new Error('Seller account is not approved yet')
  }

  next()
}