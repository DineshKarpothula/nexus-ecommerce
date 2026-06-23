import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'

import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import productRoutes from './routes/productRoutes.js'
import sellerRoutes from './routes/sellerRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import returnRoutes from './routes/returnRoutes.js'
import promotionRoutes from './routes/promotionRoutes.js'
import paymentMethodRoutes from './routes/paymentMethodRoutes.js'
import supportRoutes from './routes/supportRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

dotenv.config()

const app = express()

const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  'http://localhost:3000,https://nexus-ecommerceplatform-pzvh.vercel.app'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.includes(origin)) return true

  // Allow Vercel preview and production domains for this frontend project.
  return /^https:\/\/nexus-ecommerceplatform(-[a-z0-9]+)?\.vercel\.app$/i.test(origin)
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api', apiLimiter)

app.get('/api/health', (_req, res) => {
  res.json({ message: 'API is running', environment: process.env.NODE_ENV || 'development' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/seller', sellerRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/address', addressRoutes)
app.use('/api/returns', returnRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/payment-methods', paymentMethodRoutes)
app.use('/api/support', supportRoutes)

app.use(notFound)
app.use(errorHandler)

export default app