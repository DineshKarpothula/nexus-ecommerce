import { useEffect, useState } from 'react'
import Loader from './Loaders.jsx'
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from './api.js'

export default function AddressBookDrawer({ isOpen, onClose, onSelectAddress }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    label: 'Home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    if (isOpen) fetchAddresses()
  }, [isOpen])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const res = await getAddresses()
      setAddresses(res.data)
    } catch (err) {
      console.error('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateAddress(editingId, formData)
      } else {
        await addAddress(formData)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({ label: 'Home', name: '', phone: '', street: '', city: '', state: '', pincode: '' })
      fetchAddresses()
    } catch (err) {
      console.error('Failed to save address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      try {
        await deleteAddress(addressId)
        fetchAddresses()
      } catch (err) {
        console.error('Failed to delete address')
      }
    }
  }

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId)
      fetchAddresses()
    } catch (err) {
      console.error('Failed to set default')
    }
  }

  return (
    <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-lg transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-40`}>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">My Addresses</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <Loader />
          ) : addresses.length === 0 ? (
            <p className="text-center text-gray-500">No addresses added yet</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">{addr.label}</div>
                    {addr.isDefault && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600">{addr.name} • {addr.phone}</p>
                  <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                  <p className="text-sm text-gray-600">{addr.state} - {addr.pincode}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => onSelectAddress && onSelectAddress(addr)}
                      className="flex-1 text-blue-600 hover:bg-blue-50 py-1 text-sm font-medium rounded"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(addr.id)
                        setFormData(addr)
                        setShowForm(true)
                      }}
                      className="flex-1 text-gray-600 hover:bg-gray-100 py-1 text-sm font-medium rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="flex-1 text-red-600 hover:bg-red-50 py-1 text-sm font-medium rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ label: 'Home', name: '', phone: '', street: '', city: '', state: '', pincode: '' })
          }}
          className="w-full bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 border-t"
        >
          + Add New Address
        </button>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-lg p-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit' : 'Add'} Address</h3>
              <form onSubmit={handleSaveAddress} className="space-y-3">
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
