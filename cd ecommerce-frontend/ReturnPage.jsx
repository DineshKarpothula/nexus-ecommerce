import { useEffect, useState } from 'react'
import Loader from './Loaders.jsx'
import { getUserReturns, requestReturn } from './api.js'

export default function ReturnPage() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [returnData, setReturnData] = useState({
    reason: '',
    description: '',
    images: [],
  })

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const res = await getUserReturns()
      setReturns(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load returns')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReturn = async (e) => {
    e.preventDefault()
    try {
      await requestReturn({
        orderId: selectedOrder.orderId,
        itemIndex: selectedOrder.itemIndex,
        ...returnData,
      })
      setShowReturnForm(false)
      setReturnData({ reason: '', description: '', images: [] })
      fetchReturns()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request return')
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-4xl uppercase">My Returns</h1>
          <button
            onClick={() => setShowReturnForm(true)}
            className="btn-primary px-5 py-2.5 uppercase text-sm"
          >
            + Request Return
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl mb-4 text-sm font-semibold" style={{ background: '#ffe4e6', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#9f1239' }}>
            {error}
          </div>
        )}

        {returns.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center" style={{ border: '3px solid #000', boxShadow: '5px 5px 0 #000' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No return requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => (
              <div key={ret._id} className="bg-white rounded-xl p-6" style={{ border: '3px solid #000', boxShadow: '5px 5px 0 #000' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase leading-tight">{ret.product?.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Order: {ret.order._id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    ret.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                    ret.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    ret.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`} style={{ border: '2px solid #000' }}>
                    {ret.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Reason</p>
                    <p className="font-medium">{ret.reason}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Refund Amount</p>
                    <p className="font-medium text-green-600">₹{ret.refundAmount}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Requested On</p>
                    <p className="font-medium">{new Date(ret.requestedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Refund Status</p>
                    <p className="font-medium">{ret.refundStatus}</p>
                  </div>
                </div>
                {ret.description && (
                  <div className="mt-4 pt-4" style={{ borderTop: '2px solid #000' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Description</p>
                    <p>{ret.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showReturnForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full p-6 rounded-2xl" style={{ background: '#fff', border: '4px solid #000', boxShadow: '8px 8px 0 #000' }}>
              <h2 className="font-display text-3xl uppercase mb-4">Request Return</h2>
              <form onSubmit={handleSubmitReturn}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <select
                      value={returnData.reason}
                      onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                      required
                    >
                      <option value="">Select reason</option>
                      <option value="defective">Defective Product</option>
                      <option value="notAsDescribed">Not As Described</option>
                      <option value="wrongItem">Wrong Item Received</option>
                      <option value="damageInShipping">Damaged in Shipping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={returnData.description}
                      onChange={(e) => setReturnData({ ...returnData, description: e.target.value })}
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                      rows="4"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary flex-1 py-2.5 uppercase text-sm"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReturnForm(false)}
                      className="btn-outline flex-1 py-2.5 uppercase text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
