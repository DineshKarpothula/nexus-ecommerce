import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

export const seedAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB()
  }

  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const existingAdmin = await User.findOne({ email })

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`)
    return
  }

  await User.create({
    name: process.env.ADMIN_NAME || 'Admin User',
    email,
    phone: process.env.ADMIN_PHONE || '9999999999',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  })

  console.log(`Admin created: ${email}`)
}

const isDirectRun = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)

if (isDirectRun) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to seed admin', error)
      process.exit(1)
    })
}