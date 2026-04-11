import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },

  cart: [
  {
    productId: mongoose.Schema.Types.ObjectId,
    quantity: Number
  }
],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number
    }
  ]
}, { timestamps: true });

export default mongoose.model('User', userSchema);