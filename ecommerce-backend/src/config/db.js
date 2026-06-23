import mongoose from 'mongoose'

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured')
  }

  mongoose.set('strictQuery', true)

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || undefined,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  })

  const { host, name } = mongoose.connection
  console.log(`MongoDB connected: ${host}/${name}`)
}

export default connectDB