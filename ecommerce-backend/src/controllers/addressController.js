import asyncHandler from 'express-async-handler'
import AddressBook from '../models/AddressBook.js'

// Get user addresses
export const getAddresses = asyncHandler(async (req, res) => {
  let addressBook = await AddressBook.findOne({ user: req.user.id })

  if (!addressBook) {
    addressBook = await AddressBook.create({
      user: req.user.id,
      addresses: [],
    })
  }

  res.status(200).json(addressBook.addresses)
})

// Add address
export const addAddress = asyncHandler(async (req, res) => {
  const { label, name, phone, street, city, state, pincode } = req.body

  if (!label || !name || !phone || !street || !city || !state || !pincode) {
    res.status(400)
    throw new Error('All address fields are required')
  }

  let addressBook = await AddressBook.findOne({ user: req.user.id })

  if (!addressBook) {
    addressBook = await AddressBook.create({
      user: req.user.id,
      addresses: [],
    })
  }

  const newAddress = {
    label,
    name,
    phone,
    street,
    city,
    state,
    pincode,
    isDefault: addressBook.addresses.length === 0,
  }

  addressBook.addresses.push(newAddress)
  await addressBook.save()

  res.status(201).json(newAddress)
})

// Update address
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params
  const { label, name, phone, street, city, state, pincode } = req.body

  const addressBook = await AddressBook.findOne({ user: req.user.id })
  if (!addressBook) {
    res.status(404)
    throw new Error('Address book not found')
  }

  const address = addressBook.addresses.find((addr) => addr.id === addressId)
  if (!address) {
    res.status(404)
    throw new Error('Address not found')
  }

  if (label) address.label = label
  if (name) address.name = name
  if (phone) address.phone = phone
  if (street) address.street = street
  if (city) address.city = city
  if (state) address.state = state
  if (pincode) address.pincode = pincode

  await addressBook.save()

  res.status(200).json(address)
})

// Delete address
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params

  const addressBook = await AddressBook.findOne({ user: req.user.id })
  if (!addressBook) {
    res.status(404)
    throw new Error('Address book not found')
  }

  const addressIndex = addressBook.addresses.findIndex(
    (addr) => addr.id === addressId
  )
  if (addressIndex === -1) {
    res.status(404)
    throw new Error('Address not found')
  }

  addressBook.addresses.splice(addressIndex, 1)

  // If deleted address was default and there are other addresses, set first as default
  if (addressBook.addresses.length > 0) {
    addressBook.addresses[0].isDefault = true
  }

  await addressBook.save()

  res.status(200).json({ message: 'Address deleted', addresses: addressBook.addresses })
})

// Set default address
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params

  const addressBook = await AddressBook.findOne({ user: req.user.id })
  if (!addressBook) {
    res.status(404)
    throw new Error('Address book not found')
  }

  addressBook.addresses.forEach((addr) => {
    addr.isDefault = addr.id === addressId
  })

  await addressBook.save()

  res.status(200).json(addressBook.addresses)
})
