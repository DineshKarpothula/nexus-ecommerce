import mongoose from 'mongoose'

const addressBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addresses: [
      {
        id: {
          type: String,
          unique: true,
          default: () => new mongoose.Types.ObjectId().toString(),
        },
        label: {
          type: String,
          enum: ['Home', 'Work', 'Other'],
          default: 'Home',
        },
        name: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        pincode: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const AddressBook = mongoose.model('AddressBook', addressBookSchema)

export default AddressBook
