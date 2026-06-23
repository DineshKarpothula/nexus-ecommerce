import mongoose from 'mongoose'

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['card', 'upi', 'wallet'],
      required: true,
    },
    cardDetails: {
      lastFourDigits: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
      holderName: String,
    },
    upiDetails: {
      id: String,
      verified: {
        type: Boolean,
        default: false,
      },
    },
    walletDetails: {
      provider: String,
      balance: {
        type: Number,
        default: 0,
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    stripePaymentMethodId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema)

export default PaymentMethod
