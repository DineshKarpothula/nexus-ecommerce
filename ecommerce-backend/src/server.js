import dotenv from 'dotenv'

import app from './app.js'
import connectDB from './config/db.js'
import { seedAdmin } from './scripts/seedAdmin.js'

dotenv.config()

const port = Number(process.env.PORT) || 5000

const startServer = async () => {
  await connectDB()
  await seedAdmin()
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})