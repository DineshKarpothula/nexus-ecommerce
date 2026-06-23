import asyncHandler from 'express-async-handler'
import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'

// Get user wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
    'items.product'
  )

  if (!wishlist) {
    return res.status(200).json({ items: [] })
  }

  res.status(200).json(wishlist.items)
})

// Add to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id })

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      items: [
        {
          product: productId,
          priceAtAddTime: product.price,
        },
      ],
    })
  } else {
    const itemExists = wishlist.items.find(
      (item) => item.product.toString() === productId
    )
    if (itemExists) {
      res.status(400)
      throw new Error('Product already in wishlist')
    }
    wishlist.items.push({
      product: productId,
      priceAtAddTime: product.price,
    })
    await wishlist.save()
  }

  res.status(201).json(wishlist)
})

// Remove from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const wishlist = await Wishlist.findOne({ user: req.user.id })
  if (!wishlist) {
    res.status(404)
    throw new Error('Wishlist not found')
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  )
  await wishlist.save()

  res.status(200).json(wishlist)
})

// Check if product in wishlist
export const isInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const wishlist = await Wishlist.findOne({ user: req.user.id })
  if (!wishlist) {
    return res.status(200).json({ inWishlist: false })
  }

  const inWishlist = wishlist.items.some(
    (item) => item.product.toString() === productId
  )

  res.status(200).json({ inWishlist })
})

// Get wishlist count
export const getWishlistCount = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id })
  const count = wishlist?.items?.length || 0

  res.status(200).json({ count })
})

// Enable price drop notifications
export const enablePriceDropNotification = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const wishlist = await Wishlist.findOne({ user: req.user.id })
  if (!wishlist) {
    res.status(404)
    throw new Error('Wishlist not found')
  }

  const item = wishlist.items.find(
    (item) => item.product.toString() === productId
  )
  if (!item) {
    res.status(404)
    throw new Error('Product not in wishlist')
  }

  item.notifyOnDrop = true
  item.priceDropNotified = false
  await wishlist.save()

  res.status(200).json(item)
})
