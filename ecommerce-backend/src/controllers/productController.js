import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

import Order from '../models/Order.js'
import Product from '../models/Product.js'

const buildSort = (sort) => {
  switch (sort) {
    case 'price_asc':
      return { price: 1 }
    case 'price_desc':
      return { price: -1 }
    case 'rating':
      return { rating: -1, numReviews: -1 }
    case 'popular':
      return { popularity: -1, createdAt: -1 }
    default:
      return { createdAt: -1 }
  }
}

export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100)
  const category = req.query.category
  const search = req.query.search || req.query.q
  const minPrice = Number(req.query.minPrice)
  const maxPrice = Number(req.query.maxPrice)
  const rating = Number(req.query.rating)

  const filters = {}

  if (category) {
    filters.category = category
  }

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ]
  }

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    filters.price = {}
    if (!Number.isNaN(minPrice)) {
      filters.price.$gte = minPrice
    }
    if (!Number.isNaN(maxPrice)) {
      filters.price.$lte = maxPrice
    }
  }

  if (!Number.isNaN(rating) && rating > 0) {
    filters.rating = { $gte: rating }
  }

  const totalProducts = await Product.countDocuments(filters)
  const products = await Product.find(filters)
    .populate('seller', 'name sellerBusinessName email')
    .sort(buildSort(req.query.sort))
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  res.json({
    products,
    totalPages: Math.max(Math.ceil(totalProducts / limit), 1),
    currentPage: page,
    totalProducts,
  })
})

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findById(id).populate('seller', 'name sellerBusinessName email').lean()

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  res.json(product)
})

export const getFeaturedProducts = asyncHandler(async (_req, res) => {
  let products = await Product.find({ featured: true })
    .populate('seller', 'name sellerBusinessName email')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean()

  if (products.length === 0) {
    products = await Product.find({})
      .populate('seller', 'name sellerBusinessName email')
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .lean()
  }

  res.json(products)
})

export const searchProducts = asyncHandler(async (req, res) => {
  const query = req.query.q || ''
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
  })
    .populate('seller', 'name sellerBusinessName email')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  res.json(products)
})

export const proxyProductImage = asyncHandler(async (req, res) => {
  const rawUrl = String(req.query.url || '').trim()

  if (!rawUrl) {
    res.status(400)
    throw new Error('Image URL is required')
  }

  let target
  try {
    target = new URL(rawUrl)
  } catch {
    res.status(400)
    throw new Error('Invalid image URL')
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    res.status(400)
    throw new Error('Only http/https image URLs are supported')
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      Referer: target.origin,
    },
  })

  if (!upstream.ok) {
    res.status(502)
    throw new Error('Unable to fetch seller image URL')
  }

  const contentType = upstream.headers.get('content-type') || ''
  if (!contentType.toLowerCase().startsWith('image/')) {
    res.status(415)
    throw new Error('Provided URL is not an image')
  }

  const imageBuffer = Buffer.from(await upstream.arrayBuffer())
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.send(imageBuffer)
})

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    originalPrice,
    stock,
    images,
    specifications,
    featured,
    returnable,
    returnWindow,
    replaceable,
  } = req.body

  if (!name || !category || price === undefined || stock === undefined) {
    res.status(400)
    throw new Error('Name, category, price, and stock are required')
  }

  const product = await Product.create({
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

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findById(id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const editableFields = [
    'name',
    'description',
    'category',
    'images',
    'specifications',
    'featured',
    'rating',
    'numReviews',
    'reviews',
    'returnable',
    'returnWindow',
    'replaceable',
  ]

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field]
    }
  })

  // Handle numeric fields with explicit conversion
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

export const addProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rating, comment } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const numericRating = Number(rating)
  if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400)
    throw new Error('Rating must be between 1 and 5')
  }

  const product = await Product.findById(id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const hasPurchasedProduct = await Order.exists({
    user: req.user._id,
    status: 'delivered',
    items: {
      $elemMatch: {
        product: product._id,
      },
    },
  })

  if (!hasPurchasedProduct) {
    res.status(403)
    throw new Error('Only users with delivered orders can review this product')
  }

  const existingReviewIndex = (product.reviews || []).findIndex(
    (review) => String(review.user) === String(req.user._id)
  )

  const payload = {
    user: req.user._id,
    name: req.user.name,
    rating: numericRating,
    comment: String(comment || '').trim(),
    date: new Date(),
  }

  if (existingReviewIndex >= 0) {
    product.reviews[existingReviewIndex] = payload
  } else {
    product.reviews.push(payload)
  }

  product.numReviews = product.reviews.length
  const totalRating = product.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
  product.rating = product.numReviews ? totalRating / product.numReviews : 0

  await product.save()

  res.status(201).json({
    message: 'Review submitted successfully',
    rating: product.rating,
    numReviews: product.numReviews,
    reviews: product.reviews,
  })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findById(id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  await product.deleteOne()
  res.json({ message: 'Product deleted' })
})