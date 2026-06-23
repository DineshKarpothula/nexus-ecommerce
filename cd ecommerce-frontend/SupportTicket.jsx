import { useState } from 'react'
import { createTicket } from './api.js'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function SupportTicket() {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim()) return toast.error('Please add a subject')
    setLoading(true)
    try {
      await createTicket({ subject, description })
      toast.success('Ticket created')
      navigate('/support/my')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass p-6 rounded-2xl">
        <h1 className="font-display text-4xl uppercase mb-2">Contact Support</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Raise a ticket and our team will get back to you quickly.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <button type="submit" className="btn-primary px-5 py-2.5 uppercase text-sm" disabled={loading}>
            {loading ? 'Sending...' : 'Send Ticket'}
          </button>
        </div>
        </form>
      </div>
    </div>
  )
}
