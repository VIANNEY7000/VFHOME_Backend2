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
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        image: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        }
      }
    ],

    totalPrice: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    paymentReference: {
      type: String,
      default: ""
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Ready for Pickup", "Delivered", "Cancelled"],
      default: "Pending"
    },

    isPaid: {
      type: Boolean,
      default: false
    },

    paidAt: {
      type: Date
    },

    deliveredAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);