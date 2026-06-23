import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Order from '../models/Order.js'

dotenv.config()

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined,
  })

  const filter = {
    'items.name': {
      $regex: 's24\\s*ultra',
      $options: 'i',
    },
  }

  const matches = await Order.find(filter)
    .select('_id user status items.name totalAmount createdAt')
    .lean()

  console.log('Matching orders before delete:', JSON.stringify(matches, null, 2))

  const result = await Order.deleteMany(filter)
  console.log('Deleted orders:', result.deletedCount || 0)

  const remaining = await Order.find(filter).select('_id').lean()
  console.log('Remaining matches:', JSON.stringify(remaining, null, 2))

  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error('Failed to delete legacy S24 orders', error)
  await mongoose.disconnect()
  process.exit(1)
})
