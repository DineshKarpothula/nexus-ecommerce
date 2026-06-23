import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Product from '../models/Product.js'

dotenv.config()

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined,
  })

  const products = await Product.find({})
  let fixed = 0

  for (const product of products) {
    if (!Array.isArray(product.images) || product.images.length < 2) {
      continue
    }

    const first = String(product.images[0] || '').trim()
    const second = String(product.images[1] || '').trim()

    if (/^https?:\/\//i.test(first) && !/^https?:\/\//i.test(second)) {
      product.images = [
        `${first},${second}`,
        ...product.images.slice(2).map((value) => String(value || '').trim()).filter(Boolean),
      ]
      await product.save()
      fixed += 1
    }
  }

  console.log(`Fixed products: ${fixed}`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error('Failed to fix split image URLs', error)
  await mongoose.disconnect()
  process.exit(1)
})
