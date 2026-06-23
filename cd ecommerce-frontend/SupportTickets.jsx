import { useEffect, useState } from 'react'
import { getMyTickets, getTicket, addTicketMessage } from './api.js'
import toast from 'react-hot-toast'

export default function SupportTickets() {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    try {
      const res = await getMyTickets()
      setTickets(res.data)
    } catch (err) {
      toast.error('Failed to load tickets')
    }
  }

  useEffect(() => { load() }, [])

  const openTicket = async (id) => {
    try {
      const res = await getTicket(id)
      setSelected(res.data)
    } catch (err) {
      toast.error('Failed to load ticket')
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    try {
      await addTicketMessage(selected._id, { message })
      setMessage('')
      const res = await getTicket(selected._id)
      setSelected(res.data)
      load()
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl uppercase mb-6">My Support Tickets</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <button onClick={load} className="btn-outline mb-4 uppercase text-xs">Refresh</button>
          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t._id} className="p-3 bg-white rounded-xl" style={{ border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{t.subject}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <button onClick={() => openTicket(t._id)} className="btn-primary text-xs py-1.5 px-3 uppercase">Open</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {!selected && <div className="p-6 bg-white rounded-xl" style={{ border: '3px solid #000', boxShadow: '5px 5px 0 #000' }}>Select a ticket to view details</div>}
          {selected && (
            <div className="p-6 bg-white rounded-xl" style={{ border: '3px solid #000', boxShadow: '5px 5px 0 #000' }}>
              <h2 className="font-display text-2xl uppercase">{selected.subject}</h2>
              <div className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>Status: {selected.status}</div>
              <div className="space-y-4 mb-4">
                {selected.messages && selected.messages.map((m) => (
                  <div key={m._id} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '2px solid #000' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.sender?.name || 'You'} • {new Date(m.createdAt).toLocaleString('en-IN')}</div>
                    <div className="mt-1">{m.message}</div>
                  </div>
                ))}
              </div>
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid #000', color: 'var(--text-primary)' }}
                />
                <div className="mt-2">
                  <button onClick={sendMessage} className="btn-primary uppercase text-xs py-2 px-4">Send Message</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
