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
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number
    }
  ],

  wishlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }
],

}, { timestamps: true });

export default mongoose.model('User', userSchema);