import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: "Nigeria"
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: String,
        price: Number,
        image: String,
        quantity: Number
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      default: "Pending"
    },
     paymentReference: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);