import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'seller'],
      default: 'user',
    },
    sellerApprovalStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'approved', 'rejected'],
      default: 'not_applicable',
    },
    sellerBusinessName: {
      type: String,
      trim: true,
      default: '',
    },
    sellerRequestedAt: {
      type: Date,
      default: null,
    },
    sellerApprovedAt: {
      type: Date,
      default: null,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    walletTransactions: {
      type: [
        {
          type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          source: {
            type: String,
            enum: ['return_refund', 'manual_adjustment'],
            default: 'return_refund',
          },
          note: {
            type: String,
            default: '',
            trim: true,
          },
          order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
          },
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
          },
          returnRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Return',
            default: null,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next()
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User