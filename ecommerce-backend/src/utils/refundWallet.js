import User from '../models/User.js'

export const transferReturnRefund = async ({ buyerId, sellerId, amount, orderId, productId, returnRequestId }) => {
  const refundAmount = Number(amount || 0)
  if (refundAmount <= 0) {
    return { processed: false, reason: 'non_positive_amount' }
  }

  const [buyer, seller] = await Promise.all([
    User.findById(buyerId),
    User.findById(sellerId),
  ])

  if (!buyer) {
    throw new Error('Refund failed: buyer account not found')
  }

  buyer.walletBalance = Number(buyer.walletBalance || 0) + refundAmount
  buyer.walletTransactions.push({
    type: 'credit',
    amount: refundAmount,
    source: 'return_refund',
    note: 'Return refund credited to buyer wallet',
    order: orderId || null,
    product: productId || null,
    returnRequest: returnRequestId || null,
  })

  if (seller) {
    seller.walletBalance = Number(seller.walletBalance || 0) - refundAmount
    seller.walletTransactions.push({
      type: 'debit',
      amount: refundAmount,
      source: 'return_refund',
      note: 'Return refund debited from seller wallet',
      order: orderId || null,
      product: productId || null,
      returnRequest: returnRequestId || null,
    })
    await seller.save()
  }

  await buyer.save()

  return {
    processed: true,
    buyerWalletBalance: buyer.walletBalance,
    sellerWalletBalance: seller ? seller.walletBalance : null,
  }
}
