import mongoose from 'mongoose'

const sellerAnalyticsSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: {
      total: {
        type: Number,
        default: 0,
      },
      active: {
        type: Number,
        default: 0,
      },
      inactive: {
        type: Number,
        default: 0,
      },
    },
    sales: {
      totalRevenue: {
        type: Number,
        default: 0,
      },
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalItems: {
        type: Number,
        default: 0,
      },
      averageOrderValue: {
        type: Number,
        default: 0,
      },
    },
    performance: {
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      returnRate: {
        type: Number,
        default: 0,
      },
      cancellationRate: {
        type: Number,
        default: 0,
      },
      deliveryOnTimeRate: {
        type: Number,
        default: 0,
      },
    },
    inventory: {
      totalStockValue: {
        type: Number,
        default: 0,
      },
      lowStockItems: {
        type: Number,
        default: 0,
      },
      outOfStockItems: {
        type: Number,
        default: 0,
      },
    },
    payouts: {
      totalEarnings: {
        type: Number,
        default: 0,
      },
      totalPaid: {
        type: Number,
        default: 0,
      },
      pendingPayout: {
        type: Number,
        default: 0,
      },
      lastPayoutDate: {
        type: Date,
        default: null,
      },
    },
    dailyMetrics: [
      {
        date: {
          type: Date,
          required: true,
        },
        orders: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        visitors: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const SellerAnalytics = mongoose.model('SellerAnalytics', sellerAnalyticsSchema)

export default SellerAnalytics
