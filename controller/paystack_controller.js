import axios from "axios";
import { Order } from "../models/order_model.js";

// Initialize Payment
export const initializePayment = async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount, callback_url: "http://localhost:5173/payment-success", metadata },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" } }
    );

    res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error("PAYSTACK INIT ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
};

// Verify Payment
import User from "../models/User.js";
import { Order } from "../models/order_model.js";
import axios from "axios";

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful"
      });
    }

    const orderId = data.metadata.orderId;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "No orderId in metadata"
      });
    }

    // 🔥 FIND ORDER
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // 🔥 UPDATE ORDER
    order.paymentStatus = "Paid";
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentReference = reference;

    await order.save();

    // 🔥 CLEAR CART (IMPORTANT)
    await User.findByIdAndUpdate(order.userId, {
      $set: { cart: [] }
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and order updated",
      order
    });

  } catch (error) {
    console.error("PAYSTACK VERIFY ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};

